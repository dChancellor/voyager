import { writable, derived } from "svelte/store";

// Base writable store
export const baseWritableStore = writable("This is my default setting");

// Custom writable store with modules added onto the return of the function
function customStore() {
  let initialValue = "This is my default setting!";
  const { subscribe, set, update } = writable(initialValue);
  return {
    subscribe,
    add: (newInput) =>
      update((existingStoreValue) => [...existingStoreValue, newInput]),
    remove: (removedInput) => {
      update((existingStoreValue) => {
        let index = existingStoreValue.findIndex(
          (thing) => thing === removedInput
        );
        existingStoreValue.splice(index, 1);
        return existingStoreValue;
      });
    },
    reset: () => set(brandNewValue),
    yourCoolNewMethodHere: (input) => update((existing) => "This is the result of my super cool method")
  };
}

export const custom = customStore();

// Store derived from another store's values
export const derivedStore = derived([baseWritableStore], ([$baseWritableStore]) => {
    return $baseWritableStore += "plus some other stuff"
  });
