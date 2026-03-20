import { supabase } from './supabaseClient';
import {
  AppStore,
  Client,
  Vehicle,
  WorkOrder,
  Technician,
  InventoryItem,
  FinancialTransaction,
  Appointment,
} from '../types';

// ─── MAPPERS camelCase ↔ snake_case ──────────────────────────

function toClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: row.email as string | undefined,
    rfc: row.rfc as string | undefined,
    address: row.address as string | undefined,
    createdAt: row.created_at as string,
    notes: row.notes as string | undefined,
  };
}

function fromClient(c: Client) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email ?? null,
    rfc: c.rfc ?? null,
    address: c.address ?? null,
    created_at: c.createdAt,
    notes: c.notes ?? null,
  };
}

function toVehicle(row: Record<string, unknown>): Vehicle {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    brand: row.brand as string,
    model: row.model as string,
    year: row.year as number,
    plate: row.plate as string,
    vin: row.vin as string | undefined,
    color: row.color as string | undefined,
    mileage: row.mileage as number,
    fuelType: row.fuel_type as Vehicle['fuelType'],
    transmission: row.transmission as Vehicle['transmission'],
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  };
}

function fromVehicle(v: Vehicle) {
  return {
    id: v.id,
    client_id: v.clientId,
    brand: v.brand,
    model: v.model,
    year: v.year,
    plate: v.plate,
    vin: v.vin ?? null,
    color: v.color ?? null,
    mileage: v.mileage,
    fuel_type: v.fuelType,
    transmission: v.transmission,
    notes: v.notes ?? null,
    created_at: v.createdAt,
  };
}

function toOrder(row: Record<string, unknown>): WorkOrder {
  return {
    id: row.id as string,
    vehicleId: row.vehicle_id as string,
    clientId: row.client_id as string,
    technicianId: row.technician_id as string | undefined,
    status: row.status as WorkOrder['status'],
    priority: row.priority as WorkOrder['priority'],
    description: row.description as string,
    diagnosis: row.diagnosis as string | undefined,
    lineItems: (row.line_items as WorkOrder['lineItems']) ?? [],
    subtotal: row.subtotal as number,
    discount: row.discount as number,
    tax: row.tax as number,
    total: row.total as number,
    paymentStatus: row.payment_status as WorkOrder['paymentStatus'],
    amountPaid: row.amount_paid as number,
    estimatedDelivery: row.estimated_delivery as string | undefined,
    actualDelivery: row.actual_delivery as string | undefined,
    mileageIn: row.mileage_in as number,
    mileageOut: row.mileage_out as number | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    timeline: (row.timeline as WorkOrder['timeline']) ?? [],
  };
}

function fromOrder(o: WorkOrder) {
  return {
    id: o.id,
    vehicle_id: o.vehicleId,
    client_id: o.clientId,
    technician_id: o.technicianId ?? null,
    status: o.status,
    priority: o.priority,
    description: o.description,
    diagnosis: o.diagnosis ?? null,
    line_items: o.lineItems,
    subtotal: o.subtotal,
    discount: o.discount,
    tax: o.tax,
    total: o.total,
    payment_status: o.paymentStatus,
    amount_paid: o.amountPaid,
    estimated_delivery: o.estimatedDelivery ?? null,
    actual_delivery: o.actualDelivery ?? null,
    mileage_in: o.mileageIn,
    mileage_out: o.mileageOut ?? null,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
    timeline: o.timeline,
  };
}

function toTechnician(row: Record<string, unknown>): Technician {
  return {
    id: row.id as string,
    name: row.name as string,
    specialty: (row.specialty as string[]) ?? [],
    phone: row.phone as string | undefined,
    status: row.status as Technician['status'],
    activeOrderId: row.active_order_id as string | undefined,
    efficiency: row.efficiency as number,
    completedOrders: row.completed_orders as number,
    hireDate: row.hire_date as string,
  };
}

function fromTechnician(t: Technician) {
  return {
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    phone: t.phone ?? null,
    status: t.status,
    active_order_id: t.activeOrderId ?? null,
    efficiency: t.efficiency,
    completed_orders: t.completedOrders,
    hire_date: t.hireDate,
  };
}

function toInventoryItem(row: Record<string, unknown>): InventoryItem {
  return {
    id: row.id as string,
    sku: row.sku as string,
    name: row.name as string,
    category: row.category as string,
    brand: row.brand as string | undefined,
    unit: row.unit as string,
    stock: row.stock as number,
    minStock: row.min_stock as number,
    cost: row.cost as number,
    price: row.price as number,
    location: row.location as string | undefined,
    alertLevel: row.alert_level as InventoryItem['alertLevel'],
    lastUpdated: row.last_updated as string,
  };
}

