import type { ReportTemplate } from '../types';

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'rac_nacional',
    name: 'Matriz RAC Nacional',
    description: 'Reporte oficial del MPPS para Red de Atención Comunal. Incluye registro de población atendida por grupo etario, actividad RAC, atención pediátrica, adulta, obstétrica, planificación familiar, despistajes y enfermedades crónicas.',
    sourceFile: 'DEF MATRIZ DE INDICADORES RAC NACIONAL DICIEMBRE 3(2).xls',
    sections: [
      'registro_poblacion',
      'actividad_rac',
      'atencion_pediatrica',
      'atencion_adulto',
      'atencion_obstetrica',
      'planificacion_familiar',
      'despistajes',
      'enfermedades_cronicas'
    ],
    requiredRoles: ['administrador', 'doctor'],
    frequency: 'semanal',
    icon: 'ClipboardList',
    color: '#3B82F6'
  },
  {
    id: 'emergencias_cdi',
    name: 'Estadísticas por Especialidad',
    description: 'Reporte mensual de emergencias y consultas por especialidad médica del CDI. Incluye emergencias diarias, consultas por especialidad, RX realizados, odontología y sala de rehabilitación.',
    sourceFile: 'ESTADISTICAS POR ESPECIALIDAD AÑO 2026.xls',
    sections: [
      'emergencias_diarias',
      'consultas_por_especialidad',
      'rx_realizados',
      'odontologia',
      'sala_rehabilitacion'
    ],
    requiredRoles: ['administrador', 'doctor', 'enfermero'],
    frequency: 'mensual',
    icon: 'Activity',
    color: '#EF4444'
  },
  {
    id: 'asic_consolidado',
    name: 'Indicadores ASIC Consolidado',
    description: 'Reporte consolidado semanal por ASIC según formato MPPS. Incluye indicadores de salud, actividades comunitarias, atención domiciliaria y jornadas de salud.',
    sourceFile: 'ASIC CONSOLIDADO INDICADORES DE SALUD ARAGUA (1)..2.xls',
    sections: [
      'indicadores_salud',
      'actividades_comunitarias',
      'atencion_domiciliaria',
      'jornadas_salud'
    ],
    requiredRoles: ['administrador'],
    frequency: 'semanal',
    icon: 'BarChart3',
    color: '#10B981'
  },
  {
    id: 'resumen_semanal',
    name: 'Resumen Semanal CDI',
    description: 'Reporte semanal de actividades del Centro de Diagnóstico Integral. Incluye actividades semanales, atención pediátrica, obstétrica, despistajes y sala de rehabilitación.',
    sourceFile: 'RESUMEN SEMANAL DICIEMBRE 2025 (version 1).45.xls',
    sections: [
      'actividades_semanales',
      'atencion_pediatrica',
      'atencion_obstetrica',
      'despistajes',
      'sala_rehabilitacion'
    ],
    requiredRoles: ['administrador', 'doctor', 'enfermero'],
    frequency: 'semanal',
    icon: 'Calendar',
    color: '#8B5CF6'
  },
  {
    id: 'actividades_diarias',
    name: 'Actividades Diarias MBA',
    description: 'Reporte diario de actividades de la Misión Barrio Adentro. Incluye emergencias de adultos y pediátricas, atención al adulto mayor, inmunizaciones y exámenes de laboratorio.',
    sourceFile: 'ARAGUA_ACTIVIDADES_DIARIAS_MISION_BARRIO_ADENTRO_NUEVO FORMATO RED(2)(2).xls',
    sections: [
      'emergencias_adultos',
      'emergencias_pediatricas',
      'atencion_adulto_mayor',
      'inmunizaciones',
      'examenes_laboratorio'
    ],
    requiredRoles: ['administrador', 'doctor', 'enfermero'],
    frequency: 'diario',
    icon: 'FileText',
    color: '#F59E0B'
  }
];

export const CENTROS_SALUD = [
  { value: 'saman_guere', label: 'CDI Saman de Güere - Ernesto Che Guevara de la Serna' },
  { value: 'cooperativa', label: 'CDI La Cooperativa' },
  { value: 'maracay_centro', label: 'CDI Maracay Centro' },
  { value: 'cagua', label: 'CDI Cagua' },
  { value: 'turmero', label: 'CDI Turmero' },
  { value: 'villa_cura', label: 'CDI Villa de Cura' },
  { value: 'la_victoria', label: 'CDI La Victoria' },
  { value: 'el_limon', label: 'CDI El Limón' },
  { value: 'santa_rita', label: 'CDI Santa Rita' },
  { value: 'palo_negro', label: 'CDI Palo Negro' },
];

