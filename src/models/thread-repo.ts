import { get } from "svelte/store";
import { activeChatPoint, activeChatPointId } from "../stores/stores";
import { ChatPoint, ChatRole } from "./chat-point";

export const chatPoints: ChatPoint[] = [];

export const createChatPoint = (content: string) => {
  const current = get(activeChatPoint);
  const previousId = current?.id ?? undefined;

  const child = new ChatPoint(previousId, [ { role: ChatRole.USER, content } ]);
  chatPoints.push(child);
  activeChatPointId.set(child.id);
  return child;
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