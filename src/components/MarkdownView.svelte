<script lang="ts">
  import { afterUpdate } from "svelte";
  import { getContextualStores } from "../stores/contextual-stores";


  export let guid: string;

  const { renderedHtml } = getContextualStores(guid);

  afterUpdate(() => {
    const scrollHere = document.querySelector('.scroll-here');
    if (scrollHere) {
      setTimeout(() => { scrollHere.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, 100);
    }
  });

  $: {
    const t = $renderedHtml;
    console.log($renderedHtml.length);
    const scrollHere = document.querySelector('.scroll-here');
    if (scrollHere) {
      setTimeout(() => { scrollHere.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, 100);
    }

    const scrollHere2 = document.querySelector('.scroll-here2');
    if (scrollHere2) {
      setTimeout(() => { scrollHere2.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, 100);
    }
  }
</script>

<div class="flex-1 overflow-auto p-4">
  {@html $renderedHtml}
  <div class="scroll-here"></div>
</div>