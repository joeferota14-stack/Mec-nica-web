import { Suspense, lazy, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const NewOrderPage = lazy(() => import('./pages/NewOrderPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const VehiclesPage = lazy(() => import('./pages/VehiclesPage'));
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const TechniciansPage = lazy(() => import('./pages/TechniciansPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));

function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 300,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
      }}
    >
      Cargando...
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Mobile overlay — closes sidebar when tapping outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area — offset by sidebar on desktop */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 lg:ml-[240px]">
        <Topbar onMenuToggle={() => setSidebarOpen((s) => !s)} />

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#0A0A0A',
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/new" element={<NewOrderPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="technicians" element={<TechniciansPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="tracking" element={<TrackingPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="ai-assistant" element={<AIAssistantPage />} />
              <Route path="*" element={<Navigate to="overview" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
