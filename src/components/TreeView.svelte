<script lang="ts">
  import { getContextualStores } from "../stores/contextual-stores";
  import ChatPointCard from "./ChatPointCard.svelte";
  import ChatInput from './ChatInput.svelte';
  import type { ChatPoint } from "../models/chat-point";

  export let guid: string;

  const { activeChatThread, activeChatPointId, treeDisplay } = getContextualStores(guid);

  // 
  //       onBranch={() => activeChatPointId.set(chatPointDisplay.id)}
  //       onFork={() => forkChatPoint(chatPointDisplay.id)}
  let chatInputComponent: ChatInput;

  function adjustTextareaHeight(): void {
    const minHeight = 100;
    const textAreaElement: HTMLTextAreaElement = chatInputComponent.getTextAreaElement();
    const maxHeight: number = window.innerHeight / 3;
    const newHeight: number = Math.max(
      Math.min(textAreaElement.scrollHeight, maxHeight),
      minHeight);
    
    textAreaElement.style.height = `${newHeight}px`;
  }
</script>

<div class="nowrap">
  {#each $treeDisplay as chatPointDisplay}
    <div style="padding-left: {chatPointDisplay.depth}em;">
      <ChatPointCard {guid}
        chatPointId={chatPointDisplay.id}
        header={`${chatPointDisplay.id}: ${chatPointDisplay.summary??''}`} 
        text={chatPointDisplay.displayValue}
        isActive={!!$activeChatThread.some(cp => cp.id === chatPointDisplay.id)}
      />
      {#if $activeChatPointId === chatPointDisplay.id}
          <ChatInput {guid} bind:this={chatInputComponent} {adjustTextareaHeight} />
      {/if}
    </div>
  {/each}
</div>

