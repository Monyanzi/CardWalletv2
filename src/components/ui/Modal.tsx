import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { X } from '../../utils/icons';
import { useTheme } from '../../context/ThemeContext';
import IconButton from './IconButton';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  returnFocusRef?: React.RefObject<HTMLElement>;
  onAnimationComplete?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className = '',
  showCloseButton = true,
  initialFocusRef,
  returnFocusRef,
  onAnimationComplete,
}) => {
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // References for accessibility
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
  const descriptionId = useRef(`modal-desc-${Math.random().toString(36).substr(2, 9)}`);
  
  // Reference to store the element that had focus before modal was opened
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>; // Retained for direct control if needed by useFocusTrap
  returnFocusRef?: React.RefObject<HTMLElement>; // Retained for direct control if needed by useFocusTrap
  onAnimationComplete?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className = '',
  showCloseButton = true,
  initialFocusRef, // Passed to useFocusTrap
  returnFocusRef,  // Passed to useFocusTrap
  onAnimationComplete,
}) => {
  const { darkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  // References for accessibility
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal container itself
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);
  const descriptionId = useRef(`modal-desc-${Math.random().toString(36).substr(2, 9)}`);

  // Integrate useFocusTrap for managing focus, Escape key, and returning focus.
  // This centralizes accessibility logic related to focus control.
  useFocusTrap(isOpen, modalRef, initialFocusRef, returnFocusRef, onClose);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Manage body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Call animation complete callback after opening animation
    if (isOpen && onAnimationComplete) {
      const timer = setTimeout(onAnimationComplete, 300); // Animation duration
      return () => clearTimeout(timer);
    }
    // Ensure body overflow is reset if component unmounts while open
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onAnimationComplete]);
  
  // Screen reader announcements (remains useful)
  useEffect(() => {
    if (isOpen) {
      // Announce to screen readers that a modal has opened
      const announcement = title 
        ? `Modal opened: ${title}` 
        : 'Modal opened';
      
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'polite');
      ariaLive.setAttribute('class', 'sr-only');
      ariaLive.textContent = announcement;
      
      document.body.appendChild(ariaLive);
      
      setTimeout(() => {
        document.body.removeChild(ariaLive);
      }, 1000);
    }
  }, [isOpen, title]);
  
  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  if (!mounted) return null;
  
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" 
      onClick={handleBackdropClick}
      aria-modal="true" // Informs assistive technologies that content outside the dialog is inert.
      role="dialog" // Specifies the role of the element as a dialog.
      aria-labelledby={title ? titleId.current : undefined} // Provides an accessible name by referring to the title.
      aria-describedby={description ? descriptionId.current : undefined} // Provides more detailed info if a description is present.
    >
      <div 
        ref={modalRef} // This ref is used by useFocusTrap to define the trap container.
        className={`relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-lg shadow-xl ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} ${className} animate-fade-in`}
      >
        {/* Modal Header: Contains title and close button */}
        {(title || showCloseButton) && (
          <div className={`p-4 flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            {title && <h3 id={titleId.current} className="text-lg font-semibold">{title}</h3>} {/* Element that aria-labelledby points to */}
            {showCloseButton && (
              <IconButton
                icon={X}
                onClick={onClose} // onClose is also called by useFocusTrap on Escape key
                variant="secondary"
                size="sm"
                label="Close" // Accessible label for the button itself
                aria-label="Close modal" // More specific aria-label
              />
            )}
          </div>
        )}
        
        {/* Screen reader description if provided (hidden visually, read by screen readers) */}
        {description && (
          <div id={descriptionId.current} className="sr-only"> {/* Element that aria-describedby points to */}
            {description}
          </div>
        )}
        
        {/* Modal Content: Main content area of the modal */}
        <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
          {children}
        </div>
        
        {/* Modal Footer: Contains action buttons or other footer content */}
        {footer && (
          <div className={`p-4 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} border-t sticky bottom-0`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
  
  // Use portal to render modal at the body level to avoid stacking context issues
  return createPortal(modalContent, document.body);
};

export default Modal;
