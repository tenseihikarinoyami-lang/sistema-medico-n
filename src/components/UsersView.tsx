import { useState } from 'react';
import type { useAppStore } from '../store';
import type { UserRole } from '../types';

type StoreType = ReturnType<typeof useAppStore>;

export function UsersView({ store }: { store: StoreType }) {
  const isAdmin = store.currentUser?.role === 'administrador';
  const isCoord = store.currentUser?.role === 'coordinador';
  const canManageUsers = isAdmin || isCoord;

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [changeRoleUserId, setChangeRoleUserId] = useState<string | null>(null);
  const [changeRoleValue, setChangeRoleValue] = useState<UserRole>('doctor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'reported' | 'not_reported'>('users');

  // Simple new user form: only username, password, role
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('doctor');

  const usersReported = store.getUsersReportedToday();
  const usersNotReported = store.getUsersNotReportedToday();

  const filteredUsers = store.users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.cedula.toLowerCase().includes(q) ||
        u.centro.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim()) { setError('El nombre de usuario es obligatorio'); return; }
    if (!newPassword.trim()) { setError('La contraseña es obligatoria'); return; }

    const result = await store.createUser({
      username: newUsername.trim(),
      password: newPassword,
      role: newRole
    });

    if (result.success) {
      setSuccess(`Usuario "${newUsername}" creado exitosamente. Contraseña temporal: ${newPassword}. El usuario deberá completar sus datos personales al iniciar sesión.`);
      setNewUsername('');
      setNewPassword('');
      setNewRole('doctor');
      setShowCreateForm(false);
    } else {
      setError(result.error || 'Error al crear usuario');
    }
  };

  const handleResetPassword = async (userId: string) => {
    setError('');
    setSuccess('');
    if (!resetPasswordValue.trim()) {
      setError('Ingrese la nueva contraseña');
      return;
    }
    const result = await store.resetUserPassword(userId, resetPasswordValue);
    if (result.success) {
      const user = store.users.find(u => u.id === userId);
      setSuccess(`Contraseña restablecida para "${user?.username}". El usuario deberá cambiarla al iniciar sesión.`);
      setResetPasswordUserId(null);
      setResetPasswordValue('');
    } else {
      setError(result.error || 'Error al restablecer contraseña');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setError('');
    setSuccess('');
    const user = store.users.find(u => u.id === userId);
    const result = await store.deleteUser(userId);
    if (result.success) {
      setSuccess(`Usuario "${user?.username}" eliminado exitosamente`);
      setDeleteConfirmId(null);
    } else {
      setError(result.error || 'Error al eliminar usuario');
    }
  };

  const handleChangeRole = async (userId: string) => {
    setError('');
    setSuccess('');
    try {
      const result = await store.updateUserRole(userId, changeRoleValue);
      if (result && result.success !== false) {
        const user = store.users.find(u => u.id === userId);
        setSuccess(`Rol de "${user?.username}" cambiado a ${changeRoleValue}`);
        setChangeRoleUserId(null);
      } else {
        setError('Error al cambiar rol');
      }
    } catch {
      setError('Error al cambiar rol');
    }
  };

  const roleColors: Record<string, string> = {
    administrador: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    coordinador: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    doctor: 'bg-green-500/20 text-green-400 border-green-500/30',
    enfermero: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const roleIcons: Record<string, string> = {
    administrador: '🛡️',
    coordinador: '📋',
    doctor: '🩺',
    enfermero: '💉',
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const todayStr = new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Normalized Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
        <div>
          <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">
            {store.users.length} usuarios registrados
          </p>
        </div>
        <button
          onClick={() => { setShowCreateForm(!showCreateForm); setError(''); setSuccess(''); }}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-blue-600/20 hover:scale-105 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Crear Usuario
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-red-300">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400/60 hover:text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-green-300">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400/60 hover:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Create User Form — Simplified */}
      {showCreateForm && (
        <div className="bg-[#111827]/80 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Crear Nuevo Usuario
            </h3>
            <button onClick={() => setShowCreateForm(false)} className="text-white/30 hover:text-white/60 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-4 mb-5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold text-blue-400">Proceso de registro</span>
            </div>
            <p className="text-xs text-white/40">Solo necesita asignar un nombre de usuario y contraseña temporal. Cuando el usuario inicie sesión por primera vez, deberá cambiar su contraseña y completar sus datos personales (nombre, cédula, centro, ASIC).</p>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-5">
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Nombre de Usuario *</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s/g, '.'))}
                  placeholder="Ej: dr.perez, enf.maria"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/20"
                />
                <p className="text-[10px] text-white/25 mt-1">Solo letras, números y puntos. Sin espacios.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Contraseña Temporal *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/20 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPassword(generatePassword())}
                    className="px-3 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-xl text-blue-400 transition flex-shrink-0"
                    title="Generar contraseña aleatoria"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-yellow-400/60 mt-1">⚠️ El usuario deberá cambiarla en su primer inicio</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Rol *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition appearance-none"
                >
                  {isAdmin && <option value="administrador" className="bg-[#1f2937]">🛡️ Administrador</option>}
                  <option value="coordinador" className="bg-[#1f2937]">📋 Coordinador</option>
                  <option value="doctor" className="bg-[#1f2937]">🩺 Doctor</option>
                  <option value="enfermero" className="bg-[#1f2937]">💉 Enfermero</option>
                </select>
              </div>
            </div>

            {/* Role permissions summary */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-white/50 mb-2">Permisos del rol seleccionado</h4>
              <div className="text-xs text-white/30 space-y-1">
                {newRole === 'administrador' && (
                  <>
                    <p>✅ Acceso a las 5 plantillas de reportes</p>
                    <p>✅ Crear, editar, eliminar, exportar y aprobar reportes</p>
                    <p>✅ Gestión completa de usuarios</p>
                    <p>✅ Ver todos los reportes del sistema</p>
                    <p>✅ Descargar reportes totalizados</p>
                  </>
                )}
                {newRole === 'coordinador' && (
                  <>
                    <p>✅ Acceso a las 5 plantillas de reportes</p>
                    <p>✅ Crear usuarios y cambiar roles</p>
                    <p>✅ Ver todos los reportes del sistema</p>
                    <p>✅ Descargar reportes y vista totalizada</p>
                    <p>✅ Gráficas totalizadas</p>
                    <p>❌ No puede eliminar usuarios ni aprobar reportes</p>
                  </>
                )}
                {newRole === 'doctor' && (
                  <>
                    <p>✅ Acceso a 3 plantillas: Emergencias, Resumen Semanal, Actividades Diarias</p>
                    <p>✅ Crear y editar reportes propios</p>
                    <p>✅ Solo ve sus propios reportes</p>
                    <p>❌ No puede descargar reportes ni gestionar usuarios</p>
                  </>
                )}
                {newRole === 'enfermero' && (
                  <>
                    <p>✅ Acceso a 2 plantillas: Actividades Diarias y Emergencias</p>
                    <p>✅ Crear y ver reportes propios</p>
                    <p>⚠️ Los reportes requieren aprobación de un médico</p>
                    <p>❌ No puede descargar reportes ni gestionar usuarios</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Crear Usuario
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0">
        {[
          { id: 'users' as const, label: 'Todos los Usuarios', count: store.users.length },
          { id: 'reported' as const, label: 'Reportaron Hoy', count: usersReported.length, color: 'text-green-400' },
          { id: 'not_reported' as const, label: 'No Han Reportado', count: usersNotReported.length, color: 'text-red-400' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === tab.id
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-white/40 hover:text-white/60'
              }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id
              ? 'bg-blue-500/20 text-blue-400'
              : tab.color ? `bg-white/5 ${tab.color}` : 'bg-white/5 text-white/30'
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab: Daily Report Status */}
      {(activeTab === 'reported' || activeTab === 'not_reported') && (
        <div className="space-y-4">
          <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'reported' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                {activeTab === 'reported' ? (
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {activeTab === 'reported' ? 'Usuarios que Reportaron Hoy' : 'Usuarios que NO Han Reportado Hoy'}
                </h3>
                <p className="text-xs text-white/30 capitalize">{todayStr} · Se actualiza automáticamente</p>
              </div>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xl font-bold">{store.users.filter(u => u.role !== 'administrador').length}</div>
                <div className="text-[10px] text-white/30">Total Usuarios</div>
              </div>
              <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-green-400">{usersReported.length}</div>
                <div className="text-[10px] text-green-400/50">Reportaron</div>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-red-400">{usersNotReported.length}</div>
                <div className="text-[10px] text-red-400/50">Pendientes</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/30">Progreso del día</span>
                <span className="text-[10px] text-white/50 font-mono">
                  {store.users.filter(u => u.role !== 'administrador').length > 0
                    ? Math.round((usersReported.length / Math.max(store.users.filter(u => u.role !== 'administrador').length, 1)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${store.users.filter(u => u.role !== 'administrador').length > 0
                      ? (usersReported.length / store.users.filter(u => u.role !== 'administrador').length) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>

            {/* User list for this tab */}
            <div className="space-y-2">
              {(activeTab === 'reported' ? usersReported : usersNotReported).map(user => {
                const todayReports = activeTab === 'reported'
                  ? store.reports.filter(r => r.createdByUserId === user.id && r.createdAt.startsWith(new Date().toISOString().split('T')[0]))
                  : [];

                return (
                  <div key={user.id} className={`flex items-center justify-between p-3 rounded-xl border transition ${activeTab === 'reported'
                    ? 'bg-green-500/5 border-green-500/10'
                    : 'bg-red-500/5 border-red-500/10'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${user.role === 'administrador' ? 'bg-blue-500/15' :
                        user.role === 'doctor' ? 'bg-green-500/15' : 'bg-purple-500/15'
                        }`}>
                        {roleIcons[user.role]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{user.name || user.username}</span>
                          <span className="text-[10px] text-white/30 font-mono">@{user.username}</span>
                        </div>
                        <div className="text-[10px] text-white/25">
                          {user.centro || 'Sin centro'} · {user.role}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {activeTab === 'reported' ? (
                        <div>
                          <div className="text-xs text-green-400 font-medium">{todayReports.length} reporte{todayReports.length !== 1 ? 's' : ''}</div>
                          <div className="text-[10px] text-white/25">
                            {todayReports.length > 0 && new Date(todayReports[0].createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400">
                          PENDIENTE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {(activeTab === 'reported' ? usersReported : usersNotReported).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm">
                    {activeTab === 'reported'
                      ? 'Ningún usuario ha reportado hoy todavía'
                      : '¡Todos los usuarios han reportado hoy! 🎉'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: All Users */}
      {activeTab === 'users' && (
        <>
          {/* Filters */}
          <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, usuario, cédula..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/25"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition appearance-none"
              >
                <option value="all" className="bg-[#1f2937]">Todos los roles</option>
                <option value="administrador" className="bg-[#1f2937]">Administradores</option>
                <option value="coordinador" className="bg-[#1f2937]">Coordinadores</option>
                <option value="doctor" className="bg-[#1f2937]">Doctores</option>
                <option value="enfermero" className="bg-[#1f2937]">Enfermeros</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold">{store.users.length}</div>
              <div className="text-xs text-white/40">Total Usuarios</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{store.users.filter(u => u.role === 'administrador').length}</div>
              <div className="text-xs text-white/40">Administradores</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-cyan-400">{store.users.filter(u => u.role === 'coordinador').length}</div>
              <div className="text-xs text-white/40">Coordinadores</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">{store.users.filter(u => u.role === 'doctor').length}</div>
              <div className="text-xs text-white/40">Doctores</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-400">{store.users.filter(u => u.role === 'enfermero').length}</div>
              <div className="text-xs text-white/40">Enfermeros</div>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${user.role === 'administrador' ? 'bg-blue-500/15' :
                      user.role === 'doctor' ? 'bg-green-500/15' : 'bg-purple-500/15'
                      }`}>
                      {roleIcons[user.role]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-semibold">{user.name || <span className="text-white/30 italic">Sin nombre</span>}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleColors[user.role]}`}>
                          {user.role.toUpperCase()}
                        </span>
                        {user.mustChangePassword && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            DEBE CAMBIAR CLAVE
                          </span>
                        )}
                        {!user.profileCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            PERFIL INCOMPLETO
                          </span>
                        )}
                        {user.id === store.currentUser?.id && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            TÚ
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/30">
                        <span className="font-mono text-white/50">@{user.username}</span>
                        {user.cedula && <><span>·</span><span>{user.cedula}</span></>}
                        {user.centro && <><span>·</span><span>{user.centro}</span></>}
                      </div>
                      <div className="text-[10px] text-white/20 mt-1">
                        Creado: {new Date(user.createdAt).toLocaleDateString('es-VE')}
                      </div>
                    </div>
                  </div>

                  {user.id !== store.currentUser?.id && canManageUsers && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Change Role Button */}
                      {(isAdmin || (isCoord && user.role !== 'administrador')) && (
                        <button
                          onClick={() => {
                            setChangeRoleUserId(changeRoleUserId === user.id ? null : user.id);
                            setChangeRoleValue(user.role);
                            setResetPasswordUserId(null);
                            setDeleteConfirmId(null);
                          }}
                          className="px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/20 rounded-lg text-xs font-medium text-cyan-400 transition flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Cambiar Rol
                        </button>
                      )}
                      {/* Reset Password — admin only, or coordinador for non-admin users */}
                      {(isAdmin || (isCoord && user.role !== 'administrador')) && (
                        <button
                          onClick={() => {
                            setResetPasswordUserId(resetPasswordUserId === user.id ? null : user.id);
                            setResetPasswordValue('');
                            setDeleteConfirmId(null);
                            setChangeRoleUserId(null);
                          }}
                          className="px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/20 rounded-lg text-xs font-medium text-yellow-400 transition flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                          </svg>
                          Restablecer Clave
                        </button>
                      )}
                      {/* Delete — admin only */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setDeleteConfirmId(deleteConfirmId === user.id ? null : user.id);
                            setResetPasswordUserId(null);
                            setChangeRoleUserId(null);
                          }}
                          className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/20 rounded-lg text-xs font-medium text-red-400 transition flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Reset Password Panel */}
                {resetPasswordUserId === user.id && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">Nueva contraseña para @{user.username}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={resetPasswordValue}
                            onChange={(e) => setResetPasswordValue(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/20 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setResetPasswordValue(generatePassword())}
                            className="px-3 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-xl text-blue-400 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="px-4 py-2.5 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/20 rounded-xl text-xs font-medium text-yellow-400 transition mt-5"
                      >
                        Restablecer
                      </button>
                      <button
                        onClick={() => { setResetPasswordUserId(null); setResetPasswordValue(''); }}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition mt-5"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Change Role Panel */}
                {changeRoleUserId === user.id && (
                  <div className="mt-4 pt-4 border-t border-cyan-500/20">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">Cambiar rol de @{user.username}</label>
                        <select
                          value={changeRoleValue}
                          onChange={(e) => setChangeRoleValue(e.target.value as UserRole)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500 outline-none transition appearance-none"
                        >
                          {isAdmin && <option value="administrador" className="bg-[#1f2937]">🛡️ Administrador</option>}
                          <option value="coordinador" className="bg-[#1f2937]">📋 Coordinador</option>
                          <option value="doctor" className="bg-[#1f2937]">🩺 Doctor</option>
                          <option value="enfermero" className="bg-[#1f2937]">💉 Enfermero</option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleChangeRole(user.id)}
                        className="px-4 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/20 rounded-xl text-xs font-medium text-cyan-400 transition mt-5"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setChangeRoleUserId(null)}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium transition mt-5"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation — Admin only */}
                {deleteConfirmId === user.id && isAdmin && (
                  <div className="mt-4 pt-4 border-t border-red-500/20">
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-sm text-red-300 flex-1">
                        ¿Está seguro de eliminar al usuario <strong>@{user.username}</strong>? Esta acción no se puede deshacer.
                      </span>
                      <button onClick={() => handleDeleteUser(user.id)} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white transition">Sí, Eliminar</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition">Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-16 bg-[#111827]/60 border border-white/5 rounded-2xl">
                <p className="text-white/30 text-lg font-medium mb-2">No se encontraron usuarios</p>
                <p className="text-white/20 text-sm">Ajuste los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
