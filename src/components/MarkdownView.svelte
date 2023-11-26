<script lang="ts">
  import { getContextualStores } from "../stores/contextual-stores";


    export let guid: string;

    const { renderedHtml } = getContextualStores(guid);
</script>

<div class="flex-1 overflow-auto p-4">
  {@html $renderedHtml}
</div>