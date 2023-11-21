import { get } from "svelte/store";
import { activeChatPoint, activeChatPointId, chat } from "../stores/stores";
import { type ChatPoint, ChatRole } from "./chat-point";

export let chatPoints: ChatPoint[] = [];

let g_id = 0;

export const addNewChatPoint = (content: string, previousId: string = '') => {
  const child: ChatPoint = { id: `${g_id++}`, previousId, completions: [{ role: ChatRole.USER, content }]};
  chatPoints.push(child);
  return child;
}

export const updateChatPoint = (chatPointId: string, updater:(chatPoint: ChatPoint) => ChatPoint): ChatPoint => {
  const index = chatPoints.findIndex(cp => cp.id === chatPointId);
  if (index === -1) {
    throw new Error('tried to update nonexistent ChatPoint');
  }
  const chatPoint = chatPoints[index];

  const updated = updater({...chatPoint});
  chatPoints = [...chatPoints.slice(0, index), updated, ...chatPoints.slice(index + 1)]
  return updated;
}

export const deriveThread = (leafId: string): ChatPoint[] => {
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