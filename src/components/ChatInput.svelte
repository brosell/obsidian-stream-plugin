<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { BusEvent, Context, type Message } from '../services/bus';
  import { isSlashCommandFormat } from '../commands/slash-functions';
  import { getContextualStores } from '../stores/contextual-stores';
   

  export let guid: string;
  const { userPromptInput, readyForInput, sendMessage, bus } = getContextualStores(guid);
  
  let textArea: HTMLTextAreaElement;

  onMount(() => {
    adjustTextareaHeight();
  });

  afterUpdate(() => {
    const el = getTextAreaElement()
      if (el) {
        setTimeout(() => {
          //el.scrollIntoView({ behavior: 'smooth', block: 'end' });
          el.focus();
        },100);
      }
  });

  function adjustTextareaHeight(): void {
    const minHeight = 100;
    const textAreaElement: HTMLTextAreaElement = textArea;
    if (textArea) {
    const maxHeight: number = window.innerHeight / 3;
    const newHeight: number = Math.max(
      Math.min(textAreaElement.scrollHeight, maxHeight),
      minHeight);
    
    textAreaElement.style.height = `${newHeight}px`;
    }
  }

  function callAdjustTextareaHeight(): void {
    adjustTextareaHeight();
  }

  

  function handleKeyPress(e: KeyboardEvent): void {
    if (e.key === "Enter" && e.shiftKey) {
      const trimmed = $userPromptInput.trim();
      if ($readyForInput) {
        if (isSlashCommandFormat(trimmed)) {
          sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: trimmed});
        }
        else {
          sendMessage(BusEvent.ChatIntent, { ...Context.Null, guid } , { content: trimmed});
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
