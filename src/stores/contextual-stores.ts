import { writable, get as svGet, type Writable } from 'svelte/store';
import { ChatRole, chatPointToHtml, type ChatPoint } from '../models/chat-point';
import { prepareChatPointsForDisplay, type ChatPointDisplay } from '../services/nested-list-builder';
import { NoopMessage, type BusEvent, type Message, type MessageContext, errorBus } from '../services/bus';
import { marked } from 'marked';
import { subscribeForContext } from '../commands/commands';
import { subscribeSlashCommandsForContext } from '../commands/slash-functions';
import { BehaviorSubject, combineLatest, filter, map, Observable, of, startWith, Subject, tap, withLatestFrom } from 'rxjs';

export class SvelteBehaviorSubject<T> extends BehaviorSubject<T> {
  set(value: T) {
    this.next(value);
  }
}

export class SvelteSubject<T> extends Subject<T> {
  set(value: T) {
    this.next(value);
  }
}

export function get<T>(store: Observable<T>): T {
  let value = <T>null; 
  
  of(0).pipe(
    withLatestFrom(store),
    tap(([_, result]) => value = result),
  ).subscribe();
  return value;
}

const storeInstances: Map<string, ContextualStores> = new Map();

export class ContextualStores {
  bus: SvelteSubject<Message>;
  chatPoints: SvelteBehaviorSubject<ChatPoint[]>;
  activeChatPointId: SvelteBehaviorSubject<string | null>;
  activeChatThread: Observable<ChatPoint[]>;
  activeChatPoint: Observable<ChatPoint | undefined>;
  selectedChatPoints: Observable<ChatPoint[]>;
  treeDisplay: Observable<ChatPointDisplay[]>;
  chatDisplay: Observable<ChatPointDisplay[]>;
  renderedHtml: Observable<string>;
  saveData: Observable<string>;

  findInput: SvelteSubject<string>;
  markdown: Observable<string>;
  
  userPromptInput: Writable<string>;
  readyForInput: Writable<boolean>;
  streamedCount: Writable<number>;

  private idCounter: number = 0;
  private frontMatter: string = '';
  private searchSubject: SvelteSubject<string>;

  constructor(guid: string) {
    this.bus = new SvelteBehaviorSubject<Message>(NoopMessage);
    this.chatPoints = new SvelteBehaviorSubject<ChatPoint[]>([]);
    this.activeChatPointId = new SvelteBehaviorSubject<string | null>(null);
    this.userPromptInput = writable('');
    this.readyForInput = writable(true);
    this.streamedCount = writable(0);
    this.findInput = new SvelteSubject<string>();
    this.searchSubject = new SvelteSubject<string>();

    this.activeChatPoint = combineLatest([this.chatPoints, this.activeChatPointId]).pipe(
      filter(([_, activeId]) => !!activeId),
      map(([chatPoints, activeId]) => chatPoints.find(chatPoint => chatPoint.id == activeId))
    );

    this.activeChatThread = combineLatest([this.activeChatPointId, this.chatPoints]).pipe(
      filter(([activeId]) => !!activeId),
      map(([activeId, chatPoints]) => this.deriveThread(activeId!, chatPoints))
    );

    this.selectedChatPoints = this.chatPoints.pipe(map(chatPoints => chatPoints.filter(chatPoint => chatPoint.selected)));

    this.treeDisplay = this.chatPoints.pipe(
      map(chatPoints => prepareChatPointsForDisplay(chatPoints, '', (chatPoint: ChatPoint) => chatPointToHtml(chatPoint)))
    );

    this.chatDisplay = this.activeChatThread.pipe(
      startWith([]),
      tap((result) => console.log('chatDisplay', result)),
      map(chatPoints => prepareChatPointsForDisplay(chatPoints, '', (chatPoint: ChatPoint) => chatPointToHtml(chatPoint)))
    );

    this.markdown = this.activeChatThread.pipe(
      map((chatPoints: ChatPoint[]) => {
        const readyForInput: boolean = svGet(this.readyForInput);
      
        const markdownContent: string = chatPoints.map(chatPoint => {
          const completionsMarkdown: string = chatPoint.completions.map(completion => `**${completion.role}**:\n\n${completion.content}`).join('\n\n');
          return `### ${chatPoint.id}\n${completionsMarkdown}`;
        }).join('\n\n');
        return `${markdownContent}\n\n---\n ${!readyForInput ? '==waiting for response...==' : ''}`;
      })
    );

    this.renderedHtml = this.markdown.pipe(
      map((markdown: string) => marked(markdown))
    );

    this.saveData = combineLatest([this.chatPoints, this.activeChatPointId]).pipe(
      map(([chatPoints, activeChatPointId]) => {
        const yaml = this.frontMatter || `---\nstream: basic\n---\n\n\`\`\`\n`;

        const saveData = { chatPoints, activeChatPointId };
        const json = JSON.stringify(saveData, null, 2);
        return yaml + json;
      })
    );

    storeInstances.set(guid, this);
    subscribeForContext(guid);
    subscribeSlashCommandsForContext(guid);

    // Initial load
    this.loadChatPoints('');
    this.bus.subscribe((message: Message) => {
      console.log('bus message', message);
    });
  }

