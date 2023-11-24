<script lang="ts">
  import { activeChatPointId, treeDisplay } from "../stores/stores";
  import ChatPointCard from "./ChatPointCard.svelte";
  import { activeChatThread } from '../stores/stores'
  import { forkChatPoint } from "../models/thread-repo";
</script>

<div class="nowrap">
  {#each $treeDisplay as chatPointDisplay}
    <div style="padding-left: {chatPointDisplay.depth}em;">
      <ChatPointCard 
        header={`Id: ${chatPointDisplay.id}`} 
        text={chatPointDisplay.displayValue}
        isActive={!!$activeChatThread.find(cp => cp.id === chatPointDisplay.id)}
        onBranch={() => activeChatPointId.set(chatPointDisplay.id)}
        onFork={() => forkChatPoint(chatPointDisplay.id)}
      />
    </div>
  {/each}
</div>

