import { useEffect, useRef, RefObject } from 'react';

/**
 * A hook to trap focus within a modal or dialog for better accessibility.
 * 
 * @param isActive Whether the focus trap is active
 * @param containerRef Ref to the container to trap focus inside
 * @param initialFocusRef Optional ref to element that should receive initial focus
 * @param finalFocusRef Optional ref to element that should receive focus when trap is deactivated
 * @param onEscape Optional callback to run when Escape key is pressed
 */
export function useFocusTrap(
  isActive: boolean,
  containerRef: RefObject<HTMLElement>,
  initialFocusRef?: RefObject<HTMLElement>,
  finalFocusRef?: RefObject<HTMLElement>,
  onEscape?: () => void
) {
  // Keep track of the element that had focus before the modal was opened
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // Save the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Set focus on the initial focus element if provided or the first focusable element
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    } else if (previousFocusRef.current && !isActive) {
      // Restore focus to the element that had focus before the modal was opened
      // or to the final focus element if provided
      if (finalFocusRef?.current) {
        finalFocusRef.current.focus();
      } else {
        previousFocusRef.current.focus();
      }
    }
    
    // Handle tab and escape key presses
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive || !containerRef.current) return;
      
      // Handle escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }
      
      // Only handle tab key
      if (event.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // If shift + tab on first element, move focus to the last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If tab on last element, move focus to the first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, containerRef, initialFocusRef, finalFocusRef, onEscape]);
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]'
  ].join(',');
  
  const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  return elements.filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
}
