import { writable, derived, get } from "svelte/store";
import {marked} from 'marked';

import { bus, type Message, BusEvent } from "./services/bus";

enum ChatRole {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  ASSISTANT = 'ASSISTANT'
}

interface Completion {
  role: ChatRole;
  content: string;
}

let g_id = 0;

class ChatPoint {
  id: string;
  
  constructor(public previousId?: string, private completions: Completion[] = []) {
    this.id = (g_id++).toString();
  }

  setUserPrompt(content: string) {
    if(this.completions.length) {
      throw new Error(`Cannot add User prompt because current Completion Roles [${this.completions.map(c => c.role)}] already exists`);
    }

    this.completions.push({ role: ChatRole.USER, content } );
  }

  setAssistantResponse(content: string) {
    if (this.completions[0]?.role !== ChatRole.USER) {
      throw new Error(`Cannot add Assistant response for current Completion Roles of [${this.completions.map(c => c.role)}]`)
    }

    this.completions.push({ role: ChatRole.SYSTEM, content } );
  }
}

const chatPoints: ChatPoint[] = [];

export const activeChatPointId = writable('');

const deriveThread = (leafId: string): ChatPoint[] => {
  const answer = [] as ChatPoint[];
  let node=chatPoints.find(cp => cp.id === leafId);
  if (!node) {
    throw new Error(`tried to create a thread for nonexisting leaf ${leafId}`)
  }
  answer.unshift(node);
  while (node.previousId) {
    node = chatPoints.find(cp => cp.id === node?.previousId);
    if (!node) {
      throw new Error(`tried to create thread but the linkage is broken ${leafId}`);
    }
    answer.unshift(node);
  }

  return answer;
}

export const activeChatThread = derived(activeChatPointId, deriveThread);
export const activeChatPoint = derived(activeChatPointId, id => chatPoints.find(cp => cp.id === id));

export const markdown = derived(activeChatThread, t => `\`\`\`
${JSON.stringify(t, null, 2)}
\`\`\`
`);

export const renderedHtml = derived(markdown, markdown => marked(markdown));

const addChild = (content: string) => {
  const current = get(activeChatPoint);
  const previousId = current?.id ?? undefined;

  const child = new ChatPoint(previousId, [ { role: ChatRole.USER, content } ]);
  chatPoints.push(child);
  activeChatPointId.set(child.id);
  
  setTimeout(() => {child.setAssistantResponse(`echo: ${content}`); activeChatPointId.set(child.id);}, 500);
}

const commands: Record<string, (m: Record<string, any>) => void> = {
  'ChatIntent': (details) => {
    addChild(details.content)
  }
}

bus.subscribe(message => {
  if (message && commands[message.event]) {
    commands[message.event](message.details);
  }
})



// test stuff
const rootCP = new ChatPoint(undefined, [{ role: ChatRole.SYSTEM, content: 'You are a helpful assistant' } ]);

chatPoints.push(rootCP);

activeChatPointId.set(rootCP.id);

// setTimeout(() => {bus.set({ event: BusEvent.AddToChat, details: { content: `what what ${g_id++}` }}); bus.set({ event: BusEvent.AddToChat, details: { content: `what what ${g_id++}` }})}, 2000);

