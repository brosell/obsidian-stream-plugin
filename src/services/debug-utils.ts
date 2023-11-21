import { activeChatPointId, chat, tree } from "../stores/stores";

setTimeout(() => {
  window.activeChatId = activeChatPointId;
  window.chat = chat;
  window.tree = tree;
})