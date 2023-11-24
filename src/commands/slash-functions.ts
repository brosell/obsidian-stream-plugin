import { get } from "svelte/store";
import { addNewChatPoint, chatPoints, deleteChatPointAndDescendants, getChatPoint } from "../models/thread-repo";
import { BusEvent, bus, type Message } from "../services/bus";
import { activeChatPoint, activeChatPointId, activeChatThread, userPromptInput } from "../stores/stores";
import { ChatRole } from "../models/chat-point";

const slashFunctions: Record<string, (c: string[]) => void> = {
  setThread: (args: string[]) => {
    console.log('setting thread:', args[0]);
    const id = args[0];
    const cps = get(chatPoints);
    if (cps.find(sp => sp.id === id)) {
      activeChatPointId.set(id);
    }
  },
  addSystemPrompt: (args: string[]) => {
    const prompt = args.join(','); // just in case the prompt has commas which would have been used to split
    const pid = get(activeChatPointId);
    const cp = addNewChatPoint(prompt, pid, ChatRole.SYSTEM);
    activeChatPointId.set(cp.id);
  },
  deleteNode: (args: string[]) => {
    const idToDelete = args[0];
    if (!idToDelete || idToDelete === 'root') {
      return;
    }

    const currentThreadIds = [...get(activeChatThread).map(cp => cp.id)].reverse();
    activeChatPointId.set('root');
    deleteChatPointAndDescendants(idToDelete);
    
    for(let i = 0, [cpId] = currentThreadIds[i]; i < currentThreadIds.length; i++) {
      const cp = getChatPoint(currentThreadIds[i]);
      if (cp) {
        activeChatPointId.set(cp.id)
        break;
      }
    }
  },
  refine: (args: string[]) => {
    const curCP = get(activeChatPoint);
    const userPrompt = curCP?.completions.find(c => c.role === ChatRole.USER)?.content;
    if (!userPrompt) {
      return;
    }
    activeChatPointId.set(curCP.previousId);
    setTimeout(() => userPromptInput.set(userPrompt));
  }
}

const commands: Record<string, (m: Message) => void> = {
  [BusEvent.SlashFunction]: (message) => {
    const commandSpec = parseSlashCommand(message.details.content);
    if (!commandSpec) {
      return;
    }

    const { commandName, args} = commandSpec;
    console.log('/function:', commandName, 'args', args);
    
    if (commandName && slashFunctions[commandName]) {
      slashFunctions[commandName](args);
    }
  },
};

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


bus.subscribe( (message: Message) => {
  if (message && commands[message.event]) {
    commands[message.event](message);
  }
});