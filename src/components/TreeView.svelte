<script lang="ts">
  import type { HierarchyItem } from "../services/nested-list-builder";

  // https://maximmaeder.com/tree-view-with-svelte/

  import { chatPointToHtml } from "../stores/render-markdown";
  import { chatPoints } from "../models/thread-repo";
  import { treeDisplay } from "../stores/stores";

</script>

<div class="xnowrap">
  <ul>
{#each $treeDisplay as item}
  <li>{@html '&nbsp'.repeat(item.depth)} {item.displayValue}</li>
{/each}
</ul>
</div>
<style>
	ul {
		margin: 0;
		list-style: none;
		padding-left: 1.2rem; 
		user-select: none;
	}
</style>
