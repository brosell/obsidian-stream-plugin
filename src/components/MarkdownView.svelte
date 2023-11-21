<script lang="ts">
    import { renderedHtml } from '../stores/render-markdown';
</script>

<div class="flex-1 overflow-auto p-4">
  {@html $renderedHtml}
</div>