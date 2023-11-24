<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  
  export let header = 'header';
  export let text = 'Default Card Text';
  export let isActive = false;
  
  export let onBranch = () => {
    // Branch action
    console.log('branch');
  };

  export let onFork = () => {
    // Fork action
    console.log('fork');
  };

  export let onSummarize = () => {
    // Summarize action
    console.log('summarize');
  };

</script>

  <div class="card {isActive?'active':''}">
    <details open={isActive}>
      <summary>
        <span style='font-weight:bold;font-style:italic;'>{@html header}</span>
      </summary>
      <p class="m-0">{@html text}</p>
      <div class="icon-row">
        <button on:click={onBranch} title="Branch">
          ⤴️
        </button>
        <button on:click={onFork} title="Fork">
          🔀
        </button>
        <button on:click={onSummarize} title="Summarize">
          📋
        </button>
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
      max-width: 350px;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    }
    .active {
      background-color: darkblue;
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