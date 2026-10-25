import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<any>;
  disabled?: boolean;
  maxWidth?: number;
}

export const PortalTooltip: React.FC<PortalTooltipProps> = ({
  content,
  children,
  disabled = false,
  maxWidth = 260,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current?.offsetWidth || Math.min(maxWidth, 220);
    const tooltipHeight = tooltipRef.current?.offsetHeight || 36;

    // Show below the element
    let top = rect.bottom + 6;
    // If overflowing viewport bottom, flip above
    if (top + tooltipHeight > window.innerHeight - 8 && rect.top > tooltipHeight + 8) {
      top = rect.top - tooltipHeight - 6;
    }

    // Horizontally centered below element, clamped inside viewport
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left < 8) left = 8;
    if (left + tooltipWidth > window.innerWidth - 8) {
      left = window.innerWidth - tooltipWidth - 8;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (disabled || !content) return;
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const clonedChild = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      const originalRef = (children as any).ref;
      if (typeof originalRef === 'function') originalRef(node);
      else if (originalRef) (originalRef as React.MutableRefObject<any>).current = node;
    },
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      handleMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      handleMouseLeave();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      handleMouseEnter();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      handleMouseLeave();
    },
  });

  return (
    <>
      {clonedChild}
      {isVisible &&
        !disabled &&
        content &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              maxWidth: `${maxWidth}px`,
              zIndex: 9999,
            }}
            className="pointer-events-none px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] shadow-lg text-[11px] leading-tight font-medium font-sans animate-in fade-in zoom-in-95 duration-150 transition-colors"
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};
