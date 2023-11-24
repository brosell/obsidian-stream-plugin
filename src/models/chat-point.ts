import { marked } from "marked";

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