import { } from '../services/debug-utils'
import { } from './commands'

import { writable, derived, readable } from "svelte/store";

import { ChatPoint, ChatRole } from "../models/chat-point";
import { AiInterface } from "../services/ai"
import { chatPoints, deriveThread } from '../models/thread-repo';

export const ai = new AiInterface(10);

export const activeChatPointId = writable('');

export const activeChatThread = derived(activeChatPointId, deriveThread);
export const activeChatPoint = derived(activeChatPointId, id => chatPoints.find(cp => cp.id === id));

export const readyForInput = writable(true);

// test stuff
const rootCP = new ChatPoint(undefined, [{ role: ChatRole.SYSTEM, content: 'You are a helpful assistant' } ]);

chatPoints.push(rootCP);

activeChatPointId.set(rootCP.id);

// setTimeout(() => {bus.set({ event: BusEvent.AddToChat, details: { content: `what what ${g_id++}` }}); bus.set({ event: BusEvent.AddToChat, details: { content: `what what ${g_id++}` }})}, 2000);

