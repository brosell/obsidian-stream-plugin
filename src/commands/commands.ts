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
  
  const stores = getContextualStores(guid);
  const handlers = {
    [BusEvent.ChatIntent]: (message: Message) => {
      const { details, context } = message;
      stores.readyForInput.set(false);
      // const cp = addNewChatPoint(details.content, context.referenceId || get(activeChatPointId) || '');
      const cp = stores.addNewChatPoint(details.content, stores.activeChatPointId.getValue() || '');

      stores.activeChatPointId.set(cp.id);
      stores.sendMessage(BusEvent.UserPromptAvailable, { guid, referenceType: 'ChatPoint', referenceId: cp.id }, details.content);
    },

    [BusEvent.UserPromptAvailable]: (message: Message) => {
      const { details, context } = message;
      if (context.referenceType !== 'ChatPoint') {
        return; // not for us
      }
      const thread = stores.deriveThread(context.referenceId);
      const completions = thread.flatMap((cp: ChatPoint) => cp.completions) as Completion[];
      AI.prompt(completions, context);
    },

    [BusEvent.AIResponseAvailable]: (message: Message) => {
      const {details, context} = message;
      if (context.referenceType !== 'ChatPoint') {
        return; // not for us
      }
      const cp = stores.updateChatPoint(context.referenceId, (cp: ChatPoint) => {
        return {...cp, completions: [...cp.completions.filter(comp => comp.role != ChatRole.ASSISTANT), { role: ChatRole.ASSISTANT, content: details.content }]};
      });

      if (autoSUmmarize) {
        stores.sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/summarize(${context.referenceId})`});
      }

      stores.readyForInput.set(true);
      stores.activeChatPointId.set('');
      stores.activeChatPointId.set(cp!.id);
    },
    [BusEvent.AIStreamDelta]: (message: Message) => {
      const { context, details } = message;
      const stream: Observable<string> = details.stream;
      stream.pipe(
        scan((acc, value) => acc + value),
        // tap((res) => console.log(res)),
        finalize(() => console.log('done')),
        tap(result => {
          stores.updateChatPoint(context.referenceId, (cp: ChatPoint) => {
            let comp = cp.completions.find(comp => comp.role == ChatRole.ASSISTANT);
            if (!comp) {
              comp = { role: ChatRole.ASSISTANT, content: '' };
              cp.completions.push(comp);
            }
            comp.content = result;
            return cp;
          });
        })
      ).subscribe();

    } 
  }
  stores.subscribeToBus(guid, handlers);
}


