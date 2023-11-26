import { get } from "svelte/store";
import { BusEvent, type Message, bus, sendMessage } from "../services/bus";
import { ChatRole, type ChatPoint, type Completion } from "../models/chat-point";
import { readyForInput, activeChatPointId, AI } from '../stores/stores';
import { getContextualStores } from "../stores/contextual-stores";

export const subscribeForContext = (guid: string) => {
  const { addNewChatPoint, deriveThread, updateChatPoint, subscribeToBus } = getContextualStores(guid);
  const handlers = {
    [BusEvent.ChatIntent]: (message: Message) => {
      const { details, context } = message;
      readyForInput.set(false);
      const cp = addNewChatPoint(details.content, get(activeChatPointId));
      activeChatPointId.set(cp.id);
      sendMessage(BusEvent.UserPromptAvailable, { referenceType: 'ChatPoint', referenceId: cp.id }, details.content);
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

  subscribeToBus(handlers);
}


