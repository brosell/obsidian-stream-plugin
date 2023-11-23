import { get } from "svelte/store";
import { BusEvent, type Message, bus, sendMessage } from "../services/bus";
import { ChatRole, type Completion } from "../models/chat-point";
import { addNewChatPoint, deriveThread, updateChatPoint } from '../models/thread-repo';
import { readyForInput, activeChatPointId } from '../stores/stores';
import { AiInterface } from "../services/ai";

const ai = new AiInterface(100);

const commands: Record<string, (m: Message) => void> = {
  [BusEvent.ChatIntent]: (message) => {
    const { details, context } = message;
    readyForInput.set(false);
    const cp = addNewChatPoint(details.content, get(activeChatPointId));
    activeChatPointId.set(cp.id);
    sendMessage(BusEvent.UserPromptAvailable, { referenceType: 'ChatPoint', referenceId: cp.id }, details.content);
  },

  [BusEvent.UserPromptAvailable]: (message) => {
    const { details, context } = message;
    if (context.referenceType !== 'ChatPoint') {
      return; // not for us
    }
    const thread = deriveThread(context.referenceId);
    const completions = thread.flatMap(cp => cp.completions) as Completion[];
    ai.prompt(completions, context);
  },

  [BusEvent.AIResponseAvailable]: (message) => {
    const {details, context} = message;
    if (context.referenceType !== 'ChatPoint') {
      return; // not for us
    }
    const cp = updateChatPoint(context.referenceId, cp => {
      return {...cp, completions: [...cp.completions, { role: ChatRole.ASSISTANT, content: details.content }]}
    });

    readyForInput.set(true);
    activeChatPointId.set('');
    activeChatPointId.set(cp!.id);
  }
};

bus.subscribe( (message: Message) => {
  if (message && commands[message.event]) {
    commands[message.event](message);
  }
});
