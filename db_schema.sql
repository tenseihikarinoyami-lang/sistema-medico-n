-- Crear Tabla de Usuarios (Users)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- En producción, esto debería estar hasheado
  name TEXT,
  role TEXT CHECK (role IN ('administrador', 'coordinador', 'doctor', 'enfermero')),
  cedula TEXT,
  centro TEXT,
  asic TEXT,
  must_change_password BOOLEAN DEFAULT TRUE,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear Tabla de Reportes (Reports)
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id TEXT NOT NULL,
  template_name TEXT,
  config JSONB,
  data JSONB,
  status TEXT CHECK (status IN ('borrador', 'pendiente', 'aprobado', 'enviado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  created_by_user_id UUID REFERENCES users(id),
  approved_by TEXT
);

-- Crear Tabla de Alertas (Alerts)
CREATE TABLE alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT CHECK (type IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  detail TEXT,
  meta TEXT,
  report_id UUID REFERENCES reports(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);