  // Define all the methods implementing ContextualStores here

  loadChatPoints(loadData: string): void {
    let parsedData = { chatPoints: [{previousId: '', id: '0', completions: [{ role: ChatRole.SYSTEM, content: 'You are a Helpful assistant for coding and other tasks' } ]}], activeChatPointId: "0" };
    this.activeChatPointId.set('');

    const index = loadData.indexOf('{');
    if (index !== -1) {
      this.frontMatter = loadData.substring(0, index);
      parsedData = JSON.parse(loadData.substring(index));
    }
    
    this.chatPoints.set(parsedData.chatPoints);
    if (parsedData.activeChatPointId !== '') {
      this.activeChatPointId.set(parsedData.activeChatPointId);
    }
    this.idCounter = Math.max(...parsedData.chatPoints.map((cp: { id: string; }) => parseInt(cp.id))) + 1;
  }

  addNewChatPoint(content: string, previousId: string = '', role: ChatRole = ChatRole.USER): ChatPoint {
    const newChatPoint: ChatPoint = { id: `${this.idCounter++}`, previousId, completions: [{ role, content }] };
    this.chatPoints.next([...this.chatPoints.getValue(), newChatPoint]);
    return newChatPoint;
  }

  getChatPoint(id: string): ChatPoint | undefined {
    return this.chatPoints.getValue().find(chatPoint => chatPoint.id == id);
  }

  forkChatPoint(chatPointId: string): void {
    of(0).pipe(
      withLatestFrom(this.activeChatPoint),
      map(([_, activeChatPoint]) => activeChatPoint),
      tap((currentActiveChatPoint) => {
        const source = this.getChatPoint(chatPointId) || currentActiveChatPoint;
        if (!source) {
          errorBus.set(`tried to fork nonexistent ChatPoint with id: ${chatPointId}`);
          return;
        }
        const newChatPoint: ChatPoint = { ...source, id: `${this.idCounter++}`, previousId: '', completions: [...source.completions] };
        this.chatPoints.next([...this.chatPoints.getValue(), newChatPoint]);
        this.activeChatPointId.set(newChatPoint.id);
      })
    ).subscribe();
  }

  updateChatPoint(chatPointId: string, updater: (chatPoint: ChatPoint) => ChatPoint): ChatPoint | undefined {
    const updatedChatPoints = this.chatPoints.getValue().map(chatPoint => chatPoint.id == chatPointId ? updater({ ...chatPoint }) : chatPoint );
    this.chatPoints.next(updatedChatPoints);
    return updatedChatPoints.find(updatedChatPoint => updatedChatPoint.id == chatPointId);
  }

  deriveThread(leafNodeId: string, chatPointsList?: ChatPoint[]): ChatPoint[] {
    const thread: ChatPoint[] = [];

    if (!chatPointsList) {
      chatPointsList = this.chatPoints.getValue();
    }

    let currentNode = chatPointsList.find(chatPoint => chatPoint.id === leafNodeId)!;
    thread.unshift(currentNode);

    while (currentNode?.previousId) {
      currentNode = chatPointsList.find(chatPoint => chatPoint.id === currentNode.previousId)!;
      if (currentNode) {
        thread.unshift(currentNode);
      }
    }
    return thread;
  }

  deleteChatPointAndDescendants(idToDelete: string): void {
    const existingChatPoints = this.chatPoints.getValue();

    const idsToDelete = new Set<string>();
    idsToDelete.add(idToDelete);

    let currentSize: number;
    do {
      currentSize = idsToDelete.size;
      existingChatPoints.forEach((chatPoint) => {
        if (chatPoint.previousId && idsToDelete.has(chatPoint.previousId)) {
          idsToDelete.add(chatPoint.id);
        }
      });
    } while (idsToDelete.size > currentSize);

    this.chatPoints.next(existingChatPoints.filter(chatPoint => !idsToDelete.has(chatPoint.id)));
  }

  sendMessage(event: BusEvent, context: MessageContext, details: any = {}) {
    this.bus.set({ event, context, details });
  }

  subscribeToBus(guid: string, handlers: Record<string, (message: Message) => void>) {
    this.bus.subscribe( (message: Message) => {
      if (message && message.context.guid === guid && handlers[message.event]) {
        handlers[message.event](message);
      }
    });
  }
}

// Usage
export const getContextualStores = (guid: string): ContextualStores => {
  if (!storeInstances.has(guid)) {
    storeInstances.set(guid, new ContextualStores(guid));
  }
  return storeInstances.get(guid)!;
};