<script lang="ts">
  import TreeView from './TreeView.svelte';
  import MarkdownView from './ChatView.svelte';
  import ChatInput from './ChatInput.svelte';
  import { onMount } from 'svelte';

  import { getContextualStores } from '../stores/contextual-stores';
  import ChatMap from './ChatMap.svelte';
  import { Platform } from 'obsidian';

  export let guid: string;
  export let viewParent: any;

  const { chatPoints, activeChatPointId, selectedChatPoints } = getContextualStores(guid);
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
  
  function nada(event: any) {
    console.log('nada', event);
  }

  let isTreeViewVisible = true;
  
  function toggleTreeView() {
    isTreeViewVisible = !isTreeViewVisible;
  }


let leftPanelState = 'normal'; // possible values: 'normal', 'minimized', 'maximized'

function toggleLeftPanel() {
  if (leftPanelState === 'normal') {
    leftPanelState = 'maximized';
  } else if (leftPanelState === 'maximized') {
    leftPanelState = 'minimized';
  } else {
    leftPanelState = 'normal';
  }
}
</script>

<div class="flex h-full select-text">
  <div bind:this={leftPanel} 
       class="p-4 overflow-auto"
       style={`position: relative; display: flex; flex-direction: column; min-width:${leftPanelState === 'minimized' ? '50px' : 'unset'}; width:${leftPanelState === 'minimized' ? '50px' : leftPanelState === 'maximized' ? '100%' : '50%'}`}>

    {#if (Platform.isMobile) }
    <button on:click={toggleLeftPanel} style="position:absolute; top: 0; right: 0;">Toggle Left Panel</button>
    {/if}

    {#if leftPanelState !== 'minimized'}
      <MarkdownView {guid} />
      <ChatInput {guid} />
    {/if}
    
  </div>

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  
    <div id="resizer" on:mousedown={initResize}></div>

    <div bind:this={rightDiv} class="flex flex-col p-4" style="flex-grow:1; min-width:300px; width:{rightDivInitialWidth}">
        <div class="flex-auto" style="height: 100%;">
          <button on:click={toggleTreeView}>{isTreeViewVisible ? 'Show Map' : 'Show Tree'}</button>

        {#if isTreeViewVisible}
          <div class="flex-auto" style="height: 100%;">
            <TreeView {guid}/>
          </div>
        {/if}

        {#if !isTreeViewVisible}
          <div class="flex-auto" style="height: 100%;">
            <ChatMap {guid}/>
          </div>
        {/if}
        </div>
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