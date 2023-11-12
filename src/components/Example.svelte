<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  const markdownContent = writable("# Markdown Title\n\nSome content here...");
  let textAreaContent = "";
  /**
   * @type {Element}
   */
  let secondColumn;

  // Adjust textarea height based on content until it reaches 1/3 of the window height
  /**
   * @param {EventTarget | null} target
   */
  function adjustTextareaHeight(target) {
    if (!target) throw new Error('blarg');
    const maxHeight = window.innerHeight / 3;
    target.style.height = '0px'; // Reset height to recalculate
    const newHeight = Math.min(target.scrollHeight, maxHeight);
    target.style.height = `${newHeight}px`;
  }

  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // Assuming textarea is the first child of the observed element
        adjustTextareaHeight(entry.target.firstChild);
      }
    });

    if (secondColumn) {
      resizeObserver.observe(secondColumn);
    }

    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="flex h-full">
  <!-- First Column: Tree View -->
  <div class="w-1/3 bg-gray-200 p-4 overflow-auto">
    <!-- Tree view content goes here -->
    <p>Tree View</p>
  </div>

  <!-- Second Column -->
  <div bind:this={secondColumn} class="flex flex-col w-2/3 min-w-[300px] bg-gray-100">
    <!-- Markdown Document -->
    <div class="flex-1 overflow-auto p-4">
      <p>Markdown Document</p>
      <!-- Render markdown content here -->
      {textAreaContent}
    </div>

    <!-- Textarea -->
    <textarea
      class="w-full p-2 border-t border-gray-300 resize-none"
      placeholder="Enter your text..."
      bind:value={textAreaContent}
      on:input={event => adjustTextareaHeight(event.target)}
      style="max-height: 33%;"></textarea>
  </div>
</div>

<style>
  /* Additional styles if necessary */
  :host {
    display: block;
    height: calc(100vh - 30);
    overflow: hidden; /* Prevents scrolling outside the component */
  }
</style>