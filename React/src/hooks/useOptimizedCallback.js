import { useCallback, useRef } from 'react';

/**
 * Optimized callback hook that prevents unnecessary re-renders.
 * Uses ref to store the latest callback and memoizes the wrapper.
 */
export function useOptimizedCallback(callback, deps) {
  const callbackRef = useRef(callback);
  
  // Update ref when callback changes
  callbackRef.current = callback;
  
  // Return memoized wrapper that always calls the latest callback
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, deps);
}

/**
 * Debounced callback hook for performance optimization.
 * Delays execution until after wait time has passed.
 */
export function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}












