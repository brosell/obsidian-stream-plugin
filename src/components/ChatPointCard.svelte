<script lang='ts'>
  import { getContextualStores } from "../stores/contextual-stores";
  import { BusEvent, Context } from '../services/bus';
  import Select from 'svelte-select';
  import type { ChatPointDisplay } from "../services/nested-list-builder";
  import type { ChatPoint } from "../models/chat-point";
  import { onMount } from "svelte";
  
  export let chatPointId: string;
  export let guid: string;

  export let chatPointDisplay: ChatPointDisplay;
  export let activeChatThread: ChatPoint[] = [];
  export let showChrome: boolean = true;
  export let showOpen: boolean = false;

  let isActive: boolean = false;
  $: {
    isActive = !activeChatThread || !!activeChatThread.find(cp => cp.id === chatPointDisplay.id);
  }

  let header: string = '';
  $: {
    header = `${chatPointDisplay.id}: ${chatPointDisplay.chatPoint.summary??''}`;
  }
  let updateChatPoint: (chatPointId: string, updater: (chatPoint: ChatPoint) => ChatPoint) => ChatPoint;
  $: {
    updateChatPoint = getContextualStores(guid).updateChatPoint;
  }

  const open = false; //isActive && text.indexOf('SYSTEM') === -1;
  
  const {sendMessage, readyForInput, activeChatPointId, streamedCount} = getContextualStores(guid);
  
  $: isCurrentCard = $activeChatPointId === chatPointDisplay.id;

  const menu: Record<string, () => void> = {
    Branch: () => {
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/setThread(${chatPointId})`});
    },
    Fork: () => {
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/fork(${chatPointId})`});
    },
    "Summarize This": () => {
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/summarize(${chatPointId})`});
    },
    "Summarize the Thread": () => {
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/summarizeThread(${chatPointId})`});
    },
  };

  let selected: boolean = false;
  const toggleSelected = () => {
    console.log('toggleSelected', selected);
    selected = !selected;
    updateChatPoint(chatPointDisplay.id, (cp) => ({
      ...cp, selected
    }));
  };

  onMount(() => {
    selected = chatPointDisplay.chatPoint.selected ?? false;
  });

	let items = Object.keys(menu);
	let value: any = null;
  $: {
    if (value) {
      console.log(value);
      menu[value.value]();
      value = null;
    }
  }


</script>

  <div class="card {isActive?'active':''}">
    <details open={showOpen}>
      <summary>
        {#if (showChrome)}
          <input type="checkbox" checked={selected} on:change={toggleSelected} />
        {/if}
        <span style='font-weight:bold;font-style:italic;'>{@html header}</span>
        {#if (showChrome)}
          <div class="icon-row">
            <Select
              items={items}
              bind:value
              placeholder="Select an action"
              class="select"
            />
          </div>
        {/if}
      </summary>
      <p class="m-0">{@html chatPointDisplay.displayValue}</p>
      {#if isCurrentCard && !$readyForInput}
        <div class="width-full bg-blue-200">==waiting for response== {$streamedCount}</div>
      {/if}
      {#if (showChrome)}
        <div class="icon-row">
          <Select
            items={items}
            bind:value
            placeholder="Select an action"
            class="select"
          />
        </div>
      {/if}
    </details>
  </div>


  <style>
    .card {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 4px;
      margin-bottom: 8px;
      min-width: 350px;
      /* max-width: 600px; */
      /* box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2); */
    }
    .active {
      background-color: beige;
      color: #000000d6;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    }
    .icon-row {
      display: flex;
      justify-content: right;
      margin-top: 16px;
    }
    button {
      border: none;
      background: none;
      cursor: pointer;
      font-size: 16px;
      margin-right: 4px;
    }
  </style>