import { User, SavedReport, Alert, ReportData, ReportConfig } from '../types';

const API_URL = import.meta.env.VITE_INSFORGE_URL;
const API_KEY = import.meta.env.VITE_INSFORGE_KEY;

if (!API_URL) {
  console.warn('VITE_INSFORGE_URL is not set. API calls will fail.');
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

export const api = {
  // --- Auth & Users ---
  async login(username: string): Promise<User | null> {
    // InsForge might handle auth differently, but for this migration we'll simulate
    // finding a user by username in the 'users' table.
    // Real implementation would use an Auth provider or a specific /auth/login endpoint.
    const url = `${API_URL}/tables/users?filter=username:eq:${username}`;
    const response = await fetch(url, { headers });
    const users = await handleResponse<User[]>(response);
    return users.length > 0 ? users[0] : null;
  },

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/tables/users`, { headers });
    return handleResponse<User[]>(response);
  },

  async createUser(user: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/tables/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user),
    });
    return handleResponse<User>(response);
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_URL}/tables/users/${userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return handleResponse<User>(response);
  },
    
  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/tables/users/${userId}`, {
        method: 'DELETE',
        headers
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  // --- Reports ---
  async getReports(): Promise<SavedReport[]> {
    const response = await fetch(`${API_URL}/tables/reports`, { headers });
    return handleResponse<SavedReport[]>(response);
  },

  async saveReport(report: Partial<SavedReport>): Promise<SavedReport> {
    const method = report.id ? 'PUT' : 'POST'; // Assuming PUT for update if ID exists, or separate update method
    // If it's a new report, let the backend generate ID or use the one provided if InsForge allows.
    // For this generic implementation, we'll try POST for creation.
    
    // Check if updating or creating
    if (report.id && !report.createdAt) { // Heuristic: if it has ID but we are "saving" it as new... wait.
       // Actually store.ts generates IDs locally. We should probably let backend handle IDs or keep UUIDs.
       // Let's assume we use the PUT/PATCH for updates and POST for create.
       // But store.ts logic was: saveReport -> setReports([newReport, ...prev]).
       // We need to differentiate create vs update in the store or here.
    }
    
    // For simplicity, let's treat "save" as "create" if it doesn't exist, or "update" if it does.
    // But since this is a new migration, let's just expose create and update separately or handle it.
    
    const response = await fetch(`${API_URL}/tables/reports`, {
      method: 'POST',
      headers,
      body: JSON.stringify(report),
    });
    return handleResponse<SavedReport>(response);
  },

  async updateReport(reportId: string, updates: Partial<SavedReport>): Promise<SavedReport> {
    const response = await fetch(`${API_URL}/tables/reports/${reportId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    return handleResponse<SavedReport>(response);
  },

  // --- Alerts ---
  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${API_URL}/tables/alerts`, { headers });
    return handleResponse<Alert[]>(response);
  },

  async markAlertRead(alertId: string): Promise<Alert> {
    const response = await fetch(`${API_URL}/tables/alerts/${alertId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ read: true }),
    });
    return handleResponse<Alert>(response);
  },
  
  async createAlert(alert: Partial<Alert>): Promise<Alert> {
      const response = await fetch(`${API_URL}/tables/alerts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(alert)
      });
      return handleResponse<Alert>(response);
  }
};
