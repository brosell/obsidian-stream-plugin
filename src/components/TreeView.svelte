<script lang="ts">
  import { ItemView } from "obsidian";
  import type { HierarchyItem } from "../services/nested-list-builder";
  import { chat, tree } from "../stores/stores";

  // https://maximmaeder.com/tree-view-with-svelte/

  import ChatPointCard from "./ChatPointCard.svelte";
  import { chatPointToHtml, chatPointToMarkdown } from "../stores/render-markdown";
  export let tree_data: HierarchyItem[] = $tree;

  function summaryKeyup(event: KeyboardEvent) {
      if (event.key ==  ' ' && document.activeElement!.tagName != 'SUMMARY') {
          event.preventDefault();
      }
  }

  function toggleExpand(e: any) {
    console.log('toggle expand', e);
    tree_data = [...tree_data, ({ name: 'hodor', children: []})];
  }

  
</script>

<div class="xnowrap">
  <ul>
{#each $chat as item}
  <li>{@html chatPointToHtml(item)}</li>
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
