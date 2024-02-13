<script lang="ts">
  import { getContextualStores } from "../stores/contextual-stores";
  import ChatPointCard from "./ChatPointCard.svelte";
  import { afterUpdate } from "svelte";

  export let guid: string;

  const { activeChatThread, activeChatPointId, treeDisplay } = getContextualStores(guid);


  const scrollToBottom = (smooth: boolean) => {
    setTimeout(() => { 
        const scrollHere = document.querySelector('.scroll-here-tree');
        if (scrollHere) {
          scrollHere.scrollIntoView({ behavior: smooth?'smooth':'instant', block: 'end' }) 
        }
      }, 100);
  };

  afterUpdate(() => {
    scrollToBottom(false);
  });

  $: { // side-effect only
    const t = $treeDisplay;
    scrollToBottom(true);
  }
</script>

<div class="nowrap">
  {#each $treeDisplay as chatPointDisplay}
    <div style="padding-left: {chatPointDisplay.depth}em;">
      <ChatPointCard {guid}
        chatPointId={chatPointDisplay.id}
        chatPointDisplay={chatPointDisplay}
        activeChatThread={$activeChatThread}
        showCheckbox={true}
        showFooterActions={true}
      />
    </div>
    {#if $activeChatPointId === chatPointDisplay.id}
      <div class="scroll-here-tree" />
    {/if}
  {/each}
</div>

