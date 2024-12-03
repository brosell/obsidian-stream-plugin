import { get } from "svelte/store";
import { BusEvent, Context, type Message } from "../services/bus";
import { ChatRole, type ChatPoint, type Completion } from "../models/chat-point";
import { getContextualStores } from "../stores/contextual-stores";
import { AiInterface } from "../services/ai";
import { settingsStore } from "../stores/settings";
import { finalize, scan, tap, type Observable } from "rxjs";

export const subscribeForContext = (guid: string) => {
  let AI: AiInterface;
  let autoSUmmarize = false;
  settingsStore.subscribe((settings) => {
    AI = new AiInterface(100, settings.MODEL || 'gpt-3.5-turbo');
    autoSUmmarize = settings.AUTO_SUMMARIZE;
  });
  
  const { sendMessage, activeChatPointId, addNewChatPoint, deriveThread, updateChatPoint, subscribeToBus, readyForInput } = getContextualStores(guid);
  const handlers = {
    [BusEvent.ChatIntent]: (message: Message) => {
      const { details, context } = message;
      readyForInput.set(false);
      // const cp = addNewChatPoint(details.content, context.referenceId || get(activeChatPointId) || '');
      const cp = addNewChatPoint(details.content, activeChatPointId.getValue() || '');

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
        return {...cp, completions: [...cp.completions.filter(comp => comp.role != ChatRole.ASSISTANT), { role: ChatRole.ASSISTANT, content: details.content }]};
      });

      if (autoSUmmarize) {
        sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/summarize(${context.referenceId})`});
      }

      readyForInput.set(true);
      activeChatPointId.set('');
      activeChatPointId.set(cp!.id);
    },
    [BusEvent.AIStreamDelta]: (message: Message) => {
      const { context, details } = message;
      const stream: Observable<string> = details.stream;
      stream.pipe(
        scan((acc, value) => acc + value),
        // tap((res) => console.log(res)),
        finalize(() => console.log('done')),
        tap(result => {
          updateChatPoint(context.referenceId, (cp: ChatPoint) => {
            return {...cp, completions: [...cp.completions.filter(comp => comp.role != ChatRole.ASSISTANT), { role: ChatRole.ASSISTANT, content: result }]};
          });
        })
      ).subscribe();

    } 
  }
  subscribeToBus(guid, handlers);
}


