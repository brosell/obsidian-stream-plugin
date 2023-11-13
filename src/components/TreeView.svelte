<script lang="ts">
  // https://maximmaeder.com/tree-view-with-svelte/

  import type { TreeData } from "../services/nested-list-builder";
  export let tree_data: TreeData = [];

  function summaryKeyup(event: KeyboardEvent) {
      if (event.key ==  ' ' && document.activeElement!.tagName != 'SUMMARY') {
          event.preventDefault();
      }
  }
</script>


  <ul>
    {#each tree_data as item, i}
        <li>
            {#if item.children?.length}
              <details>
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <summary class="flex" on:keyup={summaryKeyup} >
                    <slot {item} list={tree_data} id={i}>
                      <span class="arrow" >&#x25b6</span>{item.name}
                    </slot>
                </summary>
            
                {#if item.children?.length}
                    <div class="pl-8">
                        <svelte:self tree_data={item.children} let:item let:list={tree_data} let:id={i}>
                            <slot {item} list={tree_data} id={i}>
                              <span class="arrow" >&#x25b6</span>{ item.name }
                            </slot>
                        </svelte:self>
                    </div>
                {/if}
              </details>
            {:else}
                <slot {item} list={tree_data} id={i}>
                  <span class="no-arrow">{item.name}</span>
                </slot>
            {/if}
        </li>
    {/each}
</ul>

<style>
	ul {
		margin: 0;
		list-style: none;
		padding-left: 1.2rem; 
		user-select: none;
   
	}
  
	.no-arrow { padding-left: 1.0rem; }
	.arrow {
		cursor: pointer;
		display: inline-block;
		/* transition: transform 200ms; */
	}
	.arrowDown { transform: rotate(90deg); }
</style>
