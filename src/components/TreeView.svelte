<script lang="ts">
  import { getContextualStores } from "../stores/contextual-stores";
  import ChatPointCard from "./ChatPointCard.svelte";
  import type { ChatPoint } from "../models/chat-point";

  export let guid: string;

  const { activeChatThread, activeChatPointId, treeDisplay } = getContextualStores(guid);

  // 
  //       onBranch={() => activeChatPointId.set(chatPointDisplay.id)}
  //       onFork={() => forkChatPoint(chatPointDisplay.id)}


</script>

<div class="nowrap">
  {#each $treeDisplay as chatPointDisplay}
    <div style="padding-left: {chatPointDisplay.depth}em;">
      <ChatPointCard 
        header={`${chatPointDisplay.id}: ${chatPointDisplay.summary??''}`} 
        text={chatPointDisplay.displayValue}
        isActive={!!$activeChatThread.some(cp => cp.id === chatPointDisplay.id)}
      />
    </div>
  {/each}
</div>

