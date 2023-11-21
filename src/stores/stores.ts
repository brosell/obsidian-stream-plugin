import { } from '../services/debug-utils'
import { } from './commands'
import { writable, derived, readable } from "svelte/store";
import { ChatPoint, ChatRole } from "../models/chat-point";
import { chatPoints, createChatPoint, deriveThread } from '../models/thread-repo';
import { buildHierarchy } from '../services/nested-list-builder';

export const activeChatPointId = writable('');

export const activeChatThread = derived(activeChatPointId, deriveThread);
export const activeChatPoint = derived(activeChatPointId, id => chatPoints.find(cp => cp.id === id));

export const readyForInput = writable(true);

export const chat = writable<ChatPoint[]>(chatPoints);
export const tree = derived(chat, (chat) => 
  buildHierarchy(chat)
)

// test stuff
const rootCP = new ChatPoint('', [{ role: ChatRole.SYSTEM, content: 'You are a hateful assistant' } ]);

chatPoints.push(rootCP);
chat.set(chatPoints);

activeChatPointId.set(rootCP.id);
