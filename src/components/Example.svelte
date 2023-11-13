<script lang="ts">
  import TreeView from './TreeView.svelte';
  import MarkdownView from './MarkdownView.svelte';
  import ChatInput from './ChatInput.svelte';
  import { onMount } from 'svelte';

  import { transformToTree, type TreeData } from '../services/nested-list-builder';
  import {hierarchicalEntries} from '../testdata/tree';

  let tree_data: TreeData = [];

  const trans = hierarchicalEntries.map(i => ({
      id: i.id,
      parent: i.parent,
      name: i.name,
      children: [] as TreeData
  } ));    
    
    const treeRaw = transformToTree(trans , i => i.parent, i => i.name);
    tree_data = treeRaw;
  
  
  let textAreaContent: string = "";
  let chatInputComponent: ChatInput;

  function adjustTextareaHeight(): void {
    const minHeight = 100;
    const textAreaElement: HTMLTextAreaElement = chatInputComponent.getTextAreaElement();
    const maxHeight: number = window.innerHeight / 3;
    // textAreaElement.style.height = '0px'; // Reset height to recalculate
    const newHeight: number = Math.max(
      Math.min(textAreaElement.scrollHeight, maxHeight),
      minHeight);
    
    textAreaElement.style.height = `${newHeight}px`;
  }

  
  onMount(() => {
    const resizeObserver: ResizeObserver = new ResizeObserver(() => {
      adjustTextareaHeight();
    });

    // Assuming you want to observe changes to the chatInputComponent's parent
    resizeObserver.observe(chatInputComponent.$$.fragment as unknown as Element);

    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="flex h-full">
  <div class="w-1/3 xbg-gray-200 p-4 overflow-auto overflow-x-auto">
    <TreeView {tree_data}/>
  </div>
  <div class="flex flex-col w-2/3 min-w-[300px] xbg-gray-100">
    <MarkdownView />
    <ChatInput bind:this={chatInputComponent} {textAreaContent} {adjustTextareaHeight} />
  </div>
</div>

<style>
  /* Additional styles if necessary */

  /* following allows the ChatInput to stick to the bottom of the View */
  :host {
    display: block;
    height: calc(100vh - 30);
    overflow: hidden; /* Prevents scrolling outside the component */
  }
</style>