export const ASIC_OPTIONS = [
  { value: 'saman_guere', label: 'ASIC Saman de Güere' },
  { value: 'cooperativa', label: 'ASIC La Cooperativa' },
  { value: 'maracay_norte', label: 'ASIC Maracay Norte' },
  { value: 'maracay_sur', label: 'ASIC Maracay Sur' },
  { value: 'cagua', label: 'ASIC Cagua' },
  { value: 'turmero', label: 'ASIC Turmero' },
  { value: 'villa_cura', label: 'ASIC Villa de Cura' },
  { value: 'la_victoria', label: 'ASIC La Victoria' },
  { value: 'el_limon', label: 'ASIC El Limón' },
  { value: 'santa_rita', label: 'ASIC Santa Rita' },
  { value: 'palo_negro', label: 'ASIC Palo Negro' },
  { value: 'san_mateo', label: 'ASIC San Mateo' },
  { value: 'santa_cruz', label: 'ASIC Santa Cruz de Aragua' },
  { value: 'el_consejo', label: 'ASIC El Consejo' },
];

export const ESPECIALIDADES = [
  { value: '', label: 'Todas las especialidades' },
  { value: 'cirugia', label: 'Cirugía' },
  { value: 'ginecologia', label: 'Ginecología y Obstetricia' },
  { value: 'odontologia', label: 'Odontología' },
  { value: 'pediatria', label: 'Pediatría' },
  { value: 'medicina_interna', label: 'Medicina Interna' },
  { value: 'traumatologia', label: 'Traumatología' },
  { value: 'oftalmologia', label: 'Oftalmología' },
  { value: 'dermatologia', label: 'Dermatología' },
  { value: 'cardiologia', label: 'Cardiología' },
  { value: 'rehabilitacion', label: 'Sala de Rehabilitación Integral' },
  { value: 'endoscopia', label: 'Endoscopia' },
  { value: 'ecografia', label: 'Ecografía' },
];

