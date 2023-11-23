import { BusEvent, bus, type Message } from "../services/bus";

const commands: Record<string, (m: Message) => void> = {
  [BusEvent.SlashFunction]: (message) => {
    const commandSpec = parseSlashCommand(message.details.content);
    if (!commandSpec) {
      return;
    }

    const { commandName, args} = commandSpec;
  },
}

function isSlashCommandFormat(input: string): boolean {
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