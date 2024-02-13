<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  type Option = {
      label: string;
      fn: () => void;
  };

  export let options: Option[] = [];
  export let direction = "down"; // "up" or "down"
  export let justify = "left"; // "left" or "right"

  let menuVisible = false;
  let menuStyle = "";
  let button: any;

  const dispatch = createEventDispatcher();

  // Calculate menu style based on direction and justify props
  const calculateMenuStyle = () => {
      const { top, left, width, height } = button.getBoundingClientRect();
      const style = [`position: absolute;`];
      if (direction === 'down') {
          style.push(`top: ${(top + height) - 40}px;`);
      } else {
          style.push(`bottom: ${window.innerHeight - top}px;`);
      }

      if (justify === 'left') {
          style.push(`left: ${left - width}px;`);
      } else {
          style.push(`right: ${window.innerWidth - left - width}px;`);
      }

      menuStyle = style.join(' ');
  };

  // Toggle the visibility of the menu
  const toggleMenu = () => {
      menuVisible = !menuVisible;
      if(menuVisible) {
          calculateMenuStyle();
      }
  };

  const handleClickOutside = (event: any) => {
      if (!button.contains(event.target)) {
          menuVisible = false;
      }
  };

  onMount(() => {
      window.addEventListener('click', handleClickOutside);
  });

  // Clean up
  onDestroy(() => {
      window.removeEventListener('click', handleClickOutside);
  });

  function executeOption(fn: ()=>void) {
      fn();
      menuVisible = false; // Hide menu after action
  }
</script>

<button bind:this={button} on:click|stopPropagation={toggleMenu}>
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="2"/>
      <circle cx="12" cy="5" r="2"/>
      <circle cx="12" cy="19" r="2"/>
  </svg>
</button>

{#if menuVisible}
<div class="menu" style={menuStyle}>
  {#each options as {label, fn}}
      <button on:click={() => executeOption(fn)}>{label}</button>
  {/each}
</div>
{/if}

<style>
  button {
        display: flex;
        justify-content: left;
        align-items: left;
        width: 100%;
        padding: 10px;
        border: none;
        background-color: transparent;
        text-align: left;
        cursor: pointer; /* Added for better UX */
    }
    button:hover {
        background-color: #f0f0f0;
    }

    .menu {
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
    }
</style>
