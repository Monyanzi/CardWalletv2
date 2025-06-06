import { useState, useCallback, useEffect } from 'react';
import { FeedbackMessage } from '../types';

export type FeedbackType = 'success' | 'error' | 'warning' | 'loading' | 'info';

export const useFeedback = () => {
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  
  useEffect(() => {
    let timer: number | undefined;
    
    // Only auto-dismiss non-sticky feedback
    if (feedbackMessage && !isSticky) {
      // Loading messages stay a bit longer
      const duration = feedbackMessage.type === 'loading' ? 10000 : 3000;
      timer = setTimeout(() => setFeedbackMessage(null), duration);
    }
    
    return () => { 
      if (timer) clearTimeout(timer);
    };
  }, [feedbackMessage, isSticky]);
  
  // Standard feedback that auto-dismisses
  const showFeedback = useCallback(
    (text: string, type: FeedbackType = 'success') => {
      setIsSticky(false);
      setFeedbackMessage({ text, type });
    }, []);
  
  // Sticky feedback that stays until explicitly cleared
  const showStickyFeedback = useCallback(
    (text: string, type: FeedbackType = 'success') => {
      setIsSticky(true);
      setFeedbackMessage({ text, type });
    }, []);
  
  // Clear any feedback message
  const clearFeedback = useCallback(() => {
    setFeedbackMessage(null);
    setIsSticky(false);
  }, []);
  
  return { 
    feedbackMessage, 
    showFeedback, 
    showStickyFeedback,
    clearFeedback 
  };
};
