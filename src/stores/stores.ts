import { } from '../services/debug-utils'
import { } from './commands'
import { writable, derived, readable, get } from "svelte/store";
import { type ChatPoint, ChatRole } from "../models/chat-point";
import { chatPoints, addNewChatPoint, deriveThread } from '../models/thread-repo';
import { buildHierarchy } from '../services/nested-list-builder';

export const activeChatPointId = writable('');

export const activeChatThread = derived(activeChatPointId, deriveThread);
export const activeChatPoint = derived(activeChatPointId, id => get(chatPoints).find(cp => cp.id === id));

export const readyForInput = writable(true);

export const chat = chatPoints; // todo redundant and confusing
export const tree = derived(chatPoints, (chat) => 
  buildHierarchy(chat)
)

// test stuff
const rootCP: ChatPoint = {previousId: '', id: 'root', completions: [{ role: ChatRole.SYSTEM, content: 'Your name is Gollum and you are a helpful assistant for telling riddles' } ]};
chatPoints.update(_ => [rootCP])

activeChatPointId.set(rootCP.id);
