import { get } from "svelte/store";
import { BusEvent, Context, errorBus, type Message } from "../services/bus";
import { ChatRole, type ChatPoint, type Completion, chatPointToMarkdown } from "../models/chat-point";
import { getContextualStores } from "../stores/contextual-stores";
import { AiInterface } from "../services/ai";
import { settingsStore } from "../stores/settings";
import prompts from "../models/prompts";

export const subscribeSlashCommandsForContext = (guid: string) => {
  const { activeChatPointId, activeChatPoint, activeChatThread, chatPoints, userPromptInput, 
    forkChatPoint, addNewChatPoint, getChatPoint, deleteChatPointAndDescendants, 
    updateChatPoint, subscribeToBus, sendMessage, deriveThread } = getContextualStores(guid);

  let AI: AiInterface;
  settingsStore.subscribe((settings) => {
    AI = new AiInterface(100, settings.SUMMARY_MODEL || 'gpt-3.5-turbo' );
  });

  
  const slashFunctions: Record<string, (c: string[]) => void> = {
    setThread: (args: string[]) => {
      const id = args[0];
      const cps = get(chatPoints) as ChatPoint[];
      if (cps.find((sp: ChatPoint) => sp.id === id)) {
        activeChatPointId.set(id);
      }
    },
    fork: (args: string[]) => {
      const [ chatPointId ] = args;
      
      forkChatPoint(chatPointId);
    },
    addSystemPrompt: (args: string[]) => {
      const prompt = args.join(','); // just in case the prompt has commas which would have been used to split
      const previousId = get(activeChatPointId) || '';
      
      const cp = addNewChatPoint(prompt, previousId, ChatRole.SYSTEM);
      activeChatPointId.set(cp.id);
    },
    deleteNode: (args: string[]) => {
      const idToDelete = args[0];
      if (!idToDelete || idToDelete === 'root') {
        return;
      }
      const thread = get(activeChatThread) as ChatPoint[];
      const currentThreadIds = [...thread.map((cp: ChatPoint) => cp.id)].reverse();
      activeChatPointId.set('');
      deleteChatPointAndDescendants(idToDelete);

      for (let i = 0; i < currentThreadIds.length; i++) {
        const cp = getChatPoint(currentThreadIds[i]);
        if (cp) {
          activeChatPointId.set(cp.id)
          break;
        }
      }
    },
    refine: (_: string[]) => {
      const curCP = get(activeChatPoint) as ChatPoint;
      const userPrompt = curCP?.completions.find((c:Completion) => c.role === ChatRole.USER)?.content;
      if (!userPrompt) {
        return;
      }
      activeChatPointId.set(curCP.previousId);
      setTimeout(() => userPromptInput.set(userPrompt));
    },
    summarize: async (args: string[]) => {
      console.log('summarize', args);
      const cpId = args[0] || get(activeChatPointId) || '';
      const cp = getChatPoint(cpId);
      if (!cp) {
        errorBus.set(`tried to summarize nonexistent ChatPoint with id: ${cpId}`);
        return;
      }

      const textToSummarize = chatPointToMarkdown(cp);
      const completions = [{ role: ChatRole.USER, content: prompts.SummaryOfChatPoint({text:textToSummarize}) }];
      const summary = await AI.prompt(completions, 'awaited');
      updateChatPoint(cp.id, (cp: ChatPoint) => ({ ...cp, summary }));
    },
    summarizeThread: async (args: string[]) => {
      const cpId = args[0] || get(activeChatPointId)!;
      activeChatPointId.set(cpId);
      const myCompletions = get(activeChatThread)
        .flatMap((cp: ChatPoint) => cp.completions);

      myCompletions.push({ role: ChatRole.USER, content: prompts.SummaryOfThread() });
      const summary = await AI.prompt([...myCompletions], 'awaited');
      const cp = addNewChatPoint(summary, cpId, ChatRole.SYSTEM);
      activeChatPointId.set(cp.id);
    },
    analyzeMyWriting: async (args: string[]) => {
      const myCompletions = get(chatPoints)
        .flatMap((cp: ChatPoint) => cp.completions)
        .filter((c: Completion) => c.role === ChatRole.USER)
        .map((c: Completion) => c.content.trim())
        .join('\n===\n');

      const prompt = prompts.AnalyzeMyWriting({ text: myCompletions });
      //sendMessage(BusEvent.ChatIntent, { ...Context.Null, referenceId: '0', guid } , { content: prompt});
      const emulationPrompt = await AI.prompt([{ role: ChatRole.USER, content: prompt }], 'awaited');
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, referenceId: '0', guid } , { content: `/addSystemPrompt(${emulationPrompt})` });
    },
    move: (args: string[]) => {
      const [id, newPreviousId] = args;
      updateChatPoint(id, (cp: ChatPoint) => ({ ...cp, previousId: newPreviousId }));
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid } , { content: `/setThread(${id})` });
    }
  }


  const commands: Record<string, (m: Message) => void> = {
    [BusEvent.SlashFunction]: (message) => {
      const commandSpec = parseSlashCommand(message.details.content);
      if (!commandSpec) {
        return;
      }

      const { commandName, args } = commandSpec;
      console.log('/function:', commandName, 'args', args);

      if (commandName && slashFunctions[commandName]) {
        slashFunctions[commandName](args);
      }
    },
  };

  subscribeToBus(guid, commands)
}

export function isSlashCommandFormat(input: string): boolean {
  const commandPattern = /^\/\w+\(.*\)$/;
  return commandPattern.test(input);
}

function parseSlashCommand(input: string): { commandName: string; args: string[] } | null {
  if (!isSlashCommandFormat(input)) {
    return null;
  }

  const commandNameMatch = input.match(/^\/(\w+)\(/);
  const commandName = commandNameMatch ? commandNameMatch[1] : '';

  const argsMatch = input.match(/\((.*)\)/);
  const argsString = argsMatch ? argsMatch[1] : '';
  const args = argsString.split(',').map(arg => arg.trim());

  return { commandName, args };
}