export const TEMPLATE_FIELDS: Record<string, { section: string; label: string; fields: { key: string; label: string; tooltip?: string }[] }[]> = {
  'rac_nacional': [
    {
      section: 'registro_poblacion',
      label: 'Registro de Población Atendida',
      fields: [
        { key: 'primera_infancia_0_5', label: 'Primera Infancia (0-5 años)', tooltip: 'Población atendida en el rango de 0 a 5 años' },
        { key: 'infancia_6_11', label: 'Infancia (6-11 años)', tooltip: 'Población atendida en el rango de 6 a 11 años' },
        { key: 'adolescencia_12_17', label: 'Adolescencia (12-17 años)', tooltip: 'Población atendida en el rango de 12 a 17 años' },
        { key: 'juventud_18_25', label: 'Juventud (18-25 años)', tooltip: 'Población atendida en el rango de 18 a 25 años' },
        { key: 'adulto_26_59', label: 'Adulto (26-59 años)', tooltip: 'Población atendida en el rango de 26 a 59 años' },
        { key: 'adulto_mayor_60', label: 'Adulto Mayor (60+ años)', tooltip: 'Población atendida de 60 años en adelante' },
        { key: 'pacientes_femeninos', label: 'Total Pacientes Femeninos' },
        { key: 'pacientes_masculinos', label: 'Total Pacientes Masculinos' },
      ]
    },
    {
      section: 'actividad_rac',
      label: 'Actividad RAC',
      fields: [
        { key: 'total_consultas_rac', label: 'Total de Consultas RAC', tooltip: 'Total de consultas realizadas en la Red de Atención Comunal' },
        { key: 'defunciones', label: 'Defunciones', tooltip: 'Número de defunciones registradas en el periodo' },
        { key: 'emergencias', label: 'Emergencias', tooltip: 'Total de emergencias atendidas' },
        { key: 'vidas_salvadas', label: 'Vidas Salvadas', tooltip: 'Número de vidas salvadas en emergencias' },
        { key: 'examenes_laboratorio', label: 'Exámenes de Laboratorio Realizados' },
        { key: 'rx_realizados', label: 'RX Realizados' },
        { key: 'electrocardiograma', label: 'Electrocardiogramas Realizados' },
        { key: 'densitometria_osea', label: 'Densitometría Ósea Realizadas' },
      ]
    },
    {
      section: 'inmunizaciones',
      label: 'Inmunizaciones',
      fields: [
        { key: 'vacunas_colocadas', label: 'Vacunas Colocadas', tooltip: 'Total de vacunas colocadas' },
        { key: 'pacientes_inmunizados', label: 'Pacientes Inmunizados', tooltip: 'Total de pacientes inmunizados' },
      ]
    },
    {
      section: 'planificacion_familiar',
      label: 'Planificación Familiar y Despistajes',
      fields: [
        { key: 'planificacion_familiar', label: 'Consultas de Planificación Familiar' },
        { key: 'despistaje_mama', label: 'Despistaje de Cáncer de Mama' },
        { key: 'despistaje_cervix', label: 'Despistaje de Cáncer de Cérvix' },
        { key: 'despistaje_prostata', label: 'Despistaje de Cáncer de Próstata' },
        { key: 'embarazadas_captadas', label: 'Embarazadas Captadas' },
        { key: 'controles_prenatales', label: 'Controles Prenatales' },
      ]
    }
  ],
  'emergencias_cdi': [
    {
      section: 'emergencias_diarias',
      label: 'Emergencias Diarias',
      fields: [
        { key: 'emg_adultos_lunes', label: 'Emergencias Adultos - Lunes' },
        { key: 'emg_adultos_martes', label: 'Emergencias Adultos - Martes' },
        { key: 'emg_adultos_miercoles', label: 'Emergencias Adultos - Miércoles' },
        { key: 'emg_adultos_jueves', label: 'Emergencias Adultos - Jueves' },
        { key: 'emg_adultos_viernes', label: 'Emergencias Adultos - Viernes' },
        { key: 'emg_adultos_sabado', label: 'Emergencias Adultos - Sábado' },
        { key: 'emg_adultos_domingo', label: 'Emergencias Adultos - Domingo' },
        { key: 'emg_pediatricas_lunes', label: 'Emergencias Pediátricas - Lunes' },
        { key: 'emg_pediatricas_martes', label: 'Emergencias Pediátricas - Martes' },
        { key: 'emg_pediatricas_miercoles', label: 'Emergencias Pediátricas - Miércoles' },
        { key: 'emg_pediatricas_jueves', label: 'Emergencias Pediátricas - Jueves' },
        { key: 'emg_pediatricas_viernes', label: 'Emergencias Pediátricas - Viernes' },
        { key: 'emg_pediatricas_sabado', label: 'Emergencias Pediátricas - Sábado' },
        { key: 'emg_pediatricas_domingo', label: 'Emergencias Pediátricas - Domingo' },
      ]
    },
    {
      section: 'consultas_por_especialidad',
      label: 'Consultas por Especialidad',
      fields: [
        { key: 'consultas_cirugia', label: 'Cirugía' },
        { key: 'consultas_ginecologia', label: 'Ginecología' },
        { key: 'consultas_odontologia', label: 'Odontología' },
        { key: 'consultas_pediatria', label: 'Pediatría' },
        { key: 'consultas_medicina_interna', label: 'Medicina Interna' },
        { key: 'consultas_traumatologia', label: 'Traumatología' },
        { key: 'consultas_oftalmologia', label: 'Oftalmología' },
        { key: 'consultas_dermatologia', label: 'Dermatología' },
        { key: 'consultas_cardiologia', label: 'Cardiología' },
      ]
    },
    {
      section: 'servicios_diagnosticos',
      label: 'Servicios Diagnósticos',
      fields: [
        { key: 'rx_total', label: 'Total RX Realizados' },
        { key: 'ecografias', label: 'Ecografías Realizadas' },
        { key: 'endoscopias', label: 'Endoscopias Realizadas' },
        { key: 'electrocardiogramas', label: 'Electrocardiogramas' },
        { key: 'rehabilitacion_sesiones', label: 'Sesiones de Rehabilitación' },
        { key: 'rehabilitacion_pacientes', label: 'Pacientes en Rehabilitación' },
      ]
    }
  ],
  'asic_consolidado': [
    {
      section: 'indicadores_salud',
      label: 'Indicadores de Salud',
      fields: [
        { key: 'consultas_totales', label: 'Total Consultas' },
        { key: 'emergencias_totales', label: 'Total Emergencias' },
        { key: 'defunciones', label: 'Defunciones' },
        { key: 'nacimientos', label: 'Nacimientos' },
        { key: 'vidas_salvadas', label: 'Vidas Salvadas' },
        { key: 'hospitalizados', label: 'Pacientes Hospitalizados' },
        { key: 'altas_medicas', label: 'Altas Médicas' },
        { key: 'referencias', label: 'Referencias a Otros Centros' },
      ]
    },
    {
      section: 'actividades_comunitarias',
      label: 'Actividades Comunitarias',
      fields: [
        { key: 'visitas_domiciliarias', label: 'Visitas Domiciliarias' },
        { key: 'jornadas_salud', label: 'Jornadas de Salud Realizadas' },
        { key: 'charlas_educativas', label: 'Charlas Educativas' },
        { key: 'pesquisas_activas', label: 'Pesquisas Activas' },
        { key: 'atencion_domiciliaria', label: 'Atención Domiciliaria' },
        { key: 'inmunizaciones_comunidad', label: 'Inmunizaciones en Comunidad' },
      ]
    }
  ],
  'resumen_semanal': [
    {
      section: 'actividades_semanales',
      label: 'Actividades Semanales',
      fields: [
        { key: 'consultas_lunes', label: 'Total Consultas - Lunes' },
        { key: 'consultas_martes', label: 'Total Consultas - Martes' },
        { key: 'consultas_miercoles', label: 'Total Consultas - Miércoles' },
        { key: 'consultas_jueves', label: 'Total Consultas - Jueves' },
        { key: 'consultas_viernes', label: 'Total Consultas - Viernes' },
        { key: 'consultas_sabado', label: 'Total Consultas - Sábado' },
        { key: 'consultas_domingo', label: 'Total Consultas - Domingo' },
      ]
    },
    {
      section: 'emergencias_semanales',
      label: 'Emergencias de la Semana',
      fields: [
        { key: 'emg_lunes', label: 'Emergencias - Lunes' },
        { key: 'emg_martes', label: 'Emergencias - Martes' },
        { key: 'emg_miercoles', label: 'Emergencias - Miércoles' },
        { key: 'emg_jueves', label: 'Emergencias - Jueves' },
        { key: 'emg_viernes', label: 'Emergencias - Viernes' },
        { key: 'emg_sabado', label: 'Emergencias - Sábado' },
        { key: 'emg_domingo', label: 'Emergencias - Domingo' },
      ]
    },
    {
      section: 'servicios_semanales',
      label: 'Servicios de la Semana',
      fields: [
        { key: 'rx_semanal', label: 'Total RX' },
        { key: 'ecografia_semanal', label: 'Total Ecografías' },
        { key: 'laboratorio_semanal', label: 'Total Exámenes Laboratorio' },
        { key: 'inmunizaciones_semanal', label: 'Total Inmunizaciones' },
        { key: 'rehabilitacion_semanal', label: 'Total Sesiones Rehabilitación' },
        { key: 'odontologia_semanal', label: 'Total Consultas Odontología' },
      ]
    }
  ],
  'actividades_diarias': [
    {
      section: 'emergencias_del_dia',
      label: 'Emergencias del Día',
      fields: [
        { key: 'emg_adultos', label: 'Emergencias Atendidas Adultos' },
        { key: 'emg_pediatricas', label: 'Emergencias Atendidas Pediátricas' },
        { key: 'total_nacimientos', label: 'Total de Nacimientos' },
        { key: 'embarazadas_captadas', label: 'Embarazadas Captadas' },
      ]
    },
    {
      section: 'atencion_especial',
      label: 'Atención Especial',
      fields: [
        { key: 'adulto_mayor_atendido', label: 'Atención al Adulto Mayor' },
        { key: 'discapacitados', label: 'Atención a Personas con Discapacidad' },
        { key: 'indigenas', label: 'Atención a Población Indígena' },
        { key: 'pacientes_sri', label: 'Pacientes en SRI (Sala Rehabilitación Integral)' },
      ]
    },
    {
      section: 'servicios_dia',
      label: 'Servicios del Día',
      fields: [
        { key: 'vacunas_dia', label: 'Vacunas Colocadas' },
        { key: 'pacientes_inmunizados_dia', label: 'Pacientes Inmunizados' },
        { key: 'examenes_lab_dia', label: 'Exámenes de Laboratorio' },
        { key: 'rx_dia', label: 'RX Realizados' },
        { key: 'ecografias_dia', label: 'Ecografías' },
        { key: 'electrocardiograma_dia', label: 'Electrocardiogramas' },
      ]
    }
  ]
};

