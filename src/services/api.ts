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

// --- LocalStorage Fallback ---

const LS_KEYS = {
  users: 'medireport_users',
  reports: 'medireport_reports',
  alerts: 'medireport_alerts',
  initialized: 'medireport_initialized'
};

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const SEED_USERS: User[] = [
  {
    id: generateId(), username: 'admin', password: 'admin123', name: 'Administrador',
    role: 'administrador', cedula: 'V-12345678', centro: 'CDI El Valle', asic: 'el_valle',
    mustChangePassword: false, profileCompleted: true, createdAt: new Date().toISOString()
  },
  {
    id: generateId(), username: 'coord.rodriguez', password: 'coord123', name: 'Coord. Rodríguez',
    role: 'coordinador', cedula: 'V-23456789', centro: 'CDI El Valle', asic: 'el_valle',
    mustChangePassword: true, profileCompleted: false, createdAt: new Date().toISOString()
  },
  {
    id: generateId(), username: 'dra.gonzalez', password: 'doctor123', name: 'Dra. González',
    role: 'doctor', cedula: 'V-34567890', centro: 'CDI El Valle', asic: 'el_valle',
    mustChangePassword: true, profileCompleted: false, createdAt: new Date().toISOString()
  },
  {
    id: generateId(), username: 'enf.perez', password: 'enfermero123', name: 'Enf. Pérez',
    role: 'enfermero', cedula: 'V-45678901', centro: 'CDI El Valle', asic: 'el_valle',
    mustChangePassword: true, profileCompleted: false, createdAt: new Date().toISOString()
  }
];

function lsGet<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function lsSet<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function initLocalStorage(): void {
  if (localStorage.getItem(LS_KEYS.initialized)) return;
  lsSet(LS_KEYS.users, SEED_USERS);
  lsSet(LS_KEYS.reports, []);
  lsSet(LS_KEYS.alerts, []);
  localStorage.setItem(LS_KEYS.initialized, 'true');
}

// Initialize on load
initLocalStorage();

// Local storage CRUD operations
const localDB = {
  getUsers(): User[] {
    return lsGet<User>(LS_KEYS.users);
  },

  getUserByUsername(username: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.username === username) || null;
  },

  createUser(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const existing = users.find(u => u.username === user.username);
    if (existing) {
      const error = new Error('Este nombre de usuario ya está registrado') as any;
      error.status = 409;
      throw error;
    }
    const newUser: User = { ...user, id: generateId() };
    users.push(newUser);
    lsSet(LS_KEYS.users, users);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado');
    users[idx] = { ...users[idx], ...updates };
    lsSet(LS_KEYS.users, users);
    return users[idx];
  },

  deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    lsSet(LS_KEYS.users, users);
  },

  getReports(): SavedReport[] {
    return lsGet<SavedReport>(LS_KEYS.reports);
  },

  saveReport(report: Partial<SavedReport>): SavedReport {
    const reports = this.getReports();
    const newReport: SavedReport = {
      id: generateId(),
      templateId: report.templateId || '',
      templateName: report.templateName || '',
      config: report.config || {} as any,
      data: report.data || {},
      status: report.status || 'borrador',
      createdAt: report.createdAt || new Date().toISOString(),
      updatedAt: report.updatedAt || new Date().toISOString(),
      createdBy: report.createdBy || '',
      createdByUserId: report.createdByUserId || '',
      approvedBy: report.approvedBy
    };
    reports.unshift(newReport);
    lsSet(LS_KEYS.reports, reports);
    return newReport;
  },

  updateReport(id: string, updates: Partial<SavedReport>): SavedReport {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Reporte no encontrado');
    reports[idx] = { ...reports[idx], ...updates };
    lsSet(LS_KEYS.reports, reports);
    return reports[idx];
  },

  getAlerts(): Alert[] {
    return lsGet<Alert>(LS_KEYS.alerts);
  },

  markAlertRead(id: string): void {
    const alerts = this.getAlerts();
    const idx = alerts.findIndex(a => a.id === id);
    if (idx !== -1) {
      alerts[idx].read = true;
      lsSet(LS_KEYS.alerts, alerts);
    }
  },

  createAlert(alert: Partial<Alert>): Alert {
    const alerts = this.getAlerts();
    const newAlert: Alert = {
      id: generateId(),
      type: alert.type || 'info',
      title: alert.title || '',
      detail: alert.detail || '',
      meta: alert.meta || '',
      reportId: alert.reportId,
      createdAt: alert.createdAt || new Date().toISOString(),
      read: alert.read ?? false
    };
    alerts.unshift(newAlert);
    lsSet(LS_KEYS.alerts, alerts);
    return newAlert;
  }
};

