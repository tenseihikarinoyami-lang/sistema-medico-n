import { useState, useCallback, useEffect } from 'react';
import type { User, SavedReport, Alert, AppView, ReportConfig, ReportData, WizardStep } from './types';
import { api } from './services/api';



export function useAppStore() {
  const [currentView, setCurrentView] = useState<AppView>(() => {
    // Persist view across reloads if possible, or default to landing
    return 'landing';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    templateId: '',
    centro: '',
    asic: '',
    estado: 'ARAGUA',
    municipio: '',
    parroquia: '',
    fechaInicio: '',
    fechaFin: '',
    especialidad: ''
  });
  const [reportData, setReportData] = useState<ReportData>({});

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we have a user logged in, or if it's public data?
      // For this system, let's fetch users if admin, reports if logged in.
      // But `useAppStore` might be used in the top level.
      // Let's just try to fetch basic data if we are in a logged-in view.
      try {
        if (currentUser) {
          setIsLoading(true);
          const [fetchedReports, fetchedAlerts] = await Promise.all([
            api.getReports(),
            api.getAlerts()
          ]);
          setReports(fetchedReports);
          setAlerts(fetchedAlerts);

          if (currentUser.role === 'administrador' || currentUser.role === 'coordinador') {
            const fetchedUsers = await api.getUsers();
            setUsers(fetchedUsers);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Error de conexión con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id, currentUser?.role]); // Re-fetch when user changes

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }> => {
    setIsLoading(true);
    try {
      const user = await api.login(username);

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Simple password check for migration - in a real app, backend handles this
      if (user.password !== password) {
        // If we can't check password securely (hashed), we assume the backend `login` endpoint would have failed.
        // Since our `api.login` just fetches the user by username (simulated), we do the check here.
        return { success: false, error: 'Contraseña incorrecta' };
      }

      setCurrentUser(user);

      if (user.mustChangePassword) {
        setCurrentView('profile');
        return { success: true, mustChangePassword: true };
      }
      if (!user.profileCompleted) {
        setCurrentView('profile');
        return { success: true };
      }
      setCurrentView('dashboard');
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Error al iniciar sesión' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView('landing');
    setSidebarOpen(false);
    setReports([]);
    setAlerts([]);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No hay usuario activo' };

    if (currentUser.password !== currentPassword) {
      return { success: false, error: 'La contraseña actual es incorrecta' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' };
    }

    try {
      const updated = await api.updateUser(currentUser.id, { password: newPassword, mustChangePassword: false });
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
      // Update generic users list if admin
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updated } : u));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al actualizar contraseña' };
    }
  }, [currentUser]);

  const updateProfile = useCallback(async (profileData: { name: string; cedula: string; centro: string; asic: string }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No hay usuario activo' };

    try {
      const updated = await api.updateUser(currentUser.id, { ...profileData, profileCompleted: true });
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updated } : u));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al actualizar perfil' };
    }
  }, [currentUser]);

  const createUser = useCallback(async (userData: { username: string; password: string; role: User['role'] }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || (currentUser.role !== 'administrador' && currentUser.role !== 'coordinador')) {
      return { success: false, error: 'Solo administradores y coordinadores pueden crear usuarios' };
    }

    try {
      // Check local list first (optimization)
      const existing = users.find(u => u.username === userData.username);
      if (existing) return { success: false, error: 'El usuario ya existe' };

      const newUserPayload: Omit<User, 'id'> = {
        username: userData.username,
        password: userData.password,
        role: userData.role,
        mustChangePassword: true,
        profileCompleted: false,
        createdAt: new Date().toISOString(),
        name: '',
        cedula: '',
        centro: '',
        asic: ''
      };

      const newUser = await api.createUser(newUserPayload);
      setUsers(prev => [...prev, newUser]);
      return { success: true };
    } catch (err: any) {
      if (err.status === 409) {
        return { success: false, error: 'Este nombre de usuario ya está registrado' };
      }
      return { success: false, error: 'Error al crear usuario' };
    }
  }, [currentUser, users]);

  const deleteUser = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'administrador') {
      return { success: false, error: 'No autorizado' };
    }
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al eliminar usuario' };
    }
  }, [currentUser]);

  const resetUserPassword = useCallback(async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || (currentUser.role !== 'administrador' && currentUser.role !== 'coordinador')) return { success: false, error: 'No autorizado' };
    // Coordinador cannot reset admin passwords
    const targetUser = users.find(u => u.id === userId);
    if (currentUser.role === 'coordinador' && targetUser?.role === 'administrador') {
      return { success: false, error: 'No puede modificar contraseñas de administradores' };
    }
    try {
      const updated = await api.updateUser(userId, { password: newPassword, mustChangePassword: true });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al resetear contraseña' };
    }
  }, [currentUser, users]);

  const updateUserRole = useCallback(async (userId: string, newRole: User['role']): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || (currentUser.role !== 'administrador' && currentUser.role !== 'coordinador')) {
      return { success: false, error: 'No autorizado' };
    }
    // Coordinador cannot assign admin role
    if (currentUser.role === 'coordinador' && newRole === 'administrador') {
      return { success: false, error: 'No puede asignar rol de administrador' };
    }
    try {
      const updated = await api.updateUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al cambiar rol' };
    }
  }, [currentUser]);

  const startWizard = useCallback(() => {
    setWizardStep(1);
    setSelectedTemplateId('');
    setReportConfig({
      templateId: '',
      centro: '',
      asic: '',
      estado: 'ARAGUA',
      municipio: '',
      parroquia: '',
      fechaInicio: '',
      fechaFin: '',
      especialidad: ''
    });
    setReportData({});
    setCurrentView('wizard');
  }, []);

  const saveReport = useCallback(async (status: SavedReport['status'] = 'borrador') => {
    const template = selectedTemplateId;
    const templateNames: Record<string, string> = {
      'rac_nacional': 'Matriz RAC Nacional',
      'emergencias_cdi': 'Estadísticas por Especialidad',
      'asic_consolidado': 'Indicadores ASIC Consolidado',
      'resumen_semanal': 'Resumen Semanal CDI',
      'actividades_diarias': 'Actividades Diarias MBA'
    };

    // Create new report object
    const newReportPayload: Partial<SavedReport> = {
      // id: let backend assign
      templateId: template,
      templateName: templateNames[template] || template,
      config: { ...reportConfig, templateId: template },
      data: { ...reportData },
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || currentUser?.username || 'Usuario',
      createdByUserId: currentUser?.id || ''
    };

    try {
      const saved = await api.saveReport(newReportPayload);
      setReports(prev => [saved, ...prev]);

      // --- Automated Notification Logic ---
      // 1. Check for critical values (> 50)
      const criticalIndicators = Object.entries(reportData)
        .filter(([, val]) => Number(val) > 50)
        .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

      if (criticalIndicators.length > 0) {
        const newAlert: Omit<Alert, 'id'> = {
          title: 'Valores Críticos Detectados',
          detail: `El reporte "${templateNames[template]}" contiene valores inusualmente altos en: ${criticalIndicators.join(', ')}.`,
          type: 'critical',
          read: false,
          createdAt: new Date().toISOString(),
          meta: `Reporte ID: ${saved.id} · Centro: ${reportConfig.centro}`,
          reportId: saved.id
        };
        const savedAlert = await api.createAlert(newAlert);
        setAlerts(prev => [savedAlert, ...prev]);
      }

      // 2. Info alert for the user
      const infoAlert: Omit<Alert, 'id'> = {
        title: 'Reporte Guardado',
        detail: `Has guardado exitosamente el reporte "${templateNames[template]}".`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
        meta: `Estado: ${status === 'borrador' ? 'Borrador' : 'Pendiente de revisión'}`
      };
      const savedInfo = await api.createAlert(infoAlert);
      setAlerts(prev => [savedInfo, ...prev]);
      // ------------------------------------

      setCurrentView('dashboard');
    } catch (err) {
      console.error('Failed to save report', err);
      setError('Error al guardar reporte');
    }
  }, [selectedTemplateId, reportConfig, reportData, currentUser]);

  const markAlertRead = useCallback(async (alertId: string) => {
    try {
      await api.markAlertRead(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    } catch (err) {
      console.error('Failed to mark alert read', err);
    }
  }, []);

  const updateReportStatus = useCallback(async (reportId: string, status: SavedReport['status']) => {
    try {
      const updated = await api.updateReport(reportId, {
        status,
        updatedAt: new Date().toISOString(),
        approvedBy: currentUser?.name
      });
      setReports(prev => prev.map(r => r.id === reportId ? updated : r));

      // --- Automated Notification Logic ---
      if (status === 'aprobado' || status === 'enviado') {
        const approvalAlert: Omit<Alert, 'id'> = {
          title: `Reporte ${status === 'aprobado' ? 'Aprobado' : 'Enviado'}`,
          detail: `El reporte "${updated.templateName}" de ${updated.config.centro} ha sido ${status === 'aprobado' ? 'aprobado' : 'marcado como enviado'} por ${currentUser?.name}.`,
          type: 'info',
          read: false,
          createdAt: new Date().toISOString(),
          meta: `Ref: ${updated.id}`,
          reportId: updated.id
        };
        const savedAlert = await api.createAlert(approvalAlert);
        setAlerts(prev => [savedAlert, ...prev]);
      }
      // ------------------------------------
    } catch (err) {
      console.error('Failed to update report status', err);
    }
  }, [currentUser]);

  // Get reports visible to current user
  const getVisibleReports = useCallback(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'administrador' || currentUser.role === 'coordinador') return reports;
    return reports.filter(r => r.createdByUserId === currentUser.id);
  }, [currentUser, reports]);

  // Get users who reported today
  const getUsersReportedToday = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userIdsReported = new Set(
      reports
        .filter(r => r.createdAt && r.createdAt.startsWith(todayStr))
        .map(r => r.createdByUserId)
    );
    return users.filter(u => userIdsReported.has(u.id));
  }, [users, reports]);

  // Get users who have NOT reported today
  const getUsersNotReportedToday = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const userIdsReported = new Set(
      reports
        .filter(r => r.createdAt && r.createdAt.startsWith(todayStr))
        .map(r => r.createdByUserId)
    );
    return users.filter(u => u.role !== 'administrador' && !userIdsReported.has(u.id));
  }, [users, reports]);

  return {
    currentView, setCurrentView,
    currentUser, setCurrentUser,
    users,
    login, logout,
    changePassword,
    updateProfile,
    createUser, deleteUser, resetUserPassword, updateUserRole,
    reports, setReports, saveReport, updateReportStatus,
    getVisibleReports,
    getUsersReportedToday, getUsersNotReportedToday,
    alerts, setAlerts, markAlertRead,
    wizardStep, setWizardStep,
    selectedTemplateId, setSelectedTemplateId,
    reportConfig, setReportConfig,
    reportData, setReportData,
    sidebarOpen, setSidebarOpen,
    startWizard,
    isLoading, error
  };
}
