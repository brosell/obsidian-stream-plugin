import { Notice } from "obsidian";
import { writable } from "svelte/store";

export enum BusEvent {
  Noop = 'Noop',
  ChatIntent = 'ChatIntent',
  UserPromptAvailable = 'UserPromptReady',
  AIResponseAvailable = 'AIResponseReady',
  SlashFunction = 'SlashFunction',
}

export type MessageContext = {
  guid: string;
  referenceType: string;
  referenceId: string;
};

export const Context: Record<string, MessageContext> = {
  Null: { guid: 'null', referenceId: 'null', referenceType: 'Null'}
}

export interface Message {
  event: BusEvent,
  context: MessageContext,
  details: any
}

export const NoopMessage: Message = {
  event: BusEvent.Noop,
  context: Context.Null,
  details: {}
}

export const errorBus = writable<string>('');
errorBus.subscribe(error => {
  console.error(error);
  new Notice(`Error occurred: ${error}`, 1000);
});

// export const bus = writable<Message>();

// export const sendMessage = (event: BusEvent, context: MessageContext, details: any = {}) => {
//   bus.set({event, context, details});
// }

// bus.subscribe(message => console.log("Bus Event:", message) ); // just a logger
