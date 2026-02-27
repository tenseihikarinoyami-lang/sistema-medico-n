import { useState, useEffect } from 'react';
import type { useAppStore } from '../store';
import { CENTROS_SALUD, ASIC_OPTIONS } from '../data/templates';

type StoreType = ReturnType<typeof useAppStore>;

export function ProfileView({ store }: { store: StoreType }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Profile editing
  const [editName, setEditName] = useState('');
  const [editCedula, setEditCedula] = useState('');
  const [editCentro, setEditCentro] = useState('');
  const [editAsic, setEditAsic] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);

  const user = store.currentUser;
  const mustChange = user?.mustChangePassword;
  const needsProfile = !user?.profileCompleted;

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditCedula(user.cedula || '');
      setEditCentro(user.centro || '');
      setEditAsic(user.asic || '');
      if (needsProfile && !mustChange) {
        setEditingProfile(true);
      }
    }
  }, [user, needsProfile, mustChange]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword) { setPassError('Ingrese su contraseña actual'); return; }
    if (!newPassword) { setPassError('Ingrese la nueva contraseña'); return; }
    if (newPassword.length < 6) { setPassError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (newPassword !== confirmPassword) { setPassError('Las contraseñas no coinciden'); return; }
    if (currentPassword === newPassword) { setPassError('La nueva contraseña debe ser diferente a la actual'); return; }

    const result = await store.changePassword(currentPassword, newPassword);
    if (result.success) {
      setPassSuccess('¡Contraseña actualizada exitosamente!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (mustChange) {
        setTimeout(() => {
          if (!user?.profileCompleted) {
            setEditingProfile(true);
          } else {
            store.setCurrentView('dashboard');
          }
        }, 1500);
      }
    } else {
      setPassError(result.error || 'Error al cambiar la contraseña');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const result = await store.updateProfile({
      name: editName,
      cedula: editCedula,
      centro: editCentro,
      asic: editAsic
    });

    if (result.success) {
      setProfileSuccess('¡Perfil actualizado exitosamente!');
      setEditingProfile(false);
      if (needsProfile) {
        setTimeout(() => {
          store.setCurrentView('dashboard');
        }, 1500);
      }
    } else {
      setProfileError(result.error || 'Error al actualizar perfil');
    }
  };

  const getPasswordStrength = (pass: string): { level: number; label: string; color: string } => {
    if (!pass) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { level: 1, label: 'Débil', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Regular', color: 'bg-yellow-500' };
    if (score <= 3) return { level: 3, label: 'Buena', color: 'bg-blue-500' };
    return { level: 4, label: 'Fuerte', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(newPassword);

  // If must change password, only show password form
  if (mustChange) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-yellow-400 mb-1">Cambio de contraseña obligatorio</h3>
              <p className="text-xs text-yellow-300/60">
                Su contraseña fue asignada por el administrador. Por seguridad, debe cambiarla antes de poder usar el sistema.
              </p>
            </div>
          </div>
        </div>
        {renderPasswordForm()}
      </div>
    );
  }

  // If needs profile completion (no password change needed), show profile form
  if (needsProfile && editingProfile) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-400 mb-1">Complete su perfil</h3>
              <p className="text-xs text-blue-300/60">
                Es la primera vez que ingresa. Por favor complete sus datos personales para continuar usando el sistema.
              </p>
            </div>
          </div>
        </div>
        {renderProfileForm()}
      </div>
    );
  }

  // Normal profile view
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* User Info Card */}
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            Mi Perfil
          </h2>
          <button
            onClick={() => setEditingProfile(true)}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-xl text-xs font-medium text-blue-400 transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Datos
          </button>
        </div>

        {profileSuccess && (
          <div className="flex items-center gap-3 p-3.5 mb-5 bg-green-500/10 border border-green-500/20 rounded-xl">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-300">{profileSuccess}</span>
          </div>
        )}

        {editingProfile ? renderProfileForm() : (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <InfoCard label="Nombre Completo" value={user?.name || 'Sin definir'} />
            <InfoCard label="Usuario" value={`@${user?.username}`} highlight />
            <InfoCard label="Rol" value={user?.role || ''} badge={
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user?.role === 'administrador' ? 'bg-blue-500/20 text-blue-400' :
                  user?.role === 'coordinador' ? 'bg-cyan-500/20 text-cyan-400' :
                    user?.role === 'doctor' ? 'bg-green-500/20 text-green-400' :
                      'bg-purple-500/20 text-purple-400'
                }`}>
                {user?.role === 'administrador' ? '🛡️' : user?.role === 'coordinador' ? '📋' : user?.role === 'doctor' ? '🩺' : '💉'}
                {user?.role}
              </span>
            } />
            <InfoCard label="Cédula" value={user?.cedula || 'Sin definir'} />
            <InfoCard label="Centro de Salud" value={user?.centro || 'Sin definir'} />
            <InfoCard label="ASIC" value={user?.asic ? ASIC_OPTIONS.find(a => a.value === user.asic)?.label || user.asic : 'Sin definir'} />
          </div>
        )}
      </div>

      {/* Change Password Form */}
      {renderPasswordForm()}

      {/* Security Tips */}
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Consejos de Seguridad
        </h3>
        <ul className="space-y-2">
          {[
            'Use al menos 8 caracteres con letras mayúsculas, minúsculas y números',
            'No comparta su contraseña con otros usuarios del sistema',
            'Cambie su contraseña periódicamente (cada 90 días recomendado)',
            'No use la misma contraseña que en otros sistemas',
            'Si sospecha que su cuenta fue comprometida, contacte al administrador'
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-white/40">
              <span className="w-1.5 h-1.5 bg-blue-500/50 rounded-full flex-shrink-0 mt-1" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  function renderProfileForm() {
    return (
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Datos Personales
        </h3>
        <p className="text-xs text-white/30 mb-6">Complete su información para que el sistema funcione correctamente.</p>

        {profileError && (
          <div className="flex items-center gap-3 p-3.5 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-300">{profileError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Nombre Completo *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ej: Dr. Juan Pérez"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Cédula de Identidad *</label>
              <input
                type="text"
                value={editCedula}
                onChange={(e) => setEditCedula(e.target.value)}
                placeholder="Ej: V-12345678"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Centro de Salud *</label>
              <select
                value={editCentro}
                onChange={(e) => setEditCentro(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition appearance-none"
              >
                <option value="" className="bg-[#1f2937]">Seleccionar centro...</option>
                {CENTROS_SALUD.map(c => (
                  <option key={c.value} value={c.label} className="bg-[#1f2937]">{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">ASIC *</label>
              <select
                value={editAsic}
                onChange={(e) => setEditAsic(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition appearance-none"
              >
                <option value="" className="bg-[#1f2937]">Seleccionar ASIC...</option>
                {ASIC_OPTIONS.map(a => (
                  <option key={a.value} value={a.value} className="bg-[#1f2937]">{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar Datos
            </button>
            {!needsProfile && (
              <button
                type="button"
                onClick={() => { setEditingProfile(false); setProfileError(''); }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  function renderPasswordForm() {
    return (
      <div className="bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
          Cambiar Contraseña
        </h3>
        <p className="text-xs text-white/30 mb-6">
          {mustChange
            ? 'Debe establecer una contraseña personal para continuar usando el sistema.'
            : 'Actualice su contraseña periódicamente para mantener la seguridad de su cuenta.'
          }
        </p>

        {passError && (
          <div className="flex items-center gap-3 p-3.5 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-300">{passError}</span>
          </div>
        )}

        {passSuccess && (
          <div className="flex items-center gap-3 p-3.5 mb-5 bg-green-500/10 border border-green-500/20 rounded-xl">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-300">{passSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Contraseña Actual</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPassError(''); }}
                placeholder="Ingrese su contraseña actual"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/20"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showCurrentPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPassError(''); }}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-white/20"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showNewPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {newPassword && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : 'bg-white/10'}`} />
                  ))}
                </div>
                <p className={`text-[11px] ${strength.level <= 1 ? 'text-red-400' : strength.level <= 2 ? 'text-yellow-400' : strength.level <= 3 ? 'text-blue-400' : 'text-green-400'}`}>
                  Fortaleza: {strength.label}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPassError(''); }}
                placeholder="Repita la nueva contraseña"
                className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:ring-1 outline-none transition placeholder:text-white/20 ${confirmPassword && confirmPassword !== newPassword
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500'
                    : confirmPassword && confirmPassword === newPassword
                      ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500'
                      : 'border-white/10 focus:border-blue-500 focus:ring-blue-500'
                  }`}
              />
              {confirmPassword && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {confirmPassword === newPassword ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Actualizar Contraseña
            </button>
            {!mustChange && (
              <button
                type="button"
                onClick={() => store.setCurrentView('dashboard')}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }
}

function InfoCard({ label, value, highlight, badge }: { label: string; value: string; highlight?: boolean; badge?: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</div>
      {badge ? (
        <div className="text-sm font-semibold capitalize">{badge}</div>
      ) : (
        <div className={`text-sm font-semibold ${highlight ? 'font-mono text-blue-400' : ''}`}>{value}</div>
      )}
    </div>
  );
}
