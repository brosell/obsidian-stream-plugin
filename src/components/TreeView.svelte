<script lang="ts">
  import { treeDisplay } from "../stores/stores";
  import ChatPointCard from "./ChatPointCard.svelte";

</script>

<div class="nowrap">
  {#each $treeDisplay as chatPointDisplay}
    <div style="padding-left: {chatPointDisplay.depth}em">
      <ChatPointCard text={chatPointDisplay.displayValue} />
    </div>
  {/each}
</div>
<style>
	ul {
		margin: 0;
		list-style: none;
		padding-left: 1.2rem; 
		user-select: none;
	}
</style>
