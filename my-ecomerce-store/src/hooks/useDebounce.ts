// import { useEffect, useRef, useCallback, useState } from "react";

// /**
//  * useDebouncedCallback
//  * ← Callback function ko delay ke baad call karta hai
//  * ← Har naye call pe purana timer cancel hota hai
//  */
// export function useDebouncedCallback<T extends (...args: any[]) => void>(
//   callback: T,
//   delay: number
// ): T {
//   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const callbackRef = useRef(callback);

//   // ← Latest callback ref mein rakho — stale closure se bachao
//   useEffect(() => {
//     callbackRef.current = callback;
//   }, [callback]);

//   const debouncedFn = useCallback(
//     (...args: Parameters<T>) => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//       timerRef.current = setTimeout(() => {
//         callbackRef.current(...args);
//       }, delay);
//     },
//     [delay]
//   ) as T;

//   // ← Component unmount pe timer clear karo
//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//     };
//   }, []);

//   return debouncedFn;
// }

// /**
//  * useDebounce
//  * ← Value ko debounce karta hai — delay ke baad update hota hai
//  */
// export function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }
