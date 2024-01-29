import { writable } from "svelte/store";

export const incrementingStore = writable(0, () => {
  let value = 0;

  const interval = setInterval(() => {
    value += 1;
    if (value > Number.MAX_SAFE_INTEGER - 1000) {
      value = 0;
    }
    incrementingStore.set(value);
  }, 200);

  // Return a stop function to clear the interval when the store is no longer subscribed to
  return () => clearInterval(interval);
});