// --- Remote API Mappings ---

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

// Wrapper: try remote API first, fallback to localStorage
async function withFallback<T>(
  remoteFn: () => Promise<T>,
  localFn: () => T
): Promise<T> {
  if (!API_URL) return localFn();
  try {
    return await remoteFn();
  } catch (err: any) {
    console.warn('InsForge API unavailable, using local fallback:', err.message || err);
    return localFn();
  }
}

export const api = {
  async login(username: string): Promise<User | null> {
    return withFallback(
      async () => {
        const response = await fetch(`${API_URL}/api/database/records/users?username=eq.${username}`, { headers });
        const users = await handleResponse<any[]>(response);
        return users.length > 0 ? mapUserFromDB(users[0]) : null;
      },
      () => localDB.getUserByUsername(username)
    );
  },

  async getUsers(): Promise<User[]> {
    return withFallback(
      async () => {
        const response = await fetch(`${API_URL}/api/database/records/users`, { headers });
        const users = await handleResponse<any[]>(response);
        return users.map(mapUserFromDB);
      },
      () => localDB.getUsers()
    );
  },

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return withFallback(
      async () => {
        const response = await fetch(`${API_URL}/api/database/records/users`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify(mapUserToDB(user))
        });
        const result = await handleResponse<any[]>(response);
        return mapUserFromDB(result[0] || result);
      },
      () => localDB.createUser(user)
    );
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return withFallback(
      async () => {
        const response = await fetch(`${API_URL}/api/database/records/users?id=eq.${id}`, {
          method: 'PATCH',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify(mapUserToDB(updates))
        });
        const result = await handleResponse<any[]>(response);
        return mapUserFromDB(result[0] || result);
      },
      () => localDB.updateUser(id, updates)
    );
  },

  async deleteUser(id: string): Promise<void> {
    return withFallback(
      async () => {
        await fetch(`${API_URL}/api/database/records/users?id=eq.${id}`, {
          method: 'DELETE',
          headers
        });
      },
      () => localDB.deleteUser(id)
    );
  },

  async getReports(): Promise<SavedReport[]> {
    return withFallback(
      async () => {
        const response = await fetch(`${API_URL}/api/database/records/reports`, { headers });
        const reports = await handleResponse<any[]>(response);
        return reports.map(mapReportFromDB);
      },
      () => localDB.getReports()
    );
  },

  async saveReport(report: Partial<SavedReport>): Promise<SavedReport> {
    return withFallback(
      async () => {
        const response = await fetch(`${API_URL}/api/database/records/reports`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify(mapReportToDB(report))
        });
        const result = await handleResponse<any[]>(response);
        return mapReportFromDB(result[0] || result);
      },
      () => localDB.saveReport(report)
    );
  },

  async updateReport(id: string, updates: Partial<SavedReport>): Promise<SavedReport> {
    return withFallback(
      async () => {
        const response = await fetch(`${API_URL}/api/database/records/reports?id=eq.${id}`, {
          method: 'PATCH',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify(mapReportToDB(updates))
        });
        const result = await handleResponse<any[]>(response);
        return mapReportFromDB(result[0] || result);
      },
      () => localDB.updateReport(id, updates)
    );
  },

  async getAlerts(): Promise<Alert[]> {
    return withFallback(
      async () => {
        const response = await fetch(`${API_URL}/api/database/records/alerts`, { headers });
        const alerts = await handleResponse<any[]>(response);
        return alerts.map(mapAlertFromDB);
      },
      () => localDB.getAlerts()
    );
  },

  async markAlertRead(id: string): Promise<void> {
    return withFallback(
      async () => {
        await fetch(`${API_URL}/api/database/records/alerts?id=eq.${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ read: true })
        });
      },
      () => localDB.markAlertRead(id)
    );
  },

  async createAlert(alert: Partial<Alert>): Promise<Alert> {
    return withFallback(
      async () => {
        const response = await fetch(`${API_URL}/api/database/records/alerts`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify(mapAlertToDB(alert))
        });
        const result = await handleResponse<any[]>(response);
        return mapAlertFromDB(result[0] || result);
      },
      () => localDB.createAlert(alert)
    );
  }
};
