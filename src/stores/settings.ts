import { writable, type Writable } from "svelte/store";
import type { StreamSettings } from "../main";

export const settingsStore: Writable<StreamSettings> = writable();

settingsStore.subscribe((value) => {
  console.log("settings changed", value);
});