export const ROLE_PERMISSIONS: Record<string, { reportTemplates: string[]; actions: string[]; sections: string | string[]; restrictions?: { requiresApproval?: boolean; maxDailyReports?: number } }> = {
  'administrador': {
    reportTemplates: ['rac_nacional', 'asic_consolidado', 'resumen_semanal', 'emergencias_cdi', 'actividades_diarias'],
    actions: ['create', 'edit', 'delete', 'export', 'approve', 'view_all', 'assign_templates', 'manage_users'],
    sections: 'all'
  },
  'coordinador': {
    reportTemplates: ['rac_nacional', 'asic_consolidado', 'resumen_semanal', 'emergencias_cdi', 'actividades_diarias'],
    actions: ['create', 'edit', 'export', 'view_all', 'manage_users'],
    sections: 'all'
  },
  'doctor': {
    reportTemplates: ['emergencias_cdi', 'resumen_semanal', 'actividades_diarias'],
    actions: ['create', 'edit', 'export', 'view_own', 'view_team'],
    sections: ['atencion_pediatrica', 'atencion_adulto', 'atencion_obstetrica', 'emergencias']
  },
  'enfermero': {
    reportTemplates: ['actividades_diarias', 'emergencias_cdi'],
    actions: ['create', 'view_own', 'export_own'],
    sections: ['emergencias_adultos', 'emergencias_pediatricas', 'inmunizaciones', 'examenes_laboratorio'],
    restrictions: { requiresApproval: true, maxDailyReports: 5 }
  }
};
