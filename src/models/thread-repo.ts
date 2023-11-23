import { get, writable } from "svelte/store";
import { type ChatPoint, ChatRole } from "./chat-point";

// export let chatPoints: ChatPoint[] = [];
export const chatPoints = writable([] as ChatPoint[]);

let g_id = 0;

export const addNewChatPoint = (content: string, previousId: string = '', role: ChatRole = ChatRole.USER) => {
  const child: ChatPoint = { id: `${g_id++}`, previousId, completions: [{ role, content }]};
  chatPoints.update(arr => [...arr, child ]);
  return child;
}

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