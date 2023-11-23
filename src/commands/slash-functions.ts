import { get } from "svelte/store";
import { chatPoints } from "../models/thread-repo";
import { BusEvent, bus, type Message } from "../services/bus";
import { activeChatPointId } from "../stores/stores";

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

const slashFunctions: Record<string, (c: string[]) => void> = {
  setThread: (args: string[]) => {
    console.log('setting thread:', args[0]);
    const id = args[0];
    const cps = get(chatPoints);
    if (cps.find(sp => sp.id === id)) {
      activeChatPointId.set(id);
    }
  }
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
  const args = argsString.split(',').map(arg => arg.trim()).filter(arg => arg.length);

  return { commandName, args };
}


bus.subscribe( (message: Message) => {
  if (message && commands[message.event]) {
    commands[message.event](message);
  }
});