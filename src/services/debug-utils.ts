import { chatPoints } from "../models/thread-repo";
import { activeChatPointId } from "../stores/stores";

setTimeout(() => {
  window.activeChatId = activeChatPointId;
  window.chat = chatPoints;
})