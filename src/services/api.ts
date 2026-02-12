import { User, SavedReport, Alert, ReportTemplate } from '../types';

// Ensure URL doesn't have a trailing slash
const API_KEY = import.meta.env.VITE_INSFORGE_KEY;
let API_URL = import.meta.env.VITE_INSFORGE_URL;

// Fallback or correction
if (!API_URL) {
  console.error("VITE_INSFORGE_URL is not defined! API calls will fail.");
  // Optional: Default to a placeholder to prevent calling localhost
  // API_URL = 'https://api.insforge.com/v1/projects/MISSING_ID'; 
} else if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'apikey': API_KEY
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

export const api = {
  async login(username: string): Promise<User | null> {
    if (!API_URL) throw new Error("API URL not configured");
    const url = `${API_URL}/tables/users?filter=username:eq:${username}`;
    const response = await fetch(url, { headers });
    const users = await handleResponse<User[]>(response);
    return users.length > 0 ? users[0] : null;
  },

  async getUsers(): Promise<User[]> {
    if (!API_URL) throw new Error("API URL not configured");
    const response = await fetch(`${API_URL}/tables/users`, { headers });
    return handleResponse<User[]>(response);
  },

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    if (!API_URL) throw new Error("API URL not configured");
    const response = await fetch(`${API_URL}/tables/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user)
    });
    return handleResponse<User>(response);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    if (!API_URL) throw new Error("API URL not configured");
    const response = await fetch(`${API_URL}/tables/users?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates)
    });
    // Patch usually returns the updated row or empty, depending on Prefer header. 
    // Assuming standardized InsForge response or fetching updated.
    return { id, ...updates } as User;
  },

  async deleteUser(id: string): Promise<void> {
    if (!API_URL) throw new Error("API URL not configured");
    await fetch(`${API_URL}/tables/users?id=eq.${id}`, {
      method: 'DELETE',
      headers
    });
  },

  async getReports(): Promise<SavedReport[]> {
    if (!API_URL) throw new Error("API URL not configured");
    const response = await fetch(`${API_URL}/tables/reports`, { headers });
    return handleResponse<SavedReport[]>(response);
  },

  async saveReport(report: Omit<SavedReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedReport> {
    if (!API_URL) throw new Error("API URL not configured");
    const payload = {
      ...report,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const response = await fetch(`${API_URL}/tables/reports`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    return handleResponse<SavedReport>(response);
  },

  async updateReport(id: string, updates: Partial<SavedReport>): Promise<SavedReport> {
    if (!API_URL) throw new Error("API URL not configured");
    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    const response = await fetch(`${API_URL}/tables/reports?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload)
    });
    return { id, ...updates } as SavedReport;
  },

  async getAlerts(): Promise<Alert[]> {
    if (!API_URL) throw new Error("API URL not configured");
    const response = await fetch(`${API_URL}/tables/alerts`, { headers });
    return handleResponse<Alert[]>(response);
  },

  async markAlertRead(id: string): Promise<void> {
    if (!API_URL) throw new Error("API URL not configured");
    await fetch(`${API_URL}/tables/alerts?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ read: true })
    });
  },

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    if (!API_URL) throw new Error("API URL not configured");
    const payload = {
      ...alert,
      created_at: new Date().toISOString(),
      read: false
    };
    const response = await fetch(`${API_URL}/tables/alerts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    return handleResponse<Alert>(response);
  }
};
