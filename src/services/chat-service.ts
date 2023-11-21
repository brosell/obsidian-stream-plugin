import type { ChatPoint } from "../models/chat-point";
import { activeChatPoint, activeChatPointId, readyForInput } from "../stores/stores";

export function onActiveChatPointIdChanged(cp: ChatPoint) {
  console.log('get ai response');
}