import { get, writable } from "svelte/store";
import { type ChatPoint, ChatRole } from "./chat-point";
import { activeChatPointId } from "../stores/stores";

let g_id = 0;

export const addNewChatPoint = (content: string, previousId: string = '', role: ChatRole = ChatRole.USER) => {
  const child: ChatPoint = { id: `${g_id++}`, previousId, completions: [{ role, content }]};
  chatPoints.update(arr => [...arr, child ]);
  return child;
}

export const forkChatPoint = (chatPointId: string) => {
  const source = getChatPoint(chatPointId);
  if (!source) {
    throw new Error('tried to fork nonexistent ChatPoint');
  }
  const newCP: ChatPoint = {...source, id: `${g_id++}`, previousId: '', completions: [...source.completions]};
  chatPoints.update(arr => [...arr, newCP]);
  activeChatPointId.set(newCP.id);
}

export const getChatPoint = (id: string): ChatPoint | undefined => get(chatPoints).find(cp => cp.id === id);

export const updateChatPoint = (chatPointId: string, updater:(chatPoint: ChatPoint) => ChatPoint): ChatPoint => {
  let updated: ChatPoint;
  chatPoints.update(arr => {
    const index = arr.findIndex(cp => cp.id === chatPointId);
    if (index === -1) {
      throw new Error('tried to update nonexistent ChatPoint');
    }
    const chatPoint = arr[index];

    updated = updater({...chatPoint});
    return [...arr.slice(0, index), updated, ...arr.slice(index + 1)]
  });
  return updated!
}

export const deriveThread = (leafId: string): ChatPoint[] => {
  const answer = [] as ChatPoint[];
  if (!leafId) {
    return answer;
  }

  const arr = get(chatPoints);
  let node=arr.find(cp => cp.id === leafId);
  if (!node) {
    throw new Error(`tried to create a thread for nonexisting leaf ${leafId}`)
  }

  answer.unshift(node);
  while (node.previousId) {
    node = arr.find(cp => cp.id === node?.previousId);
    if (!node) {
      throw new Error(`tried to create thread but the linkage is broken ${leafId}`);
    }
    answer.unshift(node);
  }
  return answer;
}

export function deleteChatPointAndDescendants(idToDelete: string): void {
  chatPoints.update(chatPoints => {
    const chatPointIdsToDelete = new Set<string>();
    chatPointIdsToDelete.add(idToDelete);

    let currentSize: number;
    do {
        currentSize = chatPointIdsToDelete.size;
        chatPoints.forEach((chatPoint) => {
            if (chatPoint.previousId && chatPointIdsToDelete.has(chatPoint.previousId)) {
                chatPointIdsToDelete.add(chatPoint.id);
            }
        });
    } while (chatPointIdsToDelete.size > currentSize);

    return chatPoints.filter(chatPoint => !chatPointIdsToDelete.has(chatPoint.id));
  })
}