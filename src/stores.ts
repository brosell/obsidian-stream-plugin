import { writable, derived, get, readable } from "svelte/store";
import {marked} from 'marked';

import { BusEvent, bus } from "./services/bus";
import { ChatPoint, ChatRole, type Completion } from "./models/chat-point";
import { AiInterface } from "./services/ai"

const ai = new AiInterface(10);

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

export const jsonMarkdown = derived(activeChatThread, t => `\`\`\`
${JSON.stringify(t.flatMap(c => c.getCompletions()), null, 2)}
\`\`\`
`);

export const markdown = derived(activeChatThread, t => {
  const rfi = get(readyForInput);
  const md = t.flatMap(c => c.getCompletions())
          .map(c => `**${c.role}**: ${c.content}\n`)
          .join('\n');
  return `${md}\n ${!rfi?'waiting for response...':''}`;
}); 

export const renderedHtml = derived(markdown, markdown => marked(markdown));

const createChatPoint = (content: string) => {
  const current = get(activeChatPoint);
  const previousId = current?.id ?? undefined;

  const child = new ChatPoint(previousId, [ { role: ChatRole.USER, content } ]);
  chatPoints.push(child);
  activeChatPointId.set(child.id);
  return child;
}

const commands: Record<string, (m: Record<string, any>) => void> = {
  [BusEvent.ChatIntent]: (details) => {
    readyForInput.set(false);
    createChatPoint(details.content);
    bus.set({ event: BusEvent.UserPromptAvailable, details: { } });
  },
  [BusEvent.UserPromptAvailable]: (details) => {
    const thread = get(activeChatThread);
    const completions = thread.flatMap(cp => cp.getCompletions()) as Completion[];
    // console.log(completions);
    ai.prompt(completions);
  },
  [BusEvent.AIResponseAvailable]: (details) => {
    const cp = get(activeChatPoint);
    cp!.setAssistantResponse(details.content)
    readyForInput.set(true);
    activeChatPointId.set('');
    activeChatPointId.set(cp!.id);
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

