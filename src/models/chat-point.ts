export enum ChatRole {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  ASSISTANT = 'ASSISTANT'
}
export interface Completion {
  role: ChatRole;
  content: string;
}
let g_id = 0;
export class ChatPoint {
  id: string;

  constructor(public previousId: string, private completions: Completion[] = []) {
    this.id = (g_id++).toString();
  }

  setUserPrompt(content: string) {
    if (this.completions.length) {
      throw new Error(`Cannot add User prompt because current Completion Roles [${this.completions.map(c => c.role)}] already exists`);
    }

    this.completions.push({ role: ChatRole.USER, content });
  }

  setAssistantResponse(content: string) {
    if (this.completions[0]?.role !== ChatRole.USER) {
      throw new Error(`Cannot add Assistant response for current Completion Roles of [${this.completions.map(c => c.role)}]`);
    }

    this.completions.push({ role: ChatRole.SYSTEM, content });
  }

  getCompletions() {
    return this.completions.map(c => ({
      role: c.role.toLowerCase(),
      content: c.content
    }));
  }
}
