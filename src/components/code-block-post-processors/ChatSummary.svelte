<script lang="ts">
    import type { TFile } from "obsidian";
    import { ContextualStores, getContextualStores, type IObsidian } from "../../stores/contextual-stores";
    import { beforeUpdate, onMount } from "svelte";
    import type { ChatPoint } from "../../models/chat-point";

  export let details: Record<string, string>;
  export let note: TFile;
  export let storeGuid: string;

  const nullChatPoint = {
    id: 'n/a',
    summary: 'n/a'
  } as ChatPoint;

  let chatPoint: ChatPoint = nullChatPoint;

  let stores: ContextualStores; 
  let app: IObsidian;

  const update = async () => {
    if (app) {
      const noteString = await app.vault?.cachedRead(note) ?? '';
      stores.loadChatPoints(noteString);
      chatPoint = stores.getChatPoint(details.chatId) || nullChatPoint;
    }
  }

  onMount(async () => {
    stores = getContextualStores(storeGuid);
    app = stores.obsidian.getValue();
    update();
  });

  beforeUpdate(async () => {
    update();
  })
  
    
  
  // function changeChatId()
  
</script>

<div class="custom-ui">
  <!-- Your custom Svelte UI logic here -->
  <h4>[[{note.basename}]]</h4>
  <h5>{chatPoint.id} - {chatPoint.summary}</h5>
  <!-- pre>
    <code>
{JSON.stringify(details, null, 2)}
    </code>
  </pre -->
  <button on:click={() => details.chatId = (Number(details.chatId) + 1).toString() }>Inc</button>
</div>