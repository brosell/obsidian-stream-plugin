<script lang="ts">
  import { onMount } from 'svelte';
  import { markdown } from '../stores';

  export let textAreaContent: string;
  export let adjustTextareaHeight: () => void;

  let textArea: HTMLTextAreaElement;

  onMount(() => {
    adjustTextareaHeight();
  });
</script>

<textarea
  bind:this={textArea}
  class="w-full p-2 border-t border-gray-300 resize-none"
  placeholder="Enter your text..."
  bind:value={textAreaContent}
  on:input={() => {  markdown.set(textAreaContent); return adjustTextareaHeight(); } }
  style="max-height: 33%;" />
