import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  maxWidth?: number;
}

export const PortalPopover: React.FC<PortalPopoverProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  maxWidth = 260,
}) => {
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popWidth = Math.min(maxWidth, 260);

    // Show below the element
    const top = rect.bottom + 6;

    // Horizontally aligned with trigger, clamped inside viewport
    let left = rect.left;
    if (left + popWidth > window.innerWidth - 8) {
      left = window.innerWidth - popWidth - 8;
    }
    if (left < 8) left = 8;

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          popoverRef.current &&
          !popoverRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target)
        ) {
          onClose();
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, onClose, triggerRef, maxWidth]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${maxWidth}px`,
        maxWidth: `${maxWidth}px`,
        zIndex: 9999,
      }}
      className="p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-card)] shadow-xl animate-in fade-in zoom-in-95 duration-150 transition-colors"
    >
      {children}
    </div>,
    document.body
  );
};
