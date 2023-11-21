import { get } from "svelte/store";
import { BusEvent, bus } from "../services/bus";
import { type Completion } from "../models/chat-point";
import { chatPoints, createChatPoint } from '../models/thread-repo';
import { readyForInput, activeChatThread, activeChatPoint, activeChatPointId, chat } from './stores';
import { AiInterface } from "../services/ai";

const ai = new AiInterface(10);

const commands: Record<string, (m: Record<string, any>) => void> = {
  [BusEvent.ChatIntent]: (details) => {
    readyForInput.set(false);
    createChatPoint(details.content);
    bus.set({ event: BusEvent.UserPromptAvailable, details: {} });
  },
  [BusEvent.UserPromptAvailable]: (details) => {
    const thread = get(activeChatThread);
    const completions = thread.flatMap(cp => cp.getCompletions()) as Completion[];
    // console.log(completions);
    ai.prompt(completions);
  },
  [BusEvent.AIResponseAvailable]: (details) => {
    const cp = get(activeChatPoint);
    cp!.setAssistantResponse(details.content);
    readyForInput.set(true);
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
