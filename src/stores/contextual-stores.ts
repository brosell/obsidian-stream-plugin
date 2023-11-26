

import { getContext } from 'svelte';
import { writable, derived, get } from 'svelte/store';
import { ChatRole, chatPointToHtml, type ChatPoint } from '../models/chat-point';
import { prepareChatPointsForDisplay } from '../services/nested-list-builder';
import type { BusEvent, Message, MessageContext } from '../services/bus';
import { marked } from 'marked';
import { subscribeForContext } from '../commands/commands';
import { subscribeSlashCommandsForContext } from '../commands/slash-functions';


const storeInstances: Map<string, any> = new Map();
export const getContextualStores = (guid: string) => {
  if (!storeInstances.has(guid)) {
    storeInstances.set(guid, createDataStores());
    subscribeForContext(guid);
    subscribeSlashCommandsForContext(guid);
  }
  return storeInstances.get(guid);
}

const createDataStores = () => {

  let g_id = 0;

  const addNewChatPoint = (content: string, previousId: string = '', role: ChatRole = ChatRole.USER) => {
    const child: ChatPoint = { id: `${g_id++}`, previousId, completions: [{ role, content }] };
    chatPoints.update(arr => [...arr, child]);
    return child;
  }
  const getChatPoint = (id: string): ChatPoint | undefined => get(chatPoints).find(cp => cp.id === id);

  const forkChatPoint = (chatPointId: string) => {
    const source = getChatPoint(chatPointId);
    if (!source) {
      throw new Error('tried to fork nonexistent ChatPoint');
    }
    const newCP: ChatPoint = { ...source, id: `${g_id++}`, previousId: '', completions: [...source.completions] };
    chatPoints.update(arr => [...arr, newCP]);
    activeChatPointId.set(newCP.id);
  }

  const updateChatPoint = (chatPointId: string, updater: (chatPoint: ChatPoint) => ChatPoint): ChatPoint => {
    let updated: ChatPoint;
    chatPoints.update(arr => {
      const index = arr.findIndex(cp => cp.id === chatPointId);
      if (index === -1) {
        throw new Error('tried to update nonexistent ChatPoint');
      }
      const chatPoint = arr[index];

      updated = updater({ ...chatPoint });
      return [...arr.slice(0, index), updated, ...arr.slice(index + 1)]
    });
    return updated!
  }

  const deriveThread = (leafId: string): ChatPoint[] => {
    const answer = [] as ChatPoint[];
    if (!leafId) {
      return answer;
    }

    const arr = get(chatPoints);
    let node = arr.find(cp => cp.id === leafId);
    if (!node) {
      throw new Error(`tried to create a thread for nonexisting leaf ${leafId}`)
    }

    answer.unshift(node);
    while (node.previousId) {
      node = arr.find(cp => cp.id === node?.previousId);
      if (!node) {
        throw new Error(`tried to create thread but the linkage is broken ${leafId}`);
      }
      answer.unshift(node);
    }
    return answer;
  }

  const deleteChatPointAndDescendants = (idToDelete: string): void => {
    chatPoints.update(chatPoints => {
      const chatPointIdsToDelete = new Set<string>();
      chatPointIdsToDelete.add(idToDelete);

      let currentSize: number;
      do {
        currentSize = chatPointIdsToDelete.size;
        chatPoints.forEach((chatPoint) => {
          if (chatPoint.previousId && chatPointIdsToDelete.has(chatPoint.previousId)) {
            chatPointIdsToDelete.add(chatPoint.id);
          }
        });
      } while (chatPointIdsToDelete.size > currentSize);

      return chatPoints.filter(chatPoint => !chatPointIdsToDelete.has(chatPoint.id));
    })
  }

  const chatPoints = writable([] as ChatPoint[]);
  const activeChatPointId = writable('');
  const activeChatThread = derived(activeChatPointId, deriveThread);
  const activeChatPoint = derived(activeChatPointId, id => get(chatPoints).find(cp => cp.id === id));

  // UI
  const readyForInput = writable(true);
  const treeDisplay = derived(chatPoints, (chatPoints) =>
    prepareChatPointsForDisplay(chatPoints, (cp) => chatPointToHtml(cp))
  )
  const userPromptInput = writable('');

  const markdown = derived(activeChatThread, t => {
    const rfi = get(readyForInput);
  
    const md = t.map(item => {
      const completionsMarkdown = item.completions.map(completion => `**${completion.role}**: ${completion.content}`).join('\n\n');
      return `### ${item.id}\n${completionsMarkdown}`;
    }).join('\n\n');
    return `${md}\n\n---\n ${!rfi ? '==waiting for response...==' : ''}`;
  });

  const renderedHtml = derived(markdown, markdown => marked(markdown));

  // Bus
  const bus = writable<any>(null);
  const sendMessage = (event: BusEvent, context: MessageContext, details: any = {}) => {
    bus.set({event, context, details});
  }

  const subscribeToBus = (guid: string, handlers: Record<string, (m: Message) => void>) => {
    bus.subscribe( (message: Message) => {
      console.log("Bus Event context:", message?.context?.guid || 'huh?');
      if (message && message.context.guid === guid && handlers[message.event]) {
        handlers[message.event](message);
      }
    });
  }

  return {
    addNewChatPoint,
    getChatPoint,
    forkChatPoint,
    updateChatPoint,
    deriveThread,
    deleteChatPointAndDescendants,
    sendMessage,
    subscribeToBus,
    bus,
    chatPoints,
    activeChatPointId,
    activeChatThread,
    activeChatPoint,
    readyForInput,
    treeDisplay,
    userPromptInput,
    markdown,
    renderedHtml,
  }
}