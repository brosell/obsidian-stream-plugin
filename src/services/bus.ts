import { writable } from "svelte/store";

enum Event {
  AddToChat = 'ChatIntent',
}

interface Message {
  event: Event,
  content: Record<string, any>
}

export const bus = writable<Message>();
bus.subscribe( message => console.log(message) ); // just a logger
