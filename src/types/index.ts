// ─── STATUS TYPES ───────────────────────────────────────────
export type OrderStatus = 'presupuesto' | 'aprobado' | 'en_proceso' | 'pausado' | 'listo' | 'entregado' | 'cancelado';
export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
export type InventoryAlertLevel = 'ok' | 'bajo' | 'critico';
export type PaymentStatus = 'pendiente' | 'parcial' | 'pagado';
export type TechnicianStatus = 'disponible' | 'ocupado' | 'ausente';
export type FuelType = 'gasolina' | 'diesel' | 'hibrido' | 'electrico';
export type TransmissionType = 'manual' | 'automatica' | 'cvt';
export type LineItemType = 'servicio' | 'refaccion' | 'mano_de_obra';
export type TransactionType = 'ingreso' | 'egreso';
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';
export type OrderPriority = 'normal' | 'urgente' | 'vip';
export type TimelineEventType = 'creado' | 'aprobado' | 'iniciado' | 'pausado' | 'completado' | 'entregado' | 'nota';

// ─── CLIENT ─────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  rfc?: string;
  address?: string;
  createdAt: string;
  notes?: string;
}

// ─── VEHICLE ─────────────────────────────────────────────────
export interface Vehicle {
  id: string;
  clientId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin?: string;
  color?: string;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  notes?: string;
  createdAt: string;
}

// ─── ORDER LINE ITEM ──────────────────────────────────────────
export interface OrderLineItem {
  id: string;
  description: string;
  type: LineItemType;
  quantity: number;
  unitPrice: number;
  inventoryItemId?: string;
  technicianId?: string;
  completedAt?: string;
}

// ─── ORDER TIMELINE EVENT ────────────────────────────────────
export interface OrderTimelineEvent {
  id: string;
  timestamp: string;
  type: TimelineEventType;
  description: string;
  technicianId?: string;
}

// ─── WORK ORDER ──────────────────────────────────────────────
export interface WorkOrder {
  id: string;
  vehicleId: string;
  clientId: string;
  technicianId?: string;
  status: OrderStatus;
  priority: OrderPriority;
  description: string;
  diagnosis?: string;
  lineItems: OrderLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  estimatedDelivery?: string;
  actualDelivery?: string;
  mileageIn: number;
  mileageOut?: number;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
}

// ─── TECHNICIAN ──────────────────────────────────────────────
export interface Technician {
  id: string;
  name: string;
  specialty: string[];
  phone?: string;
  status: TechnicianStatus;
  activeOrderId?: string;
  efficiency: number;
  completedOrders: number;
  hireDate: string;
}

// ─── INVENTORY ITEM ──────────────────────────────────────────
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand?: string;
  unit: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
  location?: string;
  alertLevel: InventoryAlertLevel;
  lastUpdated: string;
}

// ─── FINANCIAL TRANSACTION ───────────────────────────────────
export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  category: string;
  orderId?: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: PaymentMethod;
}

// ─── APPOINTMENT ─────────────────────────────────────────────
export interface Appointment {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone: string;
  vehicleDescription: string;
  vehicleId?: string;
  serviceType: string;
  estimatedDuration: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  technicianId?: string;
  notes?: string;
  createdAt: string;
}

// ─── AI MESSAGE ──────────────────────────────────────────────
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ─── APP STORE ───────────────────────────────────────────────
export interface AppStore {
  clients: Client[];
  vehicles: Vehicle[];
  orders: WorkOrder[];
  technicians: Technician[];
  inventory: InventoryItem[];
  transactions: FinancialTransaction[];
  appointments: Appointment[];
}

// ─── APP ACTIONS ─────────────────────────────────────────────
export type AppAction =
  | { type: 'LOAD_FROM_STORAGE'; payload: AppStore }
  | { type: 'CLIENT_CREATE'; payload: Client }
  | { type: 'CLIENT_UPDATE'; payload: Client }
  | { type: 'VEHICLE_CREATE'; payload: Vehicle }
  | { type: 'VEHICLE_UPDATE'; payload: Vehicle }
  | { type: 'ORDER_CREATE'; payload: WorkOrder }
  | { type: 'ORDER_UPDATE'; payload: WorkOrder }
  | { type: 'ORDER_STATUS_CHANGE'; payload: { id: string; status: OrderStatus; note?: string } }
  | { type: 'TECHNICIAN_UPDATE'; payload: Technician }
  | { type: 'INVENTORY_UPDATE'; payload: InventoryItem }
  | { type: 'INVENTORY_CONSUME'; payload: { itemId: string; quantity: number } }
  | { type: 'TRANSACTION_CREATE'; payload: FinancialTransaction }
  | { type: 'APPOINTMENT_CREATE'; payload: Appointment }
  | { type: 'APPOINTMENT_UPDATE'; payload: Appointment }
  | { type: 'APPOINTMENT_STATUS_CHANGE'; payload: { id: string; status: AppointmentStatus } };
