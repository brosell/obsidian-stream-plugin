import { writable, derived, get, type Writable, type Readable } from 'svelte/store';
import { ChatRole, chatPointToHtml, type ChatPoint } from '../models/chat-point';
import { prepareChatPointsForDisplay, type ChatPointDisplay } from '../services/nested-list-builder';
import { NoopMessage as NoopMessage, type BusEvent, type Message, type MessageContext, errorBus } from '../services/bus';
import { marked } from 'marked';
import { subscribeForContext } from '../commands/commands';
import { subscribeSlashCommandsForContext } from '../commands/slash-functions';


export interface ContextualStores {
  bus: Writable<Message>,
  chatPoints: Writable<ChatPoint[]>,
  activeChatPointId: Writable<string | null>,
  activeChatThread: Readable<ChatPoint[]>,
  activeChatPoint: Readable<ChatPoint | undefined>,
  readyForInput: Writable<boolean>,
  treeDisplay: Readable<ChatPointDisplay[]>,
  chatDisplay: Readable<ChatPointDisplay[]>,
  userPromptInput: Writable<string>,
  markdown: Writable<string>,
  renderedHtml: Readable<string>,
  saveData: Readable<string>,
  loadChatPoints: (loadData: string) => void,
  addNewChatPoint: (content: string, previousId?: string, role?: ChatRole) => ChatPoint,
  getChatPoint: (id: string) => ChatPoint | undefined,
  forkChatPoint: (chatPointId: string) => void,
  updateChatPoint: (chatPointId: string, updater: (chatPoint: ChatPoint) => ChatPoint) => ChatPoint,
  deriveThread: (leafId: string) => ChatPoint[],
  deleteChatPointAndDescendants: (idToDelete: string) => void,
  sendMessage: (event: BusEvent, context?: MessageContext, details?: any) => void,
  subscribeToBus: (event: string, handler: Record<string, (m: Message) => void>) => void,
}


const storeInstances: Map<string, any> = new Map();
export const getContextualStores = (guid: string): ContextualStores => {
  if (!storeInstances.has(guid)) {
    storeInstances.set(guid, createDataStores(guid));
    subscribeForContext(guid);
    subscribeSlashCommandsForContext(guid);
  }
  return storeInstances.get(guid);
}



const createDataStores = (guid: string) => {
  const rootCP: ChatPoint = {previousId: '', id: '0', completions: [{ role: ChatRole.SYSTEM, content: 'You are a Helpful assistant for coding and other tasks' } ]};

  let g_id = 0;

  const loadChatPoints = (loadData: string): void => {
    let sd = { chatPoints: [rootCP], activeChatPointId: "0"};
    activeChatPointId.set('');
    const index = loadData.indexOf('{');
    if (index !== -1) {
      sd = JSON.parse(loadData.substring(index));
    }
     
    chatPoints.set(sd.chatPoints);
    if (sd.activeChatPointId !== '') {
      activeChatPointId.set(sd.activeChatPointId);
    }
    g_id = Math.max(...sd.chatPoints.map((cp: { id: string; }) => parseInt(cp.id))) + 1;
  }

  const addNewChatPoint = (content: string, previousId: string = '', role: ChatRole = ChatRole.USER) => {
    const child: ChatPoint = { id: `${g_id++}`, previousId, completions: [{ role, content }] };
    chatPoints.update(arr => [...arr, child]);
    return child;
  }
  
  const getChatPoint = (id: string): ChatPoint | undefined => get(chatPoints).find(cp => cp.id === id);

  const forkChatPoint = (chatPointId: string) => {
    const source = getChatPoint(chatPointId) || get(activeChatPoint);
    if (!source) {
      errorBus.set(`tried to fork nonexistent ChatPoint with id: ${chatPointId}`);
      return;
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
        errorBus.set('tried to update nonexistent ChatPoint');
        return [...arr];
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
      errorBus.set(`tried to create a thread for nonexisting leaf ${leafId}`);
      return answer;
    }

    answer.unshift(node);
    while (node.previousId) {
      node = arr.find(cp => cp.id === node?.previousId);
      if (!node) {
        errorBus.set(`tried to create thread but the linkage is broken ${leafId}`);
        return answer;
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

  const chatPoints: Writable<ChatPoint[]> = writable([] as ChatPoint[]);
  const activeChatPointId: Writable<string> = writable('');
  const activeChatThread: Readable<ChatPoint[]> = derived([activeChatPointId, chatPoints], ([$id, _$chatPoints]) => deriveThread($id));
  const activeChatPoint: Readable<ChatPoint | undefined> = derived(activeChatPointId, id => get(chatPoints).find(cp => cp.id === id));

  // UI
  const readyForInput: Writable<boolean> = writable(true);
  const treeDisplay: Readable<ChatPointDisplay[]> = derived(chatPoints, (chatPoints: ChatPoint[]) =>
    prepareChatPointsForDisplay(chatPoints, (cp: ChatPoint) => chatPointToHtml(cp))
  )
  
  const chatDisplay: Readable<ChatPointDisplay[]> 
      = derived(activeChatThread, (chatPoints: ChatPoint[]) =>
    prepareChatPointsForDisplay(chatPoints, (cp: ChatPoint) => chatPointToHtml(cp))
  )
  
  const userPromptInput: Writable<string> = writable('');

  const markdown: Readable<string> = derived(activeChatThread, (t: ChatPoint[]) => {
    const rfi: boolean = get(readyForInput);
  
    const md: string = t.map(item => {
      const completionsMarkdown: string = item.completions.map(completion => `**${completion.role}**:\n\n${completion.content}`).join('\n\n');
      return `### ${item.id}\n${completionsMarkdown}`;
    }).join('\n\n');
    return `${md}\n\n---\n ${!rfi ? '==waiting for response...==' : ''}`;
  });

  const renderedHtml: Readable<string> = derived(markdown, (markdown: string) => marked(markdown));

  // save to file
  const saveData: Readable<string> = derived(chatPoints, (chatPoints: ChatPoint[]) => {
    const yaml = `---
stream: basic
---\n\n` + "```\n";

    const sd = {chatPoints, activeChatPointId: get(activeChatPointId)};
    const json = JSON.stringify(sd, null, 2);
    return yaml + json;
  });

  // Bus
  const bus = writable<Message>(NoopMessage);
  bus.subscribe((message: Message) => {
    console.log('bus message', message);
  });
  
  const sendMessage = (event: BusEvent, context: MessageContext, details: any = {}) => {
    bus.set({event, context, details});
  }

  const subscribeToBus = (guid: string, handlers: Record<string, (m: Message) => void>) => {
    bus.subscribe( (message: Message) => {
      if (message && message.context.guid === guid && handlers[message.event]) {
        handlers[message.event](message);
      }
    });
  }

  return {
    loadChatPoints,
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
    chatDisplay,
    userPromptInput,
    markdown,
    renderedHtml,
    saveData,
  }
}