import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { useAppStore } from '../store';
import { REPORT_TEMPLATES, CENTROS_SALUD, ASIC_OPTIONS, ESPECIALIDADES, TEMPLATE_FIELDS, ROLE_PERMISSIONS } from '../data/templates';
import type { WizardStep } from '../types';

type StoreType = ReturnType<typeof useAppStore>;

export function ReportWizard({ store }: { store: StoreType }) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(0);

  const step = store.wizardStep;
  const selectedTemplate = REPORT_TEMPLATES.find(t => t.id === store.selectedTemplateId);

  // Filter templates by user role
  const availableTemplates = useMemo(() => {
    if (!store.currentUser) return [];
    const permissions = ROLE_PERMISSIONS[store.currentUser.role];
    return REPORT_TEMPLATES.filter(t => permissions.reportTemplates.includes(t.id));
  }, [store.currentUser]);

  const templateFields = store.selectedTemplateId ? TEMPLATE_FIELDS[store.selectedTemplateId] || [] : [];

  // Auto-save simulation
  const simulateAutoSave = () => {
    setAutoSaveTimer(30);
    const interval = setInterval(() => {
      setAutoSaveTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFieldChange = (key: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    store.setReportData({ ...store.reportData, [key]: isNaN(numValue) ? 0 : numValue });
    if (autoSaveTimer === 0) simulateAutoSave();
  };

  const validateStep3 = (): boolean => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (store.selectedTemplateId === 'rac_nacional') {
      const data = store.reportData;
      const totalF = Number(data['pacientes_femeninos'] || 0);
      const totalM = Number(data['pacientes_masculinos'] || 0);
      const totalConsultas = Number(data['total_consultas_rac'] || 0);

      if (totalConsultas === 0) {
        errors.push('El total de consultas RAC no puede ser cero');
      }
      if (totalF + totalM > 0 && totalConsultas > 0 && totalF + totalM !== totalConsultas) {
        warnings.push(`La suma de pacientes femeninos (${totalF}) y masculinos (${totalM}) no coincide con el total de consultas (${totalConsultas})`);
      }
      const defunciones = Number(data['defunciones'] || 0);
      if (defunciones > 2) {
        warnings.push(`Las defunciones reportadas (${defunciones}) superan el umbral normal (2). Verifique los datos.`);
      }
    }

    // Check if at least some data is entered
    const hasData = Object.values(store.reportData).some(v => Number(v) > 0);
    if (!hasData) {
      errors.push('Debe ingresar al menos un valor en el formulario');
    }

    setValidationErrors(errors);
    setValidationWarnings(warnings);
    return errors.length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: string[] = [];
    if (!store.reportConfig.centro) errors.push('Seleccione un centro de salud');
    if (!store.reportConfig.asic) errors.push('Seleccione un ASIC');
    if (!store.reportConfig.fechaInicio) errors.push('Ingrese la fecha de inicio');
    if (!store.reportConfig.fechaFin) errors.push('Ingrese la fecha de fin');
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !store.selectedTemplateId) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step < 4) {
      store.setWizardStep((step + 1) as WizardStep);
      setValidationErrors([]);
      setValidationWarnings([]);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      store.setWizardStep((step - 1) as WizardStep);
      setValidationErrors([]);
      setValidationWarnings([]);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData: (string | number)[][] = [];

    // Official MPPS header
    wsData.push(['VICEMINISTERIO DE REDES DE ATENCIÓN AMBULATORIA DE SALUD']);
    wsData.push(['DIRECCIÓN GENERAL DE GESTIÓN PARA LA SALUD COMUNAL']);
    wsData.push([`REPORTE: ${selectedTemplate?.name || 'Sin nombre'}`]);
    wsData.push([]);
    wsData.push(['FECHA', 'ESTADO', 'MUNICIPIO', 'PARROQUIA', 'ESTABLECIMIENTO', 'ASIC']);
    wsData.push([
      `${store.reportConfig.fechaInicio} - ${store.reportConfig.fechaFin}`,
      store.reportConfig.estado || 'ARAGUA',
      store.reportConfig.municipio || 'SANTIAGO MARIÑO',
      store.reportConfig.parroquia || 'SAMAN DE GÜERE',
      CENTROS_SALUD.find(c => c.value === store.reportConfig.centro)?.label || store.reportConfig.centro,
      ASIC_OPTIONS.find(a => a.value === store.reportConfig.asic)?.label || store.reportConfig.asic
    ]);
    wsData.push([]);

    // Section data
    templateFields.forEach(section => {
      wsData.push([section.label.toUpperCase()]);
      wsData.push(['INDICADOR', 'VALOR']);
      section.fields.forEach(field => {
        wsData.push([field.label, Number(store.reportData[field.key] || 0)]);
      });
      wsData.push([]);
    });

    // Calculate totals
    const totalValues = Object.values(store.reportData).reduce((sum: number, val) => sum + (typeof val === 'number' ? val : Number(val) || 0), 0);
    wsData.push(['TOTAL GENERAL', totalValues]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 35 }, { wch: 20 }
    ];

    // Merge header cells
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Oficial');

    const asicName = store.reportConfig.asic?.replace(/_/g, '_').toUpperCase() || 'ASIC';
    const dateStr = store.reportConfig.fechaInicio?.replace(/-/g, '') || new Date().toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `REPORTE_${selectedTemplate?.id?.toUpperCase()}_${asicName}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleSave = (status: 'borrador' | 'pendiente' | 'enviado') => {
    store.saveReport(status);
  };

  const frequencyBadgeColors: Record<string, string> = {
    diario: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    semanal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    mensual: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {([1, 2, 3, 4] as WizardStep[]).map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${s < step ? 'bg-blue-600 border-blue-600 text-white' :
                  s === step ? 'bg-blue-600/20 border-blue-500 text-blue-400' :
                    'bg-white/5 border-white/10 text-white/30'
                }`}>
                {s < step ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{s}</span>
                )}
              </div>
              {s < 4 && (
                <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${s < step ? 'bg-blue-600' : 'bg-white/10'
                  }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-white/40">
          <span className={step >= 1 ? 'text-blue-400' : ''}>Plantilla</span>
          <span className={step >= 2 ? 'text-blue-400' : ''}>Configuración</span>
          <span className={step >= 3 ? 'text-blue-400' : ''}>Datos</span>
          <span className={step >= 4 ? 'text-blue-400' : ''}>Revisión</span>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-red-400">Errores de Validación</span>
          </div>
          <ul className="space-y-1">
            {validationErrors.map((err, i) => (
              <li key={i} className="text-xs text-red-300/70 flex items-center gap-2">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationWarnings.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-semibold text-yellow-400">Advertencias</span>
          </div>
          <ul className="space-y-1">
            {validationWarnings.map((warn, i) => (
              <li key={i} className="text-xs text-yellow-300/70 flex items-center gap-2">
                <span className="w-1 h-1 bg-yellow-400 rounded-full" />
                {warn}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8">
        {/* STEP 1: Template Selection */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Seleccionar Plantilla de Reporte</h2>
              <p className="text-sm text-white/40">Elija la plantilla que corresponda al tipo de reporte que desea generar</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => store.setSelectedTemplateId(template.id)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${store.selectedTemplateId === template.id
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }`}
                >
                  {/* Template preview */}
                  <div className="h-28 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${template.color}15, ${template.color}05)` }}>
                    <span className="text-4xl">
                      {template.id === 'rac_nacional' ? '📊' :
                        template.id === 'emergencias_cdi' ? '🏥' :
                          template.id === 'asic_consolidado' ? '📈' :
                            template.id === 'resumen_semanal' ? '📅' :
                              '📝'}
                    </span>
                    {store.selectedTemplateId === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${frequencyBadgeColors[template.frequency]}`}>
                        {template.frequency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  <p className="text-xs text-white/40 line-clamp-2 mb-3">{template.description}</p>
                  <div className="text-[10px] text-white/25">
                    {template.sections.length} secciones · Archivo: {template.sourceFile.substring(0, 30)}...
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Configuration */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Configuración del Reporte</h2>
              <p className="text-sm text-white/40">
                Plantilla seleccionada: <span className="text-blue-400 font-medium">{selectedTemplate?.name}</span>
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Centro de Salud / CDI *</label>
                <select
                  value={store.reportConfig.centro}
                  onChange={(e) => store.setReportConfig({ ...store.reportConfig, centro: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition appearance-none"
                >
                  <option value="" className="bg-[#1f2937]">Seleccionar centro...</option>
                  {CENTROS_SALUD.map(c => (
                    <option key={c.value} value={c.value} className="bg-[#1f2937]">{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">ASIC *</label>
                <select
                  value={store.reportConfig.asic}
                  onChange={(e) => store.setReportConfig({ ...store.reportConfig, asic: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition appearance-none"
                >
                  <option value="" className="bg-[#1f2937]">Seleccionar ASIC...</option>
                  {ASIC_OPTIONS.map(a => (
                    <option key={a.value} value={a.value} className="bg-[#1f2937]">{a.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Estado</label>
                <input
                  type="text"
                  value={store.reportConfig.estado}
                  onChange={(e) => store.setReportConfig({ ...store.reportConfig, estado: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="ARAGUA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Municipio</label>
                <input
                  type="text"
                  value={store.reportConfig.municipio}
                  onChange={(e) => store.setReportConfig({ ...store.reportConfig, municipio: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="SANTIAGO MARIÑO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Parroquia</label>
                <input
                  type="text"
                  value={store.reportConfig.parroquia}
                  onChange={(e) => store.setReportConfig({ ...store.reportConfig, parroquia: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="SAMAN DE GÜERE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Especialidad Médica</label>
                <select
                  value={store.reportConfig.especialidad}
                  onChange={(e) => store.setReportConfig({ ...store.reportConfig, especialidad: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition appearance-none"
                >
                  {ESPECIALIDADES.map(e => (
                    <option key={e.value} value={e.value} className="bg-[#1f2937]">{e.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Fecha de Inicio *</label>
                <input
                  type="date"
                  value={store.reportConfig.fechaInicio}
                  onChange={(e) => store.setReportConfig({ ...store.reportConfig, fechaInicio: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Fecha de Fin *</label>
                <input
                  type="date"
                  value={store.reportConfig.fechaFin}
                  onChange={(e) => store.setReportConfig({ ...store.reportConfig, fechaFin: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Data Entry */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Ingreso de Datos</h2>
                <p className="text-sm text-white/40">{selectedTemplate?.name} · Campos con validación en tiempo real</p>
              </div>
              {autoSaveTimer > 0 && (
                <div className="flex items-center gap-2 text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-full">
                  <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Autoguardado en {autoSaveTimer}s
                </div>
              )}
            </div>

            <div className="space-y-8">
              {templateFields.map((section, sectionIdx) => (
                <div key={section.section}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-sm font-bold">
                      {sectionIdx + 1}
                    </div>
                    <h3 className="text-lg font-semibold">{section.label}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.fields.map(field => (
                      <div key={field.key} className="relative">
                        <label className="block text-xs font-medium text-white/50 mb-1.5 flex items-center gap-1">
                          {field.label}
                          {field.tooltip && (
                            <button
                              type="button"
                              className="text-blue-400/50 hover:text-blue-400 transition"
                              onMouseEnter={() => setShowTooltip(field.key)}
                              onMouseLeave={() => setShowTooltip(null)}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                        </label>
                        {showTooltip === field.key && field.tooltip && (
                          <div className="absolute z-20 bottom-full left-0 mb-1 px-3 py-2 bg-[#1f2937] border border-white/10 rounded-lg text-[11px] text-white/70 max-w-[200px] shadow-xl">
                            {field.tooltip}
                            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#1f2937] border-r border-b border-white/10 rotate-45" />
                          </div>
                        )}
                        <input
                          type="number"
                          min="0"
                          value={store.reportData[field.key] || ''}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder="0"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    ))}
                  </div>
                  {sectionIdx < templateFields.length - 1 && (
                    <div className="mt-6 h-px bg-white/5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Review & Export */}
        {step === 4 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Revisión Final del Reporte</h2>
              <p className="text-sm text-white/40">Verifique los datos antes de exportar</p>
            </div>

            {/* Report Meta */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Plantilla</div>
                <div className="text-sm font-semibold text-blue-400">{selectedTemplate?.name}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Periodo</div>
                <div className="text-sm font-semibold">{store.reportConfig.fechaInicio} — {store.reportConfig.fechaFin}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Centro / ASIC</div>
                <div className="text-sm font-semibold truncate">
                  {CENTROS_SALUD.find(c => c.value === store.reportConfig.centro)?.label || store.reportConfig.centro}
                </div>
              </div>
            </div>

            {/* Data Preview Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden mb-8">
              <div className="p-4 border-b border-white/5 bg-blue-600/10">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                  Datos del Reporte - Formato Oficial MPPS
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-3 text-xs text-white/50 font-medium uppercase">Sección</th>
                      <th className="text-left px-4 py-3 text-xs text-white/50 font-medium uppercase">Indicador</th>
                      <th className="text-right px-4 py-3 text-xs text-white/50 font-medium uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateFields.map(section => (
                      section.fields.map((field, idx) => {
                        const value = store.reportData[field.key];
                        if (!value && Number(value) !== 0) return null;
                        return (
                          <tr key={field.key} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                            {idx === 0 && (
                              <td className="px-4 py-2.5 text-xs text-blue-400/70 font-medium" rowSpan={section.fields.length}>
                                {section.label}
                              </td>
                            )}
                            <td className="px-4 py-2.5 text-sm text-white/70">{field.label}</td>
                            <td className="px-4 py-2.5 text-sm text-white font-mono text-right font-medium">
                              {Number(value || 0).toLocaleString('es-VE')}
                            </td>
                          </tr>
                        );
                      })
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-600/10">
                      <td colSpan={2} className="px-4 py-3 text-sm font-bold text-blue-400">TOTAL GENERAL</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-400 font-mono text-right">
                        {Object.values(store.reportData).reduce((sum: number, val) => sum + (Number(val) || 0), 0).toLocaleString('es-VE')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Export Options */}
            <div className={`grid gap-4 ${(store.currentUser?.role === 'administrador' || store.currentUser?.role === 'coordinador') ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {(store.currentUser?.role === 'administrador' || store.currentUser?.role === 'coordinador') && (
                <button
                  onClick={exportToExcel}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-xl font-semibold transition-all shadow-lg shadow-green-600/20 hover:shadow-green-500/30 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar a Excel (MPPS)
                </button>
              )}
              <button
                onClick={() => handleSave('enviado')}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar Reporte
              </button>
              <button
                onClick={() => handleSave('borrador')}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Guardar Borrador
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={step === 1 ? () => store.setCurrentView('dashboard') : prevStep}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {step === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {step < 4 && (
          <button
            onClick={nextStep}
            disabled={step === 1 && !store.selectedTemplateId}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-medium transition shadow-lg shadow-blue-600/20 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Siguiente
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
