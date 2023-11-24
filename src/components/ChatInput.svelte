<script lang="ts">
  import { onMount } from 'svelte';
  import { BusEvent, Context, sendMessage } from '../services/bus';
  import { userPromptInput, readyForInput } from '../stores/stores';
  import { isSlashCommandFormat } from '../commands/slash-functions';
   
  export let adjustTextareaHeight: () => void;

  let p = $userPromptInput

  let textArea: HTMLTextAreaElement;

  onMount(() => {
    adjustTextareaHeight();
  });

  function callAdjustTextareaHeight(): void {
    adjustTextareaHeight();
  }

  function handleKeyPress(e: KeyboardEvent): void {
    if (e.key === "Enter" && e.shiftKey) {
      const trimmed = $userPromptInput.trim();
      if ($readyForInput) {
        if (isSlashCommandFormat(trimmed)) {
          sendMessage(BusEvent.SlashFunction, Context.Null, { content: trimmed});
        }
        else {
          sendMessage(BusEvent.ChatIntent, Context.Null, { content: trimmed});
        }
        userPromptInput.set('');
      }
      e.preventDefault();
    }
  }

  export function getTextAreaElement(): HTMLTextAreaElement {
    return textArea;
  }

</script>

<textarea
  bind:this={textArea}
  class="w-full p-2 border-t border-gray-300 resize-y"
  placeholder="Enter your prompt..."
  bind:value={$userPromptInput}
  on:input={callAdjustTextareaHeight}
  on:keypress={handleKeyPress}
  style="max-height: 33%;" 
/>
