import { User, SavedReport, Alert, UserRole } from '../types';

const API_KEY = import.meta.env.VITE_INSFORGE_KEY;
let API_URL = import.meta.env.VITE_INSFORGE_URL;

if (!API_URL) {
  console.error("VITE_INSFORGE_URL no está definida.");
} else if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'apikey': API_KEY
};

// --- Mappings ---

function mapUserFromDB(db: any): User {
  return {
    id: db.id,
    username: db.username,
    password: db.password,
    name: db.name || '',
    role: (db.role || 'enfermero') as UserRole,
    cedula: db.cedula || '',
    centro: db.centro || '',
    asic: db.asic || '',
    mustChangePassword: db.must_change_password ?? true,
    profileCompleted: db.profile_completed ?? false,
    createdAt: db.created_at || new Date().toISOString()
  };
}

function mapUserToDB(user: Partial<User>): any {
  const db: any = {};
  if (user.username !== undefined) db.username = user.username;
  if (user.password !== undefined) db.password = user.password;
  if (user.name !== undefined) db.name = user.name;
  if (user.role !== undefined) db.role = user.role;
  if (user.cedula !== undefined) db.cedula = user.cedula;
  if (user.centro !== undefined) db.centro = user.centro;
  if (user.asic !== undefined) db.asic = user.asic;
  if (user.mustChangePassword !== undefined) db.must_change_password = user.mustChangePassword;
  if (user.profileCompleted !== undefined) db.profile_completed = user.profileCompleted;
  return db;
}

function mapReportFromDB(db: any): SavedReport {
  return {
    id: db.id,
    templateId: db.template_id,
    templateName: db.template_name,
    config: db.config,
    data: db.data,
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    createdBy: db.created_by,
    createdByUserId: db.created_by_user_id,
    approvedBy: db.approved_by
  };
}

function mapReportToDB(report: Partial<SavedReport>): any {
  const db: any = {};
  if (report.templateId !== undefined) db.template_id = report.templateId;
  if (report.templateName !== undefined) db.template_name = report.templateName;
  if (report.config !== undefined) db.config = report.config;
  if (report.data !== undefined) db.data = report.data;
  if (report.status !== undefined) db.status = report.status;
  if (report.createdAt !== undefined) db.created_at = report.createdAt;
  if (report.updatedAt !== undefined) db.updated_at = report.updatedAt;
  if (report.createdBy !== undefined) db.created_by = report.createdBy;
  if (report.createdByUserId !== undefined) db.created_by_user_id = report.createdByUserId;
  if (report.approvedBy !== undefined) db.approved_by = report.approvedBy;
  return db;
}

function mapAlertFromDB(db: any): Alert {
  return {
    id: db.id,
    type: db.type,
    title: db.title,
    detail: db.detail,
    meta: db.meta,
    reportId: db.report_id,
    createdAt: db.created_at,
    read: db.read
  };
}

function mapAlertToDB(alert: Partial<Alert>): any {
  const db: any = {};
  if (alert.type !== undefined) db.type = alert.type;
  if (alert.title !== undefined) db.title = alert.title;
  if (alert.detail !== undefined) db.detail = alert.detail;
  if (alert.meta !== undefined) db.meta = alert.meta;
  if (alert.reportId !== undefined) db.report_id = alert.reportId;
  if (alert.read !== undefined) db.read = alert.read;
  return db;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(errorText) as any;
    error.status = response.status;
    throw error;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}

export const api = {
  async login(username: string): Promise<User | null> {
    if (!API_URL) throw new Error("API URL no configurada");
    const response = await fetch(`${API_URL}/api/database/records/users?username=eq.${username}`, { headers });
    const users = await handleResponse<any[]>(response);
    return users.length > 0 ? mapUserFromDB(users[0]) : null;
  },

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/api/database/records/users`, { headers });
    const users = await handleResponse<any[]>(response);
    return users.map(mapUserFromDB);
  },

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(`${API_URL}/api/database/records/users`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(mapUserToDB(user))
    });
    const result = await handleResponse<any[]>(response);
    return mapUserFromDB(result[0] || result);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/api/database/records/users?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(mapUserToDB(updates))
    });
    const result = await handleResponse<any[]>(response);
    return mapUserFromDB(result[0] || result);
  },

  async deleteUser(id: string): Promise<void> {
    await fetch(`${API_URL}/api/database/records/users?id=eq.${id}`, {
      method: 'DELETE',
      headers
    });
  },

  async getReports(): Promise<SavedReport[]> {
    const response = await fetch(`${API_URL}/api/database/records/reports`, { headers });
    const reports = await handleResponse<any[]>(response);
    return reports.map(mapReportFromDB);
  },

  async saveReport(report: Partial<SavedReport>): Promise<SavedReport> {
    const response = await fetch(`${API_URL}/api/database/records/reports`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(mapReportToDB(report))
    });
    const result = await handleResponse<any[]>(response);
    return mapReportFromDB(result[0] || result);
  },

  async updateReport(id: string, updates: Partial<SavedReport>): Promise<SavedReport> {
    const response = await fetch(`${API_URL}/api/database/records/reports?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(mapReportToDB(updates))
    });
    const result = await handleResponse<any[]>(response);
    return mapReportFromDB(result[0] || result);
  },

  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${API_URL}/api/database/records/alerts`, { headers });
    const alerts = await handleResponse<any[]>(response);
    return alerts.map(mapAlertFromDB);
  },

  async markAlertRead(id: string): Promise<void> {
    await fetch(`${API_URL}/api/database/records/alerts?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ read: true })
    });
  },

  async createAlert(alert: Partial<Alert>): Promise<Alert> {
    const response = await fetch(`${API_URL}/api/database/records/alerts`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(mapAlertToDB(alert))
    });
    const result = await handleResponse<any[]>(response);
    return mapAlertFromDB(result[0] || result);
  }
};
