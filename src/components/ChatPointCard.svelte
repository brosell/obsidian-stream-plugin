<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  
  export let text = 'Default Card Text';
  export let isActive = false;
  
  const handleIconClickBranch = () => {
    // Branch action
    console.log('branch');
  };

  const handleIconClickFork = () => {
    // Fork action
    console.log('fork');
  };

  const handleIconClickSummarize = () => {
    // Summarize action
    console.log('summarize');
  };

  function expandClicked() {
		// dispatch('expand', 'hi');
	}
</script>

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

  <div class="card {isActive?'active':''}">
    <p class="m-0">{@html text}</p>
    <div class="icon-row">
      <button on:click={handleIconClickBranch} title="Branch">
        ⤴️
      </button>
      <button on:click={handleIconClickFork} title="Fork">
        🔀
      </button>
      <button on:click={handleIconClickSummarize} title="Summarize">
        📋
      </button>
    </div>
  </div>
