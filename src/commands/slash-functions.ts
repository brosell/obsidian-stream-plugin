import { get } from "svelte/store";
import { BusEvent, type Message } from "../services/bus";
import { ChatRole, type ChatPoint, type Completion } from "../models/chat-point";
import { getContextualStores } from "../stores/contextual-stores";

export const subscribeSlashCommandsForContext = (guid: string) => {
  const { activeChatPointId, activeChatPoint, activeChatThread, forkChatPoint, addNewChatPoint, getChatPoint, deleteChatPointAndDescendants, deriveThread, updateChatPoint, subscribeToBus, chatPoints, userPromptInput } = getContextualStores(guid);
  
  const slashFunctions: Record<string, (c: string[]) => void> = {
    setThread: (args: string[]) => {
      console.log('setting thread:', args[0]);
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
      activeChatPointId.set('root');
      deleteChatPointAndDescendants(idToDelete);

      for (let i = 0, [cpId] = currentThreadIds[i]; i < currentThreadIds.length; i++) {
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
    // summarize: async (args: string[]) => {
    //   const cpId = args[0] || get(activeChatPointId);
    //   const cp = getChatPoint(cpId);
    //   if (!cp) {
    //     throw new Error(`tried to summarize nonexistent ChatPoint with id: ${cpId}`);
    //   }
    //   const cpText = chatPointToMarkdown(cp);
    //   const prompt = `Summarize the following exchange with 10 or fewer words. The summary must not excide 10 words
    // ===
    // ${cpText}`;

    //   const summary = await AI.prompt([{ role: ChatRole.USER, content: prompt }], 'awaited');
    //   updateChatPoint(cp.id, (cp: ChatPoint) => ({ ...cp, summary }));
    // },
    // summarizeThread: async (args: string[]) => {
    //   let [cpId, wordCount] = args;
    //   wordCount = wordCount || '100';
    //   cpId = cpId || get(activeChatPointId);
    //   const cp = getChatPoint(cpId);
    //   if (!cp) {
    //     throw new Error(`tried to summarize nonexistent thread with id: ${cpId}`);
    //   }
    //   activeChatPointId.set(cpId);

    //   const cpText = chatPointToMarkdown(cp);
    //   const prompt = `Summarize the following exchange with ${wordCount} or fewer words. The summary must not excide ${wordCount} words
    // ===
    // ${cpText}`;

    //   //sendMessage(BusEvent.ChatIntent, Context.Null, { content: prompt});

    //   const summary = await AI.prompt([{ role: ChatRole.USER, content: prompt }], 'awaited');
    //   const systemPrompt = `The following is a summary of our conversation so far.
    // ===
    // ${summary}`;

    //   const newCP = addNewChatPoint(systemPrompt, cpId, ChatRole.SYSTEM);
    //   activeChatPointId.set(newCP.id);

    // },
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



