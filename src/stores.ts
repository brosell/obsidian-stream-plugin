import { writable, derived, get, readable } from "svelte/store";
import {marked} from 'marked';

import { bus } from "./services/bus";
import { ChatPoint, ChatRole } from "./models/chat-point";

const chatPoints: ChatPoint[] = [];

export const activeChatPointId = writable('');

const deriveThread = (leafId: string): ChatPoint[] => {
  const answer = [] as ChatPoint[];
  if (!leafId) {
    return answer;
  }

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

// export const markdown = derived(activeChatThread, t => '# Hello');

export const markdown = derived(activeChatThread, t => `\`\`\`
${JSON.stringify(t.map(c => c.getCompletions()), null, 2)}
\`\`\`
`);

export const renderedHtml = derived(markdown, markdown => marked(markdown));

const addChild = (content: string) => {
  const current = get(activeChatPoint);
  const previousId = current?.id ?? undefined;

  const child = new ChatPoint(previousId, [ { role: ChatRole.USER, content } ]);
  chatPoints.push(child);
  activeChatPointId.set(child.id);
  
  setTimeout(() => {
    child.setAssistantResponse(`echo: ${content}`); 
    activeChatPointId.set(''); activeChatPointId.set(child.id);
    readyForInput.set(true);
  }, 2000);
}

const commands: Record<string, (m: Record<string, any>) => void> = {
  'ChatIntent': (details) => {
    readyForInput.set(false);
    addChild(details.content)
  }
}

bus.subscribe(message => {
  if (message && commands[message.event]) {
    commands[message.event](message.details);
  }
})

export const readyForInput = writable(true);

// test stuff
const rootCP = new ChatPoint(undefined, [{ role: ChatRole.SYSTEM, content: 'You are a helpful assistant' } ]);

chatPoints.push(rootCP);

activeChatPointId.set(rootCP.id);

// setTimeout(() => {bus.set({ event: BusEvent.AddToChat, details: { content: `what what ${g_id++}` }}); bus.set({ event: BusEvent.AddToChat, details: { content: `what what ${g_id++}` }})}, 2000);

