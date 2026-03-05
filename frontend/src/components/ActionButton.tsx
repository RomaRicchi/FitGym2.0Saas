import React, { useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

/**
 * Tipos de acciones disponibles para los botones
 */
export type ActionType =
  | 'view'        // Ver detalles
  | 'edit'        // Editar
  | 'delete'      // Eliminar
  | 'create'      // Crear nuevo
  | 'subscribe'   // Suscribir
  | 'assign'      // Asignar
  | 'add'         // Agregar
  | 'remove'      // Quitar/Eliminar
  | 'activate'    // Activar
  | 'deactivate'  // Desactivar
  | 'approve'     // Aprobar
  | 'reject'      // Rechazar
  | 'download'    // Descargar
  | 'upload'      // Subir
  | 'checkin'     // Check-in
  | 'custom';     // Personalizado

/**
 * Configuración de tooltips para cada tipo de acción
 */
const actionTooltips: Record<ActionType, string> = {
  view: 'Ver detalles',
  edit: 'Editar',
  delete: 'Eliminar',
  create: 'Crear nuevo',
  subscribe: 'Suscribir',
  assign: 'Asignar',
  add: 'Agregar',
  remove: 'Quitar',
  activate: 'Activar',
  deactivate: 'Desactivar',
  approve: 'Aprobar',
  reject: 'Rechazar',
  download: 'Descargar',
  upload: 'Subir',
  checkin: 'Registrar Check-in',
  custom: '' // Se debe proporcionar tooltip personalizado
};

/**
 * Íconos por tipo de acción (opcional, para uso futuro)
 */
const actionIcons: Record<ActionType, string> = {
  view: '👁️',
  edit: '✏️',
  delete: '🗑️',
  create: '➕',
  subscribe: '💳',
  assign: '📋',
  add: '➕',
  remove: '➖',
  activate: '✅',
  deactivate: '⏸️',
  approve: '✔️',
  reject: '❌',
  download: '⬇️',
  upload: '⬆️',
  checkin: '📷',
  custom: ''
};

/**
 * Props del componente ActionButton
 */
interface ActionButtonProps {
  /** Tipo de acción predefinida */
  action: ActionType;
  /** Tooltip personalizado (sobrescribe el tooltip por defecto del action type) */
  tooltip?: string;
  /** Contenido del botón (ícono o texto) */
  children: React.ReactNode;
  /** Variante de Bootstrap (primary, secondary, success, danger, warning, info, light, dark) */
  variant?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Tamaño del botón */
  size?: 'sm' | 'lg';
  /** Click handler */
  onClick?: () => void;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
  /** Tipo de botón HTML */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Componente de botón con tooltip reutilizable
 *
 * @example
 * // Uso básico con acción predefinida
 * <ActionButton action="edit" onClick={handleEdit}>
 *   ✏️
 * </ActionButton>
 *
 * @example
 * // Con tooltip personalizado
 * <ActionButton action="delete" tooltip="Eliminar socio permanentemente">
 *   🗑️
 * </ActionButton>
 *
 * @example
 * // Con acción personalizada
 * <ActionButton action="custom" tooltip="Asignar plan">
 *   💳
 * </ActionButton>
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  tooltip: customTooltip,
  children,
  variant = 'primary',
  className = '',
  size = 'sm',
  onClick,
  disabled = false,
  type = 'button'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Obtener tooltip predeterminado según el tipo de acción
  const defaultTooltip = actionTooltips[action] || '';
  const tooltipText = customTooltip || defaultTooltip;

  // Si no hay tooltip, renderizar botón normal
  if (!tooltipText) {
    return (
      <Button
        variant={variant}
        className={className}
        size={size}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {children}
      </Button>
    );
  }

  // Renderizar botón con tooltip
  // Si está deshabilitado, usar un span wrapper para mostrar el tooltip
  if (disabled) {
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{tooltipText}</Tooltip>}
        delay={{ show: 250, hide: 150 }}
      >
        <span style={{ display: 'inline-block' }}>
          <Button
            variant={variant}
            className={className}
            size={size}
            onClick={onClick}
            disabled={disabled}
            type={type}
          >
            {children}
          </Button>
        </span>
      </OverlayTrigger>
    );
  }

  // Botón habilitado con tooltip interactivo
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{tooltipText}</Tooltip>}
      show={showTooltip}
      delay={{ show: 250, hide: 150 }}
    >
      <Button
        variant={variant}
        className={className}
        size={size}
        onClick={onClick}
        disabled={disabled}
        type={type}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </Button>
    </OverlayTrigger>
  );
};

/**
 * Componente simplificado para grupos de botones de acción
 *
 * @example
 * <ActionGroup>
 *   <ActionButton action="edit" onClick={handleEdit}>✏️</ActionButton>
 *   <ActionButton action="delete" onClick={handleDelete}>🗑️</ActionButton>
 * </ActionGroup>
 */
export const ActionGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`d-flex gap-2 ${className}`}>
      {children}
    </div>
  );
};

export default ActionButton;
