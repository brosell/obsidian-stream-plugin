import type { ChatPoint } from "../models/chat-point";
import { activeChatPoint, activeChatPointId, readyForInput } from "../stores/stores";

// setTimeout(() => activeChatPoint.subscribe((cp) => { if (cp) onActiveChatPointIdChanged(cp); }), 1);

export function onActiveChatPointIdChanged(cp: ChatPoint) {
  console.log('get ai response');
  // setTimeout(() => {
  //     cp.setAssistantResponse(`echo: ${cp.getCompletions().USER}`); 
  //     activeChatPointId.set(''); activeChatPointId.set(cp.id);
  //     readyForInput.set(true);
  //   }, 2000);
}