import { writable, derived, get, type Writable, type Readable } from 'svelte/store';
import { ChatRole, chatPointToHtml, type ChatPoint } from '../models/chat-point';
import { prepareChatPointsForDisplay, type ChatPointDisplay } from '../services/nested-list-builder';
import { NoopMessage as NoopMessage, type BusEvent, type Message, type MessageContext, errorBus } from '../services/bus';
import { marked } from 'marked';
import { subscribeForContext } from '../commands/commands';
import { subscribeSlashCommandsForContext } from '../commands/slash-functions';
import { BehaviorSubject, combineLatest, filter, map, Observable, of, startWith, Subject, tap, withLatestFrom } from 'rxjs';

export class SvelteBehaviorSubject<T> extends BehaviorSubject<T> {
  set(v: T) {
    this.next(v);
  }
}

export class SvelteSubject<T> extends Subject<T> {
  set(v: T)  {
    this.next(v);
  }
}


export interface ContextualStores {
  bus: SvelteSubject<Message>,
  chatPoints: Observable<ChatPoint[]>,
  activeChatPointId: SvelteBehaviorSubject<string | null>,
  activeChatThread: Observable<ChatPoint[]>,
  activeChatPoint: Observable<ChatPoint | undefined>,
  selectedChatPoints: Observable<ChatPoint[]>,
  readyForInput: Writable<boolean>,
  streamedCount: Writable<number>,
  treeDisplay: Readable<ChatPointDisplay[]>,
  chatDisplay: Observable<ChatPointDisplay[]>,
  userPromptInput: Writable<string>,
  findInput: Writable<string>,
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
      frontMatter = loadData.substring(0, index);
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
    chatPoints.next([...chatPoints.getValue(), child]);
    return child;
  }
  
  const getChatPoint = (id: string): ChatPoint | undefined => {
    return chatPoints.getValue().find(cp => cp.id == id);
  }

  // const forkChatPoint = (chatPointId: string) => {
  //   const source = getChatPoint(chatPointId) || get(activeChatPoint);
  //   if (!source) {
  //     errorBus.set(`tried to fork nonexistent ChatPoint with id: ${chatPointId}`);
  //     return;
  //   }
  //   const newCP: ChatPoint = { ...source, id: `${g_id++}`, previousId: '', completions: [...source.completions] };
  //   chatPoints.next([...chatPoints.getValue(), newCP]);
  //   activeChatPointId.set(newCP.id);
  // }

  const updateChatPoint = (chatPointId: string, updater: (chatPoint: ChatPoint) => ChatPoint): ChatPoint | undefined => {
    const arr = chatPoints.getValue().map(cp => cp.id == chatPointId ? updater({ ...cp }) : cp );
    chatPoints.next(arr);
    return arr.find(cp => cp.id == chatPointId);
  }

  const deriveThread = (leafNode: string, arr?: ChatPoint[]): ChatPoint[] => {
    const answer = [] as ChatPoint[];

    if (!arr) {
      arr = chatPoints.getValue();
    }

    let node = arr.find(cp => cp.id === leafNode)!;
    answer.unshift(node);

    while (node?.previousId) {
      node = arr.find(cp => cp.id === node.previousId)!;
      if (node) {
        answer.unshift(node);
      }
    }
    return answer;
  }

  // const deleteChatPointAndDescendants = (idToDelete: string): void => {
  //   chatPoints.update(chatPoints => {
  //     const chatPointIdsToDelete = new Set<string>();
  //     chatPointIdsToDelete.add(idToDelete);

  //     let currentSize: number;
  //     do {
  //       currentSize = chatPointIdsToDelete.size;
  //       chatPoints.forEach((chatPoint) => {
  //         if (chatPoint.previousId && chatPointIdsToDelete.has(chatPoint.previousId)) {
  //           chatPointIdsToDelete.add(chatPoint.id);
  //         }
  //       });
  //     } while (chatPointIdsToDelete.size > currentSize);

  //     return chatPoints.filter(chatPoint => !chatPointIdsToDelete.has(chatPoint.id));
  //   })
  // }

  const userPromptInput: Writable<string> = writable('');
  const findInput = writable('');

  const chatPoints = new SvelteBehaviorSubject([] as ChatPoint[]);
  const activeChatPointId = new SvelteBehaviorSubject('');
  const activeChatPoint = combineLatest([chatPoints, activeChatPointId]).pipe(
    filter(([_, acp]) => !!acp),
    map(([cps, aid]) => cps.find(cp => cp.id == aid)!) 
  );

  const activeChatThread: Observable<ChatPoint[]> = combineLatest([activeChatPointId, chatPoints]).pipe(
    filter(([acp]) => !!acp),
    map(([acp, cps]) => deriveThread(acp, cps))
  );

  

  const selectedChatPoints: Observable<ChatPoint[]> = chatPoints.pipe(map(cps => cps.filter(cp => cp.selected)));

  const chatPointsWithSearchTerm: Observable<ChatPoint[]> = of([]); //derived([chatPoints, findInput], ([chatPoints, findInput]) => chatPoints.filter(cp => cp.completions.some(c => c.content.includes(findInput))))
  // UI
  const readyForInput: Writable<boolean> = writable(true);
  const streamedCount: Writable<number> = writable(0);

  const treeDisplay: Observable<ChatPointDisplay[]> = chatPoints.pipe(
    map(chatPoints => prepareChatPointsForDisplay(chatPoints, '', (cp: ChatPoint) => chatPointToHtml(cp)))
  );
  
  const chatDisplay: Observable<ChatPointDisplay[]> = activeChatThread.pipe(
    startWith([]),
    tap((result) => console.log('chatDisplay', result)),
    map(chatPoints => prepareChatPointsForDisplay(chatPoints, '', (cp: ChatPoint) => chatPointToHtml(cp)))
  );
  

  const markdown = activeChatThread.pipe(
    map((t: ChatPoint[]) => {
      const rfi: boolean = get(readyForInput);
    
      const md: string = t.map(item => {
        const completionsMarkdown: string = item.completions.map(completion => `**${completion.role}**:\n\n${completion.content}`).join('\n\n');
        return `### ${item.id}\n${completionsMarkdown}`;
      }).join('\n\n');
      return `${md}\n\n---\n ${!rfi ? '==waiting for response...==' : ''}`;
    })
  );

  const renderedHtml = markdown.pipe(
    map((markdown: string) => marked(markdown))
  );

  const defaultFrontMatter = `---
stream: basic
---\n\n`;

  let frontMatter = '';
  // save to file
  const saveData = combineLatest([chatPoints, activeChatPointId]).pipe(
    map(([chatPoints, activeChatPointId]) => {
      const yaml = frontMatter || defaultFrontMatter + "```\n";

      const sd = {chatPoints, activeChatPointId};
      const json = JSON.stringify(sd, null, 2);
      return yaml + json;
    })
  );

  // Bus
  const bus = new SvelteBehaviorSubject<Message>(NoopMessage);
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
    // forkChatPoint,
    updateChatPoint,
    deriveThread,
    // deleteChatPointAndDescendants,
    sendMessage,
    subscribeToBus,
    bus,
    chatPoints,
    activeChatPointId,
    activeChatThread,
    activeChatPoint,
    selectedChatPoints,
    readyForInput,
    streamedCount,
    treeDisplay,
    chatDisplay,
    userPromptInput,
    findInput,
    markdown,
    renderedHtml,
    saveData,
  }
}