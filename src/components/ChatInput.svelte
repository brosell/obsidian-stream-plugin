<script lang="ts">
  import { onMount } from 'svelte';
  import { markdown } from '../stores';
  

  export let textAreaContent: string;
  export let adjustTextareaHeight: () => void;

  let textArea: HTMLTextAreaElement;

  onMount(() => {
    adjustTextareaHeight();
  });

  function callAdjustTextareaHeight(): void {
    adjustTextareaHeight();
  }

  function handleKeyPress(e: KeyboardEvent): void {
    if (e.key === "Enter" && e.shiftKey) {
      console.log('keypress', 'submit the chat!!!')
      // markdown.set(textAreaContent);
      textAreaContent = "";
      e.preventDefault();
    }
  }

  export function getTextAreaElement(): HTMLTextAreaElement {
    return textArea;
  }

</script>

<textarea
  bind:this={textArea}
  class="w-full p-2 border-t border-gray-300 resize-none"
  placeholder="Enter your text..."
  bind:value={textAreaContent}
  on:input={callAdjustTextareaHeight}
  on:keypress={handleKeyPress}
  style="max-height: 33%;" />
