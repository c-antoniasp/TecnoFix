import React, { useState } from 'react';

// ==============================================================================
// TecnoFix - Componente: EquipmentTypeManagement
// Requerimiento: ADM-001 (Gestionar catálogo de tipos de equipo)
// Estándar Codexia: TypeScript (.tsx), nombres en inglés/camelCase, comentarios en español,
// mensajes de usuario literales de la ERS y paleta oficial TecnoFix.
// ==============================================================================

export interface EquipmentType {
  id: string;
  name: string;
  description?: string | null;
  enabled: boolean;
}

export interface EquipmentTypeFormData {
  name: string;
  description: string;
}

export interface EquipmentTypeManagementProps {
  equipmentTypes: EquipmentType[];
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  onCreate: (data: { name: string; description?: string }) => Promise<boolean>;
  onUpdate: (id: string, data: { name: string; description?: string }) => Promise<boolean>;
  onToggleStatus: (id: string) => Promise<boolean>;
  onRefresh?: () => void;
}

type ConfirmActionType = 'CREATE' | 'UPDATE' | 'TOGGLE';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  actionType: ConfirmActionType;
  targetId?: string;
  formData?: EquipmentTypeFormData;
}

export const EquipmentTypeManagement: React.FC<EquipmentTypeManagementProps> = ({
  equipmentTypes,
  isLoading = false,
  error = null,
  onClearError,
  onCreate,
  onUpdate,
  onToggleStatus,
  onRefresh,
}) => {
  // Filtro de búsqueda y filtro por estado
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');

  // Estado para el modal de Crear / Editar
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentType | null>(null);
  const [formData, setFormData] = useState<EquipmentTypeFormData>({ name: '', description: '' });
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Estado para el modal de confirmación obligatorio "¿Está seguro?" (REQ NF01)
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '¿Está seguro?',
    message: '',
    actionType: 'CREATE',
  });

  // Estado para tooltips activos (REQ NF03)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Apertura del modal en modo creación
  const handleOpenCreateModal = () => {
    if (onClearError) onClearError();
    setFormValidationError(null);
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setIsFormModalOpen(true);
  };

  // Apertura del modal en modo edición
  const handleOpenEditModal = (item: EquipmentType) => {
    if (onClearError) onClearError();
    setFormValidationError(null);
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
    });
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setFormValidationError(null);
  };

  // Validación inicial del formulario antes de pedir confirmación
  const handleFormPreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onClearError) onClearError();
    setFormValidationError(null);

    // Validación ERS: El nombre es obligatorio
    if (!formData.name.trim()) {
      setFormValidationError('Debe completar el campo Nombre');
      return;
    }

    if (editingItem) {
      // Modo Edición: Solicitar confirmación "¿Está seguro?" (REQ NF01)
      setConfirmState({
        isOpen: true,
        title: '¿Está seguro?',
        message: `¿Está seguro de guardar los cambios para el tipo de equipo "${formData.name.trim()}"?`,
        actionType: 'UPDATE',
        targetId: editingItem.id,
        formData: { ...formData },
      });
    } else {
      // Modo Registro: Solicitar confirmación "¿Está seguro?" (REQ NF01)
      setConfirmState({
        isOpen: true,
        title: '¿Está seguro?',
        message: `¿Está seguro de registrar el nuevo tipo de equipo "${formData.name.trim()}"?`,
        actionType: 'CREATE',
        formData: { ...formData },
      });
    }
  };

  // Solicitar confirmación para deshabilitar o habilitar
  const handleTogglePreSubmit = (item: EquipmentType) => {
    if (onClearError) onClearError();
    const actionLabel = item.enabled ? 'deshabilitar' : 'habilitar';
    const detail = item.enabled
      ? 'No se ofrecerá para nuevas órdenes de reparación (ORD-001).'
      : 'Estará disponible inmediatamente para nuevas órdenes.';

    setConfirmState({
      isOpen: true,
      title: '¿Está seguro?',
      message: `¿Está seguro de ${actionLabel} el tipo de equipo "${item.name}"? ${detail}`,
      actionType: 'TOGGLE',
      targetId: item.id,
    });
  };

  // Ejecución final tras la confirmación afirmativa del usuario
  const handleConfirmAction = async () => {
    const { actionType, targetId, formData: data } = confirmState;
    setConfirmState((prev) => ({ ...prev, isOpen: false }));

    if (actionType === 'CREATE' && data) {
      const success = await onCreate({
        name: data.name.trim(),
        description: data.description.trim() || undefined,
      });
      if (success) {
        handleCloseFormModal();
      }
    } else if (actionType === 'UPDATE' && targetId && data) {
      const success = await onUpdate(targetId, {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
      });
      if (success) {
        handleCloseFormModal();
      }
    } else if (actionType === 'TOGGLE' && targetId) {
      await onToggleStatus(targetId);
    }
  };

  // Filtrado de la lista en memoria
  const filteredEquipmentTypes = equipmentTypes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ENABLED') return item.enabled;
    if (statusFilter === 'DISABLED') return !item.enabled;
    return true;
  });

  return (
    <div style={{ backgroundColor: '#F1F5F9', minHeight: '100%', padding: '24px', fontFamily: 'sans-serif' }}>
      {/* Encabezado del módulo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ color: '#0F172A', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              Gestión de Tipos de Equipo
            </h1>
            {/* Tooltip de ayuda general (REQ NF03) */}
            <div
              style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setActiveTooltip('general-help')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <button
                type="button"
                style={{
                  background: '#E2E8F0',
                  color: '#64748B',
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px',
                }}
              >
                ?
              </button>
              {activeTooltip === 'general-help' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '28px',
                    left: '0',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    width: '260px',
                    zIndex: 100,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  Catálogo administrativo de equipos (ADM-001). Los tipos habilitados estarán disponibles para crear
                  nuevas órdenes de reparación (ORD-001).
                </div>
              )}
            </div>
          </div>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0 0' }}>
            Administra las categorías de equipos admitidos en el servicio técnico TecnoFix.
          </p>
        </div>

        {/* Botón de Registro de Nuevo Tipo de Equipo */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleOpenCreateModal}
            onMouseEnter={() => setActiveTooltip('btn-create')}
            onMouseLeave={() => setActiveTooltip(null)}
            style={{
              backgroundColor: '#065F46',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s',
            }}
          >
            <span>+</span> Registrar Tipo de Equipo
          </button>
          {activeTooltip === 'btn-create' && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: '0',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                zIndex: 100,
              }}
            >
              Añadir una nueva categoría al catálogo
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Error Global en Color Obligatorio #F56558 (REQ NF01) */}
      {(error || formValidationError) && (
        <div
          style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #F56558',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#F56558', fontSize: '18px', fontWeight: 'bold' }}>⚠</span>
            <span style={{ color: '#F56558', fontSize: '14px', fontWeight: 600 }}>
              {error || formValidationError}
            </span>
          </div>
          <button
            onClick={() => {
              setFormValidationError(null);
              if (onClearError) onClearError();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#F56558',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ flex: '1', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Estado:</span>
          {(['ALL', 'ENABLED', 'DISABLED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                backgroundColor: statusFilter === filter ? '#065F46' : '#FFFFFF',
                color: statusFilter === filter ? '#FFFFFF' : '#64748B',
                fontWeight: statusFilter === filter ? 600 : 400,
              }}
            >
              {filter === 'ALL' && 'Todos'}
              {filter === 'ENABLED' && 'Habilitados'}
              {filter === 'DISABLED' && 'Deshabilitados'}
            </button>
          ))}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refrescar catálogo"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                color: '#64748B',
                fontSize: '13px',
              }}
            >
              🔄
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Resultados (REQ NF01 - Minimizar interfaces) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>
              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>N°</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Nombre</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Descripción</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, textAlign: 'right' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                  Cargando catálogo de tipos de equipo...
                </td>
              </tr>
            ) : filteredEquipmentTypes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                  No se encontraron tipos de equipo registrados con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredEquipmentTypes.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                  }}
                >
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#0F172A', fontWeight: 600 }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748B' }}>
                    {item.description || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin descripción</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: item.enabled ? '#D1FAE5' : '#E2E8F0',
                        color: item.enabled ? '#065F46' : '#64748B',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: item.enabled ? '#10B981' : '#94A3B8',
                        }}
                      />
                      {item.enabled ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {/* Botón Editar con Tooltip */}
                      <div
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setActiveTooltip(`edit-${item.id}`)}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '5px',
                            padding: '6px 10px',
                            fontSize: '13px',
                            color: '#0F172A',
                            cursor: 'pointer',
                          }}
                        >
                          ✏ Editar
                        </button>
                        {activeTooltip === `edit-${item.id}` && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '34px',
                              right: '0',
                              backgroundColor: '#0F172A',
                              color: '#FFFFFF',
                              padding: '5px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              whiteSpace: 'nowrap',
                              zIndex: 100,
                            }}
                          >
                            Modificar nombre y descripción
                          </div>
                        )}
                      </div>

                      {/* Botón Deshabilitar / Habilitar con Tooltip (No eliminación según ERS) */}
                      <div
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setActiveTooltip(`toggle-${item.id}`)}
                        onMouseLeave={() => setActiveTooltip(null)}
                      >
                        <button
                          onClick={() => handleTogglePreSubmit(item)}
                          style={{
                            backgroundColor: item.enabled ? '#FFF1F2' : '#F0FDF4',
                            border: `1px solid ${item.enabled ? '#FECDD3' : '#BBF7D0'}`,
                            borderRadius: '5px',
                            padding: '6px 10px',
                            fontSize: '13px',
                            color: item.enabled ? '#BE123C' : '#15803D',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          {item.enabled ? '🚫 Deshabilitar' : '✓ Habilitar'}
                        </button>
                        {activeTooltip === `toggle-${item.id}` && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '34px',
                              right: '0',
                              backgroundColor: '#0F172A',
                              color: '#FFFFFF',
                              padding: '5px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              whiteSpace: 'nowrap',
                              zIndex: 100,
                            }}
                          >
                            {item.enabled
                              ? 'Deshabilitar para nuevas órdenes'
                              : 'Reactivar en catálogo de órdenes'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Registro y Edición (REQ NF01) */}
      {isFormModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: '#0F172A', fontSize: '18px', margin: 0, fontWeight: 'bold' }}>
                {editingItem ? 'Editar Tipo de Equipo' : 'Registrar Nuevo Tipo de Equipo'}
              </h2>
              <button
                type="button"
                onClick={handleCloseFormModal}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94A3B8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Error específico del formulario en #F56558 */}
            {formValidationError && (
              <div
                style={{
                  color: '#F56558',
                  backgroundColor: '#FEE2E2',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  marginBottom: '14px',
                  fontWeight: 600,
                }}
              >
                {formValidationError}
              </div>
            )}

            <form onSubmit={handleFormPreSubmit}>
              {/* Campo Nombre (Obligatorio) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Nombre del tipo de equipo <span style={{ color: '#F56558' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Notebook, Impresora, Teléfono"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formValidationError) setFormValidationError(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${formValidationError ? '#F56558' : '#CBD5E1'}`,
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Debe ser único en el sistema.
                </span>
              </div>

              {/* Campo Descripción (Opcional) */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre características, marcas comunes o alcance..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#64748B',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#065F46',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editingItem ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Obligatorio: "¿Está seguro?" (REQ NF01) */}
      {confirmState.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#D1FAE5',
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              ?
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0F172A', fontWeight: 'bold' }}>
              {confirmState.title}
            </h3>

            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>
              {confirmState.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#64748B',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                style={{
                  backgroundColor: '#065F46',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
