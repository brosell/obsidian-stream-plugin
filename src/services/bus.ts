import { writable } from "svelte/store";

export enum BusEvent {
  ChatIntent = 'ChatIntent',
  UserPromptAvailable = 'UserPromptReady',
  AIResponseAvailable = 'AIResponseReady'
}

type MessageContext = {
  referenceType: string;
  referenceId: string;
};

export const Context: Record<string, MessageContext> = {
  Null: { referenceId: 'null', referenceType: 'Null'}
}

export interface Message {
  event: BusEvent,
  context: MessageContext,
  details: any
}

export const bus = writable<Message>();

export const sendMessage = (event: BusEvent, context: MessageContext, details: any = {}) => {
  bus.set({event, context, details});
}

bus.subscribe(message => console.log("Bus Event:", message) ); // just a logger
