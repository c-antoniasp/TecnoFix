import React from 'react';
import { EquipmentTypeManagement, EquipmentType } from './EquipmentTypeManagement';

// ==============================================================================
// TecnoFix - Componente: TecnoFixDashboard
// Estándar Codexia: TypeScript (.tsx), paleta oficial TecnoFix, navegación por tabs.
// ==============================================================================

export interface UserSession {
  userId: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'CLIENT';
}

export interface TecnoFixDashboardProps {
  role: string;
  user: UserSession;
  onLogout: () => void;
  // Props para catálogo de tipos de equipo (ADM-001)
  equipmentTypes: EquipmentType[];
  isLoadingEquipmentTypes?: boolean;
  equipmentTypeError?: string | null;
  onClearEquipmentTypeError?: () => void;
  onCreateEquipmentType: (data: { name: string; description?: string }) => Promise<boolean>;
  onUpdateEquipmentType: (id: number, data: { name: string; description?: string }) => Promise<boolean>;
  onToggleEquipmentTypeStatus: (id: number) => Promise<boolean>;
  onRefreshEquipmentTypes?: () => void;
}

export const TecnoFixDashboard: React.FC<TecnoFixDashboardProps> = ({
  role,
  user,
  onLogout,
  equipmentTypes,
  isLoadingEquipmentTypes,
  equipmentTypeError,
  onClearEquipmentTypeError,
  onCreateEquipmentType,
  onUpdateEquipmentType,
  onToggleEquipmentTypeStatus,
  onRefreshEquipmentTypes,
}) => {
  const [activeTab, setActiveTab] = React.useState<'EQUIPMENT_CATALOG' | 'ORDERS'>('EQUIPMENT_CATALOG');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#F1F5F9' }}>
      {/* Menú lateral */}
      <aside style={{ width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px', color: '#10B981', fontWeight: 'bold' }}>🔧</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A' }}>TecnoFix</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748B', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Panel de {role}
          </span>
        </div>

        {/* Tarjeta de usuario */}
        <div style={{ padding: '16px 20px', backgroundColor: '#0F172A', color: '#FFFFFF' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>{user.email}</div>
          <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>Rol: {user.role}</div>
        </div>

        {/* Navegación */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('EQUIPMENT_CATALOG')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'EQUIPMENT_CATALOG' ? '#065F46' : 'transparent',
                color: activeTab === 'EQUIPMENT_CATALOG' ? '#FFFFFF' : '#64748B',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📁</span> Catálogo Tipos de Equipo
            </button>
          )}

          <button
            onClick={() => setActiveTab('ORDERS')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'ORDERS' ? '#065F46' : 'transparent',
              color: activeTab === 'ORDERS' ? '#FFFFFF' : '#64748B',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>📋</span> Órdenes de Reparación
          </button>
        </nav>

        {/* Botón cerrar sesión */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#64748B',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'EQUIPMENT_CATALOG' && user.role === 'ADMIN' && (
          <EquipmentTypeManagement
            equipmentTypes={equipmentTypes}
            isLoading={isLoadingEquipmentTypes}
            error={equipmentTypeError}
            onClearError={onClearEquipmentTypeError}
            onCreate={onCreateEquipmentType}
            onUpdate={onUpdateEquipmentType}
            onToggleStatus={onToggleEquipmentTypeStatus}
            onRefresh={onRefreshEquipmentTypes}
          />
        )}

        {activeTab === 'ORDERS' && (
          <div style={{ padding: '32px' }}>
            <h2 style={{ color: '#0F172A', marginBottom: '8px' }}>Órdenes de Reparación</h2>
            <p style={{ color: '#64748B' }}>Módulo de gestión de órdenes y seguimiento técnico.</p>
          </div>
        )}
      </main>
    </div>
  );
};
