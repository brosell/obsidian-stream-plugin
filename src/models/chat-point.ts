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
}
