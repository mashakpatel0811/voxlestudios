import { useEffect, useState } from "react";

// Works like useState, but the value is also saved in the browser,
// so it is still there after the page is reloaded.
// key = the name it is saved under, initial = the value to use the first time,
// store = where to keep it: localStorage (default, kept after the browser is closed)
// or sessionStorage (cleared when the browser or tab is closed).
export function useStoredState(key, initial, store = "localStorage") {
  const [value, setValue] = useState(() => {
    try {
      const saved = window[store].getItem(key);
      return saved === null ? initial : JSON.parse(saved);
    } catch {
      return initial; // saving can be blocked (for example in a private window)
    }
  });

  useEffect(() => {
    try {
      window[store].setItem(key, JSON.stringify(value));
    } catch {
      // ignore: the app still works, it just will not remember
    }
  }, [key, value, store]);

  return [value, setValue];
}
