<script lang='ts'>
  import { getContextualStores } from "../stores/contextual-stores";
  import { BusEvent, Context } from '../services/bus';
  import Select from 'svelte-select';
	
  export let header = 'header';
  export let text = 'Default Card Text';
  export let isActive = false;
  export let chatPointId: string;
  export let guid: string;

  const open = false; //isActive && text.indexOf('SYSTEM') === -1;
  
  const {sendMessage} = getContextualStores(guid);
  
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
    <details open={open}>
      <summary>
        <span style='font-weight:bold;font-style:italic;'>{@html header}</span>
        <div class="icon-row">
          <Select
            items={items}
            bind:value
            placeholder="Select an action"
            class="select"
          />
        </div>
      </summary>
      <p class="m-0">{@html text}</p>
      <div class="icon-row">
        <Select
          items={items}
          bind:value
          placeholder="Select an action"
          class="select"
        />
      </div>
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