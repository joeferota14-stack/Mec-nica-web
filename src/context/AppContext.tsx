import { createContext, useContext, useReducer, useEffect, useState, useCallback, ReactNode } from 'react';
import { AppStore, AppAction, InventoryAlertLevel } from '../types';
import { initialMockStore } from '../data/mockData';
import {
  fetchAllData,
  upsertClient,
  upsertVehicle,
  upsertOrder,
  upsertTechnician,
  upsertInventoryItem,
  upsertTransaction,
  upsertAppointment,
} from '../services/db';

function computeAlertLevel(stock: number, minStock: number): InventoryAlertLevel {
  if (stock <= 0) return 'critico';
  if (stock <= minStock) return 'bajo';
  return 'ok';
}

function reducer(state: AppStore, action: AppAction): AppStore {
  switch (action.type) {
    case 'LOAD_FROM_STORAGE':
      return action.payload;

    case 'CLIENT_CREATE':
      return { ...state, clients: [...state.clients, action.payload] };

    case 'CLIENT_UPDATE':
      return { ...state, clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c) };

    case 'VEHICLE_CREATE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };

    case 'VEHICLE_UPDATE':
      return { ...state, vehicles: state.vehicles.map(v => v.id === action.payload.id ? action.payload : v) };

    case 'ORDER_CREATE':
      return { ...state, orders: [...state.orders, action.payload] };

    case 'ORDER_UPDATE':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? action.payload : o) };

    case 'ORDER_STATUS_CHANGE': {
      const now = new Date().toISOString();
      return {
        ...state,
        orders: state.orders.map(o => {
          if (o.id !== action.payload.id) return o;
          const newEvent = {
            id: `evt-${Date.now()}`,
            timestamp: now,
            type: action.payload.status === 'en_proceso' ? 'iniciado' as const
              : action.payload.status === 'listo' ? 'completado' as const
              : action.payload.status === 'entregado' ? 'entregado' as const
              : action.payload.status === 'aprobado' ? 'aprobado' as const
              : 'nota' as const,
            description: action.payload.note ?? `Estado cambiado a ${action.payload.status}`,
          };
          return {
            ...o,
            status: action.payload.status,
            updatedAt: now,
            actualDelivery: action.payload.status === 'entregado' ? now : o.actualDelivery,
            timeline: [...o.timeline, newEvent],
          };
        }),
      };
    }

    case 'TECHNICIAN_UPDATE': {
      const exists = state.technicians.find(t => t.id === action.payload.id);
      return {
        ...state,
        technicians: exists
          ? state.technicians.map(t => t.id === action.payload.id ? action.payload : t)
          : [...state.technicians, action.payload],
      };
    }

    case 'INVENTORY_UPDATE': {
      const updated = { ...action.payload, alertLevel: computeAlertLevel(action.payload.stock, action.payload.minStock) };
      const exists = state.inventory.find(i => i.id === updated.id);
      return {
        ...state,
        inventory: exists
          ? state.inventory.map(i => i.id === updated.id ? updated : i)
          : [...state.inventory, updated],
      };
    }

    case 'INVENTORY_CONSUME': {
      return {
        ...state,
        inventory: state.inventory.map(item => {
          if (item.id !== action.payload.itemId) return item;
          const newStock = Math.max(0, item.stock - action.payload.quantity);
          return { ...item, stock: newStock, alertLevel: computeAlertLevel(newStock, item.minStock), lastUpdated: new Date().toISOString() };
        }),
      };
    }

    case 'TRANSACTION_CREATE':
      return { ...state, transactions: [...state.transactions, action.payload] };

    case 'APPOINTMENT_CREATE':
      return { ...state, appointments: [...state.appointments, action.payload] };

    case 'APPOINTMENT_UPDATE':
      return { ...state, appointments: state.appointments.map(a => a.id === action.payload.id ? action.payload : a) };

    case 'APPOINTMENT_STATUS_CHANGE':
      return { ...state, appointments: state.appointments.map(a => a.id === action.payload.id ? { ...a, status: action.payload.status } : a) };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppStore;
  dispatch: React.Dispatch<AppAction>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialMockStore);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial desde Supabase
  useEffect(() => {
    fetchAllData()
      .then(data => {
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: data });
      })
      .catch(err => {
        console.error('Error cargando datos desde Supabase:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Dispatch wrapeado que sincroniza a Supabase en background
  const syncDispatch = useCallback((action: AppAction) => {
    dispatch(action);

    // Sincronización optimista — no bloquea la UI
    switch (action.type) {
      case 'CLIENT_CREATE':
      case 'CLIENT_UPDATE':
        upsertClient(action.payload).catch(console.error);
        break;

      case 'VEHICLE_CREATE':
      case 'VEHICLE_UPDATE':
        upsertVehicle(action.payload).catch(console.error);
        break;

      case 'ORDER_CREATE':
        upsertOrder(action.payload).catch(console.error);
        break;

      case 'ORDER_UPDATE':
        upsertOrder(action.payload).catch(console.error);
        break;

      case 'ORDER_STATUS_CHANGE': {
        // Reconstruimos la orden actualizada con la misma lógica del reducer
        // para poder hacer upsert sin esperar el re-render
        const now = new Date().toISOString();
        // state aún tiene el valor ANTERIOR al dispatch — buscamos la orden ahí
        // y aplicamos el cambio manualmente para el upsert
        const orderToSync = state.orders.find(o => o.id === action.payload.id);
        if (orderToSync) {
          const newEvent = {
            id: `evt-${Date.now()}`,
            timestamp: now,
            type: action.payload.status === 'en_proceso' ? 'iniciado' as const
              : action.payload.status === 'listo' ? 'completado' as const
              : action.payload.status === 'entregado' ? 'entregado' as const
              : action.payload.status === 'aprobado' ? 'aprobado' as const
              : 'nota' as const,
            description: action.payload.note ?? `Estado cambiado a ${action.payload.status}`,
          };
          upsertOrder({
            ...orderToSync,
            status: action.payload.status,
            updatedAt: now,
            actualDelivery: action.payload.status === 'entregado' ? now : orderToSync.actualDelivery,
            timeline: [...orderToSync.timeline, newEvent],
          }).catch(console.error);
        }
        break;
      }

      case 'TECHNICIAN_UPDATE':
        upsertTechnician(action.payload).catch(console.error);
        break;

      case 'INVENTORY_UPDATE':
        upsertInventoryItem(action.payload).catch(console.error);
        break;

      case 'INVENTORY_CONSUME': {
        const itemToSync = state.inventory.find(i => i.id === action.payload.itemId);
        if (itemToSync) {
          const newStock = Math.max(0, itemToSync.stock - action.payload.quantity);
          upsertInventoryItem({
            ...itemToSync,
            stock: newStock,
            alertLevel: computeAlertLevel(newStock, itemToSync.minStock),
            lastUpdated: new Date().toISOString(),
          }).catch(console.error);
        }
        break;
      }

      case 'TRANSACTION_CREATE':
        upsertTransaction(action.payload).catch(console.error);
        break;

      case 'APPOINTMENT_CREATE':
      case 'APPOINTMENT_UPDATE':
        upsertAppointment(action.payload).catch(console.error);
        break;

      case 'APPOINTMENT_STATUS_CHANGE': {
        const apptToSync = state.appointments.find(a => a.id === action.payload.id);
        if (apptToSync) {
          upsertAppointment({ ...apptToSync, status: action.payload.status }).catch(console.error);
        }
        break;
      }
    }
  }, []);

  // Sincronización de casos especiales que no tienen el payload completo
  useEffect(() => {
    if (isLoading) return;
    // ORDER_STATUS_CHANGE y APPOINTMENT_STATUS_CHANGE: sincronizar entidades afectadas
    // Los demás casos ya están cubiertos en syncDispatch
  }, [state.orders, state.appointments, isLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch: syncDispatch, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
