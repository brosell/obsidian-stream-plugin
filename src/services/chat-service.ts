import { activeChatPointId } from "../stores";

export class ChatService {
  constructor() {
    activeChatPointId.subscribe((id) => { this.onActiveChatPointIdChanged(id); })
  }

  onActiveChatPointIdChanged(id: string) {
    /* if the current CP doesn't have an AI response then
        get one!
    */
  }
}