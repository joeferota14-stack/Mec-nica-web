-- ============================================================
-- WLAS MOTOR — Schema de base de datos para Supabase
-- Ejecuta este script en: Supabase → SQL Editor → New query
-- ============================================================

create table public.clients (
  id text primary key,
  name text not null,
  phone text not null,
  email text,
  rfc text,
  address text,
  created_at timestamptz not null default now(),
  notes text
);

create table public.vehicles (
  id text primary key,
  client_id text references public.clients(id),
  brand text not null,
  model text not null,
  year integer not null,
  plate text not null,
  vin text,
  color text,
  mileage integer not null default 0,
  fuel_type text not null,
  transmission text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.technicians (
  id text primary key,
  name text not null,
  specialty jsonb not null default '[]',
  phone text,
  status text not null default 'disponible',
  active_order_id text,
  efficiency integer not null default 100,
  completed_orders integer not null default 0,
  hire_date text not null
);

create table public.work_orders (
  id text primary key,
  vehicle_id text references public.vehicles(id),
  client_id text references public.clients(id),
  technician_id text references public.technicians(id),
  status text not null default 'presupuesto',
  priority text not null default 'normal',
  description text not null,
  diagnosis text,
  line_items jsonb not null default '[]',
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  payment_status text not null default 'pendiente',
  amount_paid numeric not null default 0,
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  mileage_in integer not null default 0,
  mileage_out integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  timeline jsonb not null default '[]'
);

create table public.inventory_items (
  id text primary key,
  sku text not null,
  name text not null,
  category text not null,
  brand text,
  unit text not null default 'pieza',
  stock integer not null default 0,
  min_stock integer not null default 0,
  cost numeric not null default 0,
  price numeric not null default 0,
  location text,
  alert_level text not null default 'ok',
  last_updated timestamptz not null default now()
);

create table public.financial_transactions (
  id text primary key,
  type text not null,
  category text not null,
  order_id text references public.work_orders(id),
  amount numeric not null,
  description text not null,
  date text not null,
  payment_method text not null
);

create table public.appointments (
  id text primary key,
  client_id text references public.clients(id),
  client_name text not null,
  client_phone text not null,
  vehicle_description text not null,
  vehicle_id text references public.vehicles(id),
  service_type text not null,
  estimated_duration integer not null default 60,
  date text not null,
  time text not null,
  status text not null default 'pendiente',
  technician_id text references public.technicians(id),
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Deshabilitar RLS para uso sin autenticación (MVP)
-- Cuando agregues auth, habilita RLS y define políticas
-- ============================================================

alter table public.clients disable row level security;
alter table public.vehicles disable row level security;
alter table public.technicians disable row level security;
alter table public.work_orders disable row level security;
alter table public.inventory_items disable row level security;
alter table public.financial_transactions disable row level security;
alter table public.appointments disable row level security;
