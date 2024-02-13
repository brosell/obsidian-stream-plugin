<script lang='ts'>
  import { getContextualStores } from "../stores/contextual-stores";
  import { BusEvent, Context } from '../services/bus';
  import Select from 'svelte-select';
  import type { ChatPointDisplay } from "../services/nested-list-builder";
  import type { ChatPoint } from "../models/chat-point";
  // import type { ThreeDotMenu } from "./ThreeDotMenu.svelte";
  import { onMount } from "svelte";
  import { incrementingStore } from "../stores/counter";
  import ThreeDotMenu from "./ThreeDotMenu.svelte";
  
  export let chatPointId: string;
  export let guid: string;

  export let chatPointDisplay: ChatPointDisplay;
  export let activeChatThread: ChatPoint[] = [];
  export let showActions: boolean = true;
  export let showCheckbox: boolean = false;
  export let showOpen: boolean = false;

  const {sendMessage, readyForInput, activeChatPointId, streamedCount} = getContextualStores(guid);
  
  const spinner = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
  $: spinnerDisplay = spinner[$incrementingStore % spinner.length];
  
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
  
  
  $: isCurrentCard = $activeChatPointId === chatPointDisplay.id;

  const menu: Record<string, () => void> = {
    
    "⤴️ Branch": () => {
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/setThread(${chatPointId})`});
    },
    "🔀 Fork": () => {
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/fork(${chatPointId})`});
    },
    "📋 Summarize": () => {
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/summarize(${chatPointId})`});
    },
    SummarizeThread: () => {
      sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, { content: `/summarizeThread(${chatPointId})`});
    },
  };

  const menuOptions = Object.keys(menu).map(key => ({ label: key, fn: menu[key] }));

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

  // let menuOpen = false;

  // const toggleMenu = (event: MouseEvent) => {
  //   event.stopPropagation();
  //   event.preventDefault();
  //   menuOpen = !menuOpen;
  // };

</script>

  <div class="card {isActive?'active':''}">
    <details open={showOpen}>
      <summary>
        {#if (showCheckbox)}
          <input type="checkbox" checked={selected} on:change={toggleSelected} />
        {/if}
        <span style='font-weight:bold;font-style:italic;'>{@html header}</span>
        {#if (showActions)}
        <span class="icon-row">
          <ThreeDotMenu justify="right" direction="down" options={menuOptions}></ThreeDotMenu>
        </span>
        {/if}
      </summary>
      <p class="m-0">{@html chatPointDisplay.displayValue}</p>
      {#if isCurrentCard && !$readyForInput}
        <div class="width-full bg-blue-200">==waiting for response== {spinnerDisplay}</div>
      {/if}
      {#if (showActions)}
      <span class="icon-row bottom">
        <ThreeDotMenu justify="left" direction="up" options={menuOptions}></ThreeDotMenu>
      </span>
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
    summary {
    display: flex;
    justify-content: space-between;
    align-items: start;
  }
  .icon-row {
    display: flex;
    gap: 4px;
  }

  .icon-row.bottom {
    justify-content: flex-start;
    width:min-content;
  }
  
  </style>