<script lang="ts">
  import TreeView from './TreeView.svelte';
  import MarkdownView from './MarkdownView.svelte';
  import ChatInput from './ChatInput.svelte';
  import { onMount } from 'svelte';

  import { getContextualStores } from '../stores/contextual-stores';
  import ChatMap from './ChatMap.svelte';

  export let guid: string;
  export let viewParent: any;

  const { chatPoints, activeChatPointId } = getContextualStores(guid);
  chatPoints.subscribe(_ => {
    viewParent.requestSave();
  });
  activeChatPointId.subscribe(_ => {
    viewParent.requestSave();
  });
  

  let rightDiv: any;
  let rightDivInitialWidth: string;
  
  onMount(() => {
    rightDivInitialWidth = `${rightDiv.offsetWidth}px`;
    });

  let startX: number;
  let startWidth: number;
  let leftPanel: HTMLElement;

  function initResize(event: MouseEvent) {
    startX = event.clientX;
    startWidth = leftPanel.offsetWidth;
    window.addEventListener('mousemove', startResizing);
    window.addEventListener('mouseup', stopResizing);
  }

  function startResizing(event: MouseEvent) {
    const newWidth = startWidth + event.clientX - startX;
    leftPanel.style.width = `${newWidth}px`;
    leftPanel.style.minWidth = `${newWidth}px`;
  }

  function stopResizing(event: MouseEvent) {
    window.removeEventListener('mousemove', startResizing);
    window.removeEventListener('mouseup', stopResizing);
  }
  
</script>

<div class="flex h-full select-text">
  <div bind:this={leftPanel} class=" p-4 overflow-auto" style="width:50%;">
    <TreeView {guid} />
    <ChatMap {guid }/>
  </div>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="resizer" on:mousedown={initResize}></div>
  <div bind:this={rightDiv} class="flex flex-col p-4" style="flex-grow:1; min-width:300px; width:{rightDivInitialWidth}">
    <MarkdownView {guid} />
    <ChatInput {guid} />
    <!-- <ChatMap {guid }/> -->
  </div>
</div>

<style>
  /* Additional styles if necessary */
  #resizer {
    background: #ccc;
    width: 5px;
    min-width: 5px;
    cursor: ew-resize;
  }
  /* following allows the ChatInput to stick to the bottom of the View */
  :host {
    display: block;
    height: calc(100vh - 30);
    overflow: hidden; /* Prevents scrolling outside the component */
  }
</style>