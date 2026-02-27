import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { useAppStore } from '../store';
import type { SavedReport } from '../types';
import { TEMPLATE_FIELDS, CENTROS_SALUD } from '../data/templates';

type StoreType = ReturnType<typeof useAppStore>;

export function ReportsView({ store }: { store: StoreType }) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTemplate, setFilterTemplate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

  const isAdmin = store.currentUser?.role === 'administrador';
  const isCoord = store.currentUser?.role === 'coordinador';
  const canDownload = isAdmin || isCoord;
  const hasGlobalView = isAdmin || isCoord;

  const statusColors: Record<string, string> = {
    borrador: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    aprobado: 'bg-green-500/20 text-green-400 border-green-500/30',
    enviado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const statusLabels: Record<string, string> = {
    borrador: 'Borrador',
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    enviado: 'Enviado',
  };

  // Use getVisibleReports - admin sees all, others see only their own
  const visibleReports = store.getVisibleReports();

  const filteredReports = visibleReports.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterTemplate !== 'all' && r.templateId !== filterTemplate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.templateName.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q) ||
        r.config.asic?.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate totals across all visible reports
  const calculateTotals = (reportsToTotal: SavedReport[]) => {
    const totals: Record<string, number> = {};
    reportsToTotal.forEach(report => {
      Object.entries(report.data).forEach(([key, value]) => {
        const numVal = typeof value === 'number' ? value : Number(value) || 0;
        totals[key] = (totals[key] || 0) + numVal;
      });
    });
    return totals;
  };

  // Admin export: all filtered reports totalized
  const exportTotalizedReport = () => {
    if (!canDownload) return;

    const wb = XLSX.utils.book_new();
    const wsData: (string | number)[][] = [];

    wsData.push(['VICEMINISTERIO DE REDES DE ATENCIÓN AMBULATORIA DE SALUD']);
    wsData.push(['DIRECCIÓN GENERAL DE GESTIÓN PARA LA SALUD COMUNAL']);
    wsData.push(['REPORTE TOTALIZADO - MEDIREPORT']);
    wsData.push([`Fecha de generación: ${new Date().toLocaleString('es-VE')}`]);
    wsData.push([`Total de reportes incluidos: ${filteredReports.length}`]);
    wsData.push([]);

    // Individual reports detail
    wsData.push(['DETALLE DE REPORTES INCLUIDOS']);
    wsData.push(['#', 'PLANTILLA', 'CENTRO/ASIC', 'PERÍODO', 'CREADO POR', 'ESTADO', 'TOTAL']);

    filteredReports.forEach((report, idx) => {
      const reportTotal = Object.values(report.data).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
      wsData.push([
        idx + 1,
        report.templateName,
        `${CENTROS_SALUD.find(c => c.value === report.config.centro)?.label || report.config.centro} / ${report.config.asic}`,
        `${report.config.fechaInicio} a ${report.config.fechaFin}`,
        report.createdBy,
        statusLabels[report.status] || report.status,
        reportTotal
      ]);
    });

    wsData.push([]);
    wsData.push([]);

    // Totalized data
    wsData.push(['DATOS TOTALIZADOS']);
    wsData.push(['INDICADOR', 'TOTAL ACUMULADO']);

    const totals = calculateTotals(filteredReports);
    const sortedTotals = Object.entries(totals).sort(([, a], [, b]) => b - a);
    sortedTotals.forEach(([key, value]) => {
      wsData.push([key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value]);
    });

    wsData.push([]);
    const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);
    wsData.push(['GRAN TOTAL GENERAL', grandTotal]);

    // Per-template totals
    wsData.push([]);
    wsData.push(['TOTALES POR TIPO DE REPORTE']);
    const templateGroups: Record<string, SavedReport[]> = {};
    filteredReports.forEach(r => {
      if (!templateGroups[r.templateName]) templateGroups[r.templateName] = [];
      templateGroups[r.templateName].push(r);
    });

    wsData.push(['PLANTILLA', 'CANTIDAD DE REPORTES', 'TOTAL ACUMULADO']);
    Object.entries(templateGroups).forEach(([name, reps]) => {
      const total = reps.reduce((sum, r) =>
        sum + Object.values(r.data).reduce((s: number, v) => s + (Number(v) || 0), 0), 0);
      wsData.push([name, reps.length, total]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 45 }, { wch: 30 }, { wch: 40 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }
    ];
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Totalizado');

    // Individual sheets per template type
    Object.entries(templateGroups).forEach(([name, reps]) => {
      const sheetData: (string | number)[][] = [];
      sheetData.push([`REPORTE TOTALIZADO - ${name.toUpperCase()}`]);
      sheetData.push([`Reportes incluidos: ${reps.length}`]);
      sheetData.push([]);

      const templateFields = TEMPLATE_FIELDS[reps[0].templateId] || [];
      const groupTotals = calculateTotals(reps);

      if (templateFields.length > 0) {
        templateFields.forEach(section => {
          sheetData.push([section.label.toUpperCase()]);
          sheetData.push(['INDICADOR', 'TOTAL']);
          section.fields.forEach(field => {
            sheetData.push([field.label, groupTotals[field.key] || 0]);
          });
          sheetData.push([]);
        });
      } else {
        sheetData.push(['INDICADOR', 'TOTAL']);
        Object.entries(groupTotals).forEach(([key, val]) => {
          sheetData.push([key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), val]);
        });
      }

      const sectionTotal = Object.values(groupTotals).reduce((s, v) => s + v, 0);
      sheetData.push(['TOTAL GENERAL', sectionTotal]);

      const sheetWs = XLSX.utils.aoa_to_sheet(sheetData);
      sheetWs['!cols'] = [{ wch: 45 }, { wch: 20 }];
      const safeSheetName = name.substring(0, 31).replace(/[\\/*?[\]]/g, '');
      XLSX.utils.book_append_sheet(wb, sheetWs, safeSheetName);
    });

    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    XLSX.writeFile(wb, `MEDIREPORT_TOTALIZADO_${dateStr}.xlsx`);
  };

  // Admin: export single report
  const exportSingleReport = (report: SavedReport) => {
    if (!canDownload) return;

    const wb = XLSX.utils.book_new();
    const wsData: (string | number)[][] = [];
    const templateFields = TEMPLATE_FIELDS[report.templateId] || [];

    wsData.push(['VICEMINISTERIO DE REDES DE ATENCIÓN AMBULATORIA DE SALUD']);
    wsData.push(['DIRECCIÓN GENERAL DE GESTIÓN PARA LA SALUD COMUNAL']);
    wsData.push([`REPORTE: ${report.templateName}`]);
    wsData.push([]);
    wsData.push(['FECHA', 'ESTADO', 'MUNICIPIO', 'PARROQUIA', 'ESTABLECIMIENTO', 'ASIC']);
    wsData.push([
      `${report.config.fechaInicio} - ${report.config.fechaFin}`,
      report.config.estado,
      report.config.municipio,
      report.config.parroquia,
      CENTROS_SALUD.find(c => c.value === report.config.centro)?.label || report.config.centro,
      report.config.asic
    ]);
    wsData.push([`Creado por: ${report.createdBy}`]);
    wsData.push([]);

    templateFields.forEach(section => {
      wsData.push([section.label.toUpperCase()]);
      wsData.push(['INDICADOR', 'VALOR']);
      section.fields.forEach(field => {
        wsData.push([field.label, Number(report.data[field.key] || 0)]);
      });
      wsData.push([]);
    });

    if (templateFields.length === 0) {
      wsData.push(['INDICADOR', 'VALOR']);
      Object.entries(report.data).forEach(([key, val]) => {
        wsData.push([key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), Number(val) || 0]);
      });
      wsData.push([]);
    }

    const total = Object.values(report.data).reduce((sum: number, val) => sum + (Number(val) || 0), 0);
    wsData.push(['TOTAL GENERAL', total]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 35 }, { wch: 20 }];
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Oficial');
    XLSX.writeFile(wb, `REPORTE_${report.templateId.toUpperCase()}_${report.id}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Normalized Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
        <div>
          <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">
            {filteredReports.length} reportes encontrados
            {hasGlobalView && <span className="text-blue-400/60 ml-2">({isAdmin ? 'Admin' : 'Coord'})</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canDownload && filteredReports.length > 0 && (
            <button
              onClick={exportTotalizedReport}
              className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-green-600/20 hover:scale-105 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar ({filteredReports.length})
            </button>
          )}
          <button
            onClick={store.startWizard}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-blue-600/20 hover:scale-105 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Reporte
          </button>
        </div>
      </div>

      {/* Totals summary for admin and coordinador */}
      {hasGlobalView && filteredReports.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600/10 via-blue-700/5 to-transparent border border-blue-500/15 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Resumen Totalizado
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="text-lg font-bold">{filteredReports.length}</div>
              <div className="text-[10px] text-white/30">Reportes</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="text-lg font-bold text-green-400">{filteredReports.filter(r => r.status === 'aprobado' || r.status === 'enviado').length}</div>
              <div className="text-[10px] text-white/30">Completados</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="text-lg font-bold text-yellow-400">{filteredReports.filter(r => r.status === 'pendiente').length}</div>
              <div className="text-[10px] text-white/30">Pendientes</div>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3">
              <div className="text-lg font-bold text-blue-400 font-mono">
                {Object.values(calculateTotals(filteredReports)).reduce((s, v) => s + v, 0).toLocaleString('es-VE')}
              </div>
              <div className="text-[10px] text-white/30">Gran Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, creador, ASIC..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/25"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition appearance-none"
          >
            <option value="all" className="bg-[#1f2937]">Todos los estados</option>
            <option value="borrador" className="bg-[#1f2937]">Borradores</option>
            <option value="pendiente" className="bg-[#1f2937]">Pendientes</option>
            <option value="aprobado" className="bg-[#1f2937]">Aprobados</option>
            <option value="enviado" className="bg-[#1f2937]">Enviados</option>
          </select>
          <select
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition appearance-none"
          >
            <option value="all" className="bg-[#1f2937]">Todas las plantillas</option>
            <option value="rac_nacional" className="bg-[#1f2937]">Matriz RAC Nacional</option>
            <option value="emergencias_cdi" className="bg-[#1f2937]">Estadísticas por Especialidad</option>
            <option value="asic_consolidado" className="bg-[#1f2937]">Indicadores ASIC</option>
            <option value="resumen_semanal" className="bg-[#1f2937]">Resumen Semanal CDI</option>
            <option value="actividades_diarias" className="bg-[#1f2937]">Actividades Diarias MBA</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map(report => (
          <div
            key={report.id}
            className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${report.templateId === 'rac_nacional' ? 'bg-blue-500/15' :
                  report.templateId === 'emergencias_cdi' ? 'bg-red-500/15' :
                    report.templateId === 'asic_consolidado' ? 'bg-green-500/15' :
                      report.templateId === 'resumen_semanal' ? 'bg-purple-500/15' :
                        'bg-yellow-500/15'
                  }`}>
                  {report.templateId === 'rac_nacional' ? '📊' :
                    report.templateId === 'emergencias_cdi' ? '🏥' :
                      report.templateId === 'asic_consolidado' ? '📈' :
                        report.templateId === 'resumen_semanal' ? '📅' : '📝'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold truncate">{report.templateName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[report.status]}`}>
                      {statusLabels[report.status]}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mb-1">
                    {report.config.asic?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ·{' '}
                    Periodo: {report.config.fechaInicio} a {report.config.fechaFin}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/30">
                    <span>Creado por: {report.createdBy || report.createdByUserId}</span>
                    <span>·</span>
                    <span>{new Date(report.createdAt).toLocaleString('es-VE')}</span>
                    {report.approvedBy && (
                      <>
                        <span>·</span>
                        <span className="text-green-400/60">Aprobado por: {report.approvedBy}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition"
                >
                  {selectedReport?.id === report.id ? 'Ocultar' : 'Ver Detalles'}
                </button>
                {/* Only admin and coordinador can download */}
                {canDownload && (
                  <button
                    onClick={() => exportSingleReport(report)}
                    className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/20 rounded-lg text-xs font-medium text-green-400 transition"
                  >
                    Descargar Excel
                  </button>
                )}
                {report.status === 'pendiente' && isAdmin && (
                  <button
                    onClick={() => store.updateReportStatus(report.id, 'aprobado')}
                    className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-lg text-xs font-medium text-blue-400 transition"
                  >
                    Aprobar
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {selectedReport?.id === report.id && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-3 py-2 text-[11px] text-white/40 font-medium uppercase">Indicador</th>
                        <th className="text-right px-3 py-2 text-[11px] text-white/40 font-medium uppercase">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(report.data).map(([key, value]) => (
                        <tr key={key} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          <td className="px-3 py-2 text-xs text-white/60">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td className="px-3 py-2 text-xs text-white font-mono text-right font-medium">
                            {typeof value === 'number' ? value.toLocaleString('es-VE') : value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-blue-600/10">
                        <td className="px-3 py-2 text-xs font-bold text-blue-400">TOTAL</td>
                        <td className="px-3 py-2 text-xs font-bold text-blue-400 font-mono text-right">
                          {Object.values(report.data).reduce((sum: number, val) => sum + (Number(val) || 0), 0).toLocaleString('es-VE')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="text-center py-16 bg-[#111827]/60 border border-white/5 rounded-2xl">
            <svg className="w-16 h-16 mx-auto text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-white/30 text-lg font-medium mb-2">No se encontraron reportes</p>
            <p className="text-white/20 text-sm">
              {hasGlobalView ? 'No hay reportes en el sistema con los filtros seleccionados' : 'No tiene reportes creados. Cree uno nuevo para comenzar.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
