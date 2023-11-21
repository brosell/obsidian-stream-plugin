import { get } from "svelte/store";
import { BusEvent, bus } from "../services/bus";
import { ChatRole, type Completion } from "../models/chat-point";
import { chatPoints, addNewChatPoint, deriveThread } from '../models/thread-repo';
import { readyForInput, activeChatThread, activeChatPoint, activeChatPointId, chat } from './stores';
import { AiInterface } from "../services/ai";

const ai = new AiInterface(10);

const commands: Record<string, (m: Record<string, any>) => void> = {
  [BusEvent.ChatIntent]: (details) => {
    readyForInput.set(false);
    const cp = addNewChatPoint(details.content);
    activeChatPointId.set(cp.id);
    bus.set({ event: BusEvent.UserPromptAvailable, details: { context: cp.id, content: details.content} });
  },
  [BusEvent.UserPromptAvailable]: (details) => {
    const thread = deriveThread(details.context);
    const completions = thread.flatMap(cp => cp.completions) as Completion[];
    // console.log(completions);
    ai.prompt(completions, details.context);
  },
  [BusEvent.AIResponseAvailable]: (details) => {
    const {context, content} = details;

    const cp = chatPoints.find(cp => cp.id == context);
    cp?.completions.push( { role: ChatRole.ASSISTANT, content });
    readyForInput.set(true);
    // activeChatPointId.update(currentId => currentId);
    activeChatPointId.set('');
    activeChatPointId.set(cp!.id);

    chat.set([]); chat.set(chatPoints);
  }
};

bus.subscribe(message => {
  if (message && commands[message.event]) {
    commands[message.event](message.details);
  }
});
