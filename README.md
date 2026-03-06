# Ethernodes Clone — Deploy Guide

## Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: Supabase (optional, works without it)
- **Hosting**: Railway
- **Domain**: Tu dominio propio

---

## 🚀 Deploy en Railway (Paso a paso)

### 1. Preparar el repositorio

```bash
cd ethernodes-clone
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USER/ethernodes-app.git
git push -u origin main
```

### 2. Crear proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona tu repositorio
4. Railway detectará el Dockerfile automáticamente

### 3. Variables de entorno en Railway

En Railway → tu proyecto → **Variables**, añade:

```
ADMIN_EMAIL=tu@email.com
ADMIN_PASSWORD=TuPasswordSegura123!
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**IMPORTANTE**: Si no usas Supabase, solo necesitas:
```
ADMIN_EMAIL=tu@email.com
ADMIN_PASSWORD=TuPasswordSegura123!
```
El sistema funciona sin base de datos.

### 4. Configurar dominio personalizado

1. En Railway → tu proyecto → **Settings** → **Domains**
2. Click **"Add Custom Domain"**
3. Escribe tu dominio (ej: `app.tudominio.com`)
4. Railway te dará un CNAME como: `XXXX.railway.app`
5. Ve a tu proveedor DNS y añade:
   ```
   Tipo: CNAME
   Host: app (o @ para root)
   Valor: XXXX.railway.app
   TTL: 300 (o más bajo posible)
   ```
6. La propagación tarda 5-30 minutos

---

## 🗄️ Supabase (Opcional pero recomendado)

### Configurar base de datos

1. Crea proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor**
3. Pega el contenido de `supabase-schema.sql` y ejecuta
4. Copia tus credenciales en Railway (ver paso 3)

---

## 🔐 Credenciales por defecto

Una vez desplegado, accede con:
- **Email**: el que pongas en `ADMIN_EMAIL`
- **Password**: el que pongas en `ADMIN_PASSWORD`

---

## 📊 Panel de métricas

La página `/dashboard/metrics` muestra:
- **169 ETH** stakeados (configurable en Settings)
- APR en tiempo real con gráficos
- Validadores activos
- Recompensas distribuidas

Para cambiar los valores: ve a **Configuración** en el panel.

---

## 🌐 Estructura del proyecto

```
app/
├── login/          → Página de login (clon exacto)
├── dashboard/
│   ├── metrics/    → Panel principal métricas
│   ├── validators/ → Lista de validadores
│   ├── operators/  → Panel operadores
│   └── settings/  → Configurar valores
├── api/
│   ├── auth/login  → Endpoint login
│   ├── auth/logout → Endpoint logout
│   └── metrics/    → API métricas
components/
├── DashboardShell  → Layout sidebar
└── AprChart        → Gráfico APR
lib/
├── auth.ts         → Gestión sesiones
├── metrics.ts      → Datos métricas
└── supabase.ts     → Cliente Supabase
```

---

## ⚡ Deploy rápido sin Docker

Si prefieres sin Dockerfile, en Railway:
1. Elimina el `Dockerfile`
2. Railway usará buildpack de Node automáticamente
3. Añade `"start": "next start -p $PORT"` en package.json

---

## 🔧 Desarrollo local

```bash
npm install
cp .env.example .env.local
# Edita .env.local con tus valores
npm run dev
# Abre http://localhost:3000
```
