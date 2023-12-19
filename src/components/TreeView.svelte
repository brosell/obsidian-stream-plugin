<script lang="ts">
  import { getContextualStores } from "../stores/contextual-stores";
  import ChatPointCard from "./ChatPointCard.svelte";
  import ChatInput from './ChatInput.svelte';

  export let guid: string;

  const { activeChatThread, activeChatPointId, treeDisplay } = getContextualStores(guid);

</script>

<div class="nowrap">
  {#each $treeDisplay as chatPointDisplay}
    <div style="padding-left: {chatPointDisplay.depth}em;">
      <ChatPointCard {guid}
        chatPointId={chatPointDisplay.id}
        header={`${chatPointDisplay.id}: ${chatPointDisplay.summary??''}`} 
        text={chatPointDisplay.displayValue}
        isActive={$activeChatPointId === chatPointDisplay.id}
      />
      {#if $activeChatPointId === chatPointDisplay.id}
          <!-- <ChatInput {guid} /> -->
          <div class="scroll-here2"></div>
      {/if}
    </div>
  {/each}
</div>