function fromInventoryItem(i: InventoryItem) {
  return {
    id: i.id,
    sku: i.sku,
    name: i.name,
    category: i.category,
    brand: i.brand ?? null,
    unit: i.unit,
    stock: i.stock,
    min_stock: i.minStock,
    cost: i.cost,
    price: i.price,
    location: i.location ?? null,
    alert_level: i.alertLevel,
    last_updated: i.lastUpdated,
  };
}

function toTransaction(row: Record<string, unknown>): FinancialTransaction {
  return {
    id: row.id as string,
    type: row.type as FinancialTransaction['type'],
    category: row.category as string,
    orderId: row.order_id as string | undefined,
    amount: row.amount as number,
    description: row.description as string,
    date: row.date as string,
    paymentMethod: row.payment_method as FinancialTransaction['paymentMethod'],
  };
}

function fromTransaction(t: FinancialTransaction) {
  return {
    id: t.id,
    type: t.type,
    category: t.category,
    order_id: t.orderId ?? null,
    amount: t.amount,
    description: t.description,
    date: t.date,
    payment_method: t.paymentMethod,
  };
}

function toAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: row.id as string,
    clientId: row.client_id as string | undefined,
    clientName: row.client_name as string,
    clientPhone: row.client_phone as string,
    vehicleDescription: row.vehicle_description as string,
    vehicleId: row.vehicle_id as string | undefined,
    serviceType: row.service_type as string,
    estimatedDuration: row.estimated_duration as number,
    date: row.date as string,
    time: row.time as string,
    status: row.status as Appointment['status'],
    technicianId: row.technician_id as string | undefined,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  };
}

function fromAppointment(a: Appointment) {
  return {
    id: a.id,
    client_id: a.clientId ?? null,
    client_name: a.clientName,
    client_phone: a.clientPhone,
    vehicle_description: a.vehicleDescription,
    vehicle_id: a.vehicleId ?? null,
    service_type: a.serviceType,
    estimated_duration: a.estimatedDuration,
    date: a.date,
    time: a.time,
    status: a.status,
    technician_id: a.technicianId ?? null,
    notes: a.notes ?? null,
    created_at: a.createdAt,
  };
}

// ─── FETCH ALL (carga inicial en paralelo) ───────────────────

export async function fetchAllData(): Promise<AppStore> {
  const [
    { data: clients, error: e1 },
    { data: vehicles, error: e2 },
    { data: orders, error: e3 },
    { data: technicians, error: e4 },
    { data: inventory, error: e5 },
    { data: transactions, error: e6 },
    { data: appointments, error: e7 },
  ] = await Promise.all([
    supabase.from('clients').select('*').order('created_at', { ascending: true }),
    supabase.from('vehicles').select('*').order('created_at', { ascending: true }),
    supabase.from('work_orders').select('*').order('created_at', { ascending: true }),
    supabase.from('technicians').select('*'),
    supabase.from('inventory_items').select('*'),
    supabase.from('financial_transactions').select('*').order('date', { ascending: true }),
    supabase.from('appointments').select('*').order('date', { ascending: true }),
  ]);

  const errors = { clients: e1, vehicles: e2, orders: e3, technicians: e4, inventory: e5, transactions: e6, appointments: e7 };
  Object.entries(errors).forEach(([table, err]) => {
    if (err) console.error(`[Supabase] Error en tabla "${table}":`, err.message);
  });

  return {
    clients: (clients ?? []).map(r => toClient(r as Record<string, unknown>)),
    vehicles: (vehicles ?? []).map(r => toVehicle(r as Record<string, unknown>)),
    orders: (orders ?? []).map(r => toOrder(r as Record<string, unknown>)),
    technicians: (technicians ?? []).map(r => toTechnician(r as Record<string, unknown>)),
    inventory: (inventory ?? []).map(r => toInventoryItem(r as Record<string, unknown>)),
    transactions: (transactions ?? []).map(r => toTransaction(r as Record<string, unknown>)),
    appointments: (appointments ?? []).map(r => toAppointment(r as Record<string, unknown>)),
  };
}

// ─── UPSERT por entidad ──────────────────────────────────────

export async function upsertClient(client: Client) {
  await supabase.from('clients').upsert(fromClient(client));
}

export async function upsertVehicle(vehicle: Vehicle) {
  await supabase.from('vehicles').upsert(fromVehicle(vehicle));
}

export async function upsertOrder(order: WorkOrder) {
  await supabase.from('work_orders').upsert(fromOrder(order));
}

export async function upsertTechnician(tech: Technician) {
  await supabase.from('technicians').upsert(fromTechnician(tech));
}

export async function upsertInventoryItem(item: InventoryItem) {
  await supabase.from('inventory_items').upsert(fromInventoryItem(item));
}

export async function upsertTransaction(tx: FinancialTransaction) {
  await supabase.from('financial_transactions').upsert(fromTransaction(tx));
}

export async function upsertAppointment(appt: Appointment) {
  await supabase.from('appointments').upsert(fromAppointment(appt));
}
