<script lang="ts">
  import { afterUpdate } from "svelte";
  import { getContextualStores } from "../stores/contextual-stores";
  import ChatPointCard from "./ChatPointCard.svelte";


  export let guid: string;

  const { chatDisplay } = getContextualStores(guid);

  const scrollToBottom = (smooth: boolean) => {
    setTimeout(() => { 
        const scrollHere = document.querySelector('.scroll-here-chat');
        if (scrollHere) {
          scrollHere.scrollIntoView({ behavior: smooth?'smooth':'instant', block: 'end' }) 
        }
      }, 100);
  };

  afterUpdate(() => {
    scrollToBottom(false);
  });

  $: { // side-effect only
    const t = $chatDisplay;
    scrollToBottom(true);
    
  }
</script>

<div class="flex-1 overflow-auto p-4">
  <div class="nowrap">
    {#each $chatDisplay as chatPointDisplay}
      <div style="padding-left: 0em;">
        <ChatPointCard {guid}
          chatPointId={chatPointDisplay.id}
          chatPointDisplay={chatPointDisplay}
          showHeaderActions={true}
          showFooterActions={false}
          showOpen={true}
        />
      </div>
    {/each}
  </div>
  <div class="scroll-here-chat"></div>
</div>