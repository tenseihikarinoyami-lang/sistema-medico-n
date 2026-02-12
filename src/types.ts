export type UserRole = 'administrador' | 'doctor' | 'enfermero';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  cedula: string;
  centro: string;
  asic: string;
  mustChangePassword: boolean;
  profileCompleted: boolean;
  createdAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sourceFile: string;
  sections: string[];
  requiredRoles: UserRole[];
  frequency: 'diario' | 'semanal' | 'mensual';
  icon: string;
  color: string;
}

export interface ReportConfig {
  templateId: string;
  centro: string;
  asic: string;
  estado: string;
  municipio: string;
  parroquia: string;
  fechaInicio: string;
  fechaFin: string;
  especialidad: string;
}

export interface ReportData {
  [key: string]: number | string;
}

export interface SavedReport {
  id: string;
  templateId: string;
  templateName: string;
  config: ReportConfig;
  data: ReportData;
  status: 'borrador' | 'pendiente' | 'aprobado' | 'enviado';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUserId: string;
  approvedBy?: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  meta: string;
  reportId?: string;
  createdAt: string;
  read: boolean;
}

export type WizardStep = 1 | 2 | 3 | 4;
export type AppView = 'landing' | 'login' | 'dashboard' | 'wizard' | 'reports' | 'alerts' | 'profile' | 'users';
