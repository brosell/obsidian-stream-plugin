import { marked } from "marked";
import { deriveThread } from "./thread-repo";

export enum ChatRole {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  ASSISTANT = 'ASSISTANT'
}
export interface Completion {
  role: ChatRole;
  content: string;
}

export interface ChatPoint {
  id: string;
  previousId: string;
  completions: Completion[];
  summary?: string;
}

export const chatPointToMarkdown = (item: ChatPoint) => {
  const completionsMarkdown = item.completions.map(completion => `**${completion.role}**: ${completion.content}`).join('\n\n');
  return `${completionsMarkdown}`;
}

export const chatPointToHtml = (item: ChatPoint) => {
  return marked(chatPointToMarkdown(item));
}

export const threadToMarkdown = (threadLeafId: string) => {
  const thread = deriveThread(threadLeafId);
  return thread.map(cp => `${chatPointToMarkdown(cp)}\n\n`);
}
