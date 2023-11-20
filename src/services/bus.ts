import { writable, type Readable, type Invalidator, type Subscriber, type Unsubscriber, type Writable } from "svelte/store";

export enum BusEvent {
  ChatIntent = 'ChatIntent',
}

export interface Message {
  event: BusEvent,
  details: Record<string, any>
}

export const bus = writable<Message>();

bus.subscribe(message => console.log("Bus Event:", message) ); // just a logger
