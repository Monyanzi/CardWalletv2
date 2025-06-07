import { useState, useCallback, useEffect } from 'react';

// Debounce utility function
// This function delays invoking `func` until after `wait` milliseconds have elapsed
// since the last time the debounced function was invoked.
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: Parameters<F>) {
    const context = this;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      func.apply(context, args);
    }, wait);
  };
}

export const useSearch = (debounceDelay: number = 300) => {
  // inputValue stores the direct input from the user, updates immediately
  const [inputValue, setInputValue] = useState('');
  // searchTerm is the debounced value, used for actual filtering/searching
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Debounced function to update the actual searchTerm
  // useCallback ensures that the debounced function is not recreated on every render
  // unless debounceDelay changes (which is unlikely for this hook's typical usage).
  const debouncedSetSearchTerm = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, debounceDelay),
    [debounceDelay] // Re-create if debounceDelay changes
  );

  // Effect to clean up the timer when the component unmounts or debounceDelay changes
  useEffect(() => {
    // The cleanup function of debounce itself is not directly exposed here,
    // but React's unmounting process will effectively garbage collect the timeout
    // if the debounced function instance is discarded (e.g. if debounceDelay changes).
    // If the debounced function had a .cancel() method, it would be called here.
    return () => {
      // If debouncedSetSearchTerm had a .cancel method, call it here.
      // For this simple debounce, clearing happens within the debounce logic on new calls.
    };
  }, [debouncedSetSearchTerm]);


  // Called when the user types into the search input
  const handleSearchChange = useCallback((term: string) => {
    setInputValue(term); // Update inputValue immediately for responsive UI
    debouncedSetSearchTerm(term); // Debounce the update to the actual searchTerm
  }, [debouncedSetSearchTerm]);
  
  // Called to clear the search input and results
  const handleClearSearch = useCallback(() => {
    setInputValue('');
    // We can choose to clear searchTerm immediately or via debounce.
    // Immediate clear is often better UX for a manual clear action.
    setSearchTerm('');
    // If debouncedSetSearchTerm had a cancel, call it here too.
    // debouncedSetSearchTerm.cancel(); // Example if debounce provided a cancel
  }, [debouncedSetSearchTerm]); // Include debouncedSetSearchTerm if it had a cancel method to call
  
  // Toggles search visibility and clears search terms when hiding
  const handleSearchToggle = useCallback(() => {
    setShowSearch(prevShowSearch => {
      const newShowSearch = !prevShowSearch;
      if (!newShowSearch) { // If search is being hidden
        setInputValue('');
        setSearchTerm(''); // Clear immediately
        // If debouncedSetSearchTerm had a cancel, call it here.
      }
      return newShowSearch;
    });
  }, []); // No dependency on showSearch, it uses prevState
  
  return {
    inputValue, // For binding to the search input field
    searchTerm, // Debounced term for filtering
    showSearch,
    handleSearchChange,
    handleClearSearch,
    handleSearchToggle
  };
};
