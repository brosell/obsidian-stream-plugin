import { derived, get } from "svelte/store";
import { marked } from 'marked';
import { activeChatThread, readyForInput } from './stores';


export const jsonMarkdown = derived(activeChatThread, t => `\`\`\`
${JSON.stringify(t.flatMap(c => c.getCompletions()), null, 2)}
\`\`\`
`);

export const markdown = derived(activeChatThread, t => {
  const rfi = get(readyForInput);

  const md = t.map(item => {
    const completionsMarkdown = item.getCompletions().map(completion => `**${completion.role}**: ${completion.content}`).join('\n\n');
    return `### ${item.id}\n${completionsMarkdown}`;
  }).join('\n\n');
  return `${md}\n\n---\n ${!rfi ? '==waiting for response...==' : ''}`;
});

export const renderedHtml = derived(markdown, markdown => marked(markdown));
