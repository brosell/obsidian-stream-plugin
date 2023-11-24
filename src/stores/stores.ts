import { } from '../services/debug-utils'
import { } from '../commands/commands'
import { writable, derived, readable, get } from "svelte/store";
import { type ChatPoint, ChatRole, chatPointToHtml } from "../models/chat-point";
import { chatPoints, addNewChatPoint, deriveThread } from '../models/thread-repo';
import { buildHierarchy, prepareChatPointsForDisplay } from '../services/nested-list-builder';
import { AiInterface } from '../services/ai';
// import { chatPointToHtml } from './render-markdown';

export const AI = new AiInterface(100);

export const activeChatPointId = writable('');

export const activeChatThread = derived(activeChatPointId, deriveThread);
export const activeChatPoint = derived(activeChatPointId, id => get(chatPoints).find(cp => cp.id === id));

export const readyForInput = writable(true);

export const chat = chatPoints; // todo redundant and confusing

export const treeDisplay = derived(chatPoints, (chatPoints) =>
  prepareChatPointsForDisplay(chatPoints, (cp) => chatPointToHtml(cp) )
)

export const userPromptInput = writable('');

// test stuff
const rootCP: ChatPoint = {previousId: '', id: 'root', completions: [{ role: ChatRole.SYSTEM, content: 'You are a Helpful assistant for coding and other tasks' } ]};
chatPoints.update(_ => [rootCP])

activeChatPointId.set(rootCP.id);
