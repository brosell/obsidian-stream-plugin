import { writable } from "svelte/store";

export enum BusEvent {
  AddToChat = 'ChatIntent',
}

export interface Message {
  event: BusEvent,
  details: Record<string, any>
}

export const bus = writable<Message>();
bus.subscribe( message => console.log(message) ); // just a logger
