<script lang="ts">
  import { getContextualStores } from "../stores/contextual-stores";
  import ChatPointCard from "./ChatPointCard.svelte";
  import type { ChatPoint } from "../models/chat-point";

  export let guid: string;

  const { activeChatThread, forkChatPoint, activeChatPointId, treeDisplay } = getContextualStores(guid);

  // isActive={!!$activeChatThread.find((cp: { id: any; }) => cp.id === chatPointDisplay.id)}
  //       onBranch={() => activeChatPointId.set(chatPointDisplay.id)}
  //       onFork={() => forkChatPoint(chatPointDisplay.id)}
</script>

<div class="nowrap">
  {#each $treeDisplay as chatPointDisplay}
    <div style="padding-left: {chatPointDisplay.depth}em;">
      <ChatPointCard 
        header={`${chatPointDisplay.id}: ${chatPointDisplay.summary??''}`} 
        text={chatPointDisplay.displayValue}
        
      />
    </div>
  {/each}
</div>

