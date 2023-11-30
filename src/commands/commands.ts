import { get } from "svelte/store";
import { BusEvent, type Message } from "../services/bus";
import { ChatRole, type ChatPoint, type Completion } from "../models/chat-point";
import { getContextualStores } from "../stores/contextual-stores";
import { AiInterface } from "../services/ai";

export const subscribeForContext = (guid: string) => {
  const AI = new AiInterface(100, 'gpt-4-1106-preview');
  
  const { sendMessage, activeChatPointId, addNewChatPoint, deriveThread, updateChatPoint, subscribeToBus, readyForInput } = getContextualStores(guid);
  const handlers = {
    [BusEvent.ChatIntent]: (message: Message) => {
      const { details, context } = message;
      readyForInput.set(false);
      const cp = addNewChatPoint(details.content, get(activeChatPointId) || '');
      activeChatPointId.set(cp.id);
      sendMessage(BusEvent.UserPromptAvailable, { guid, referenceType: 'ChatPoint', referenceId: cp.id }, details.content);
    },

    [BusEvent.UserPromptAvailable]: (message: Message) => {
      const { details, context } = message;
      if (context.referenceType !== 'ChatPoint') {
        return; // not for us
      }
      const thread = deriveThread(context.referenceId);
      const completions = thread.flatMap((cp: ChatPoint) => cp.completions) as Completion[];
      AI.prompt(completions, context);
    },

    [BusEvent.AIResponseAvailable]: (message: Message) => {
      const {details, context} = message;
      if (context.referenceType !== 'ChatPoint') {
        return; // not for us
      }
      const cp = updateChatPoint(context.referenceId, (cp: ChatPoint) => {
        return {...cp, completions: [...cp.completions, { role: ChatRole.ASSISTANT, content: details.content }]};
      });

      readyForInput.set(true);
      activeChatPointId.set('');
      activeChatPointId.set(cp!.id);
    }
  }

  subscribeToBus(guid, handlers);
}


