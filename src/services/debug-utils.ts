import { chatPoints } from "../models/thread-repo";
import { activeChatPointId, tree } from "../stores/stores";

setTimeout(() => {
  window.activeChatId = activeChatPointId;
  window.chat = chatPoints;
  window.tree = tree;
})