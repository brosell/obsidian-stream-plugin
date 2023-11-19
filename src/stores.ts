import { writable, derived } from "svelte/store";
import {marked} from 'marked';

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
export const activeChatThread = derived(activeChatPointId, id => [...chatPoints] as ChatPoint[]);

export const markdown = derived(activeChatThread, t => `\`\`\`
${JSON.stringify(t, null, 2)}
\`\`\`
`);

export const renderedHtml = derived(markdown, markdown => marked(markdown));

// bootstrap
const rootCP = new ChatPoint(undefined, [{ role: ChatRole.SYSTEM, content: 'You are a helpful assistant' } ]);

chatPoints.push(rootCP);

activeChatPointId.set(rootCP.id);