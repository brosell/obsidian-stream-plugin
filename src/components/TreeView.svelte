<script lang="ts">
  // https://maximmaeder.com/tree-view-with-svelte/

  import type { TreeData } from "../services/nested-list-builder";
  import ChatPointCard from "./ChatPointCard.svelte";
  export let tree_data: TreeData = [];

  function summaryKeyup(event: KeyboardEvent) {
      if (event.key ==  ' ' && document.activeElement!.tagName != 'SUMMARY') {
          event.preventDefault();
      }
  }

  function toggleExpand(e: any) {
    console.log('toggle expand', e);
    tree_data = [...tree_data, ({ name: 'hodor', children: []})];
  }
</script>

<div class="xnowrap">
  <ul>
    {#each tree_data as item, i}
        <li>
            {#if item.children}
              <details>
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <summary class="flex" on:keyup={summaryKeyup} >
                    <slot {item} list={tree_data} id={i}>
                      <ChatPointCard text={item.name} hasChildren={!!item.children.length} on:expand={toggleExpand} />
                    </slot>
                </summary>
            
                {#if item.children}
                    <div class="pl-8">
                        <svelte:self tree_data={item.children} let:item let:list={tree_data} let:id={i}>
                            <slot {item} list={tree_data} id={i}>
                              <ChatPointCard text={item.name} hasChildren={!!item.children.length}  />
                            </slot>
                        </svelte:self>
                    </div>
                {/if}
              </details>
            {:else}
                <slot {item} list={tree_data} id={i}>
                  {item.name}
                </slot>
            {/if}
        </li>
    {/each}
  </ul>
</div>
<style>
	ul {
		margin: 0;
		list-style: none;
		padding-left: 1.2rem; 
		user-select: none;
	}
  .nowrap {
    white-space: nowrap;
  }

	.no-arrow { padding-left: 1.0rem; }
	.arrow {
		cursor: pointer;
		display: inline-block;
		/* transition: transform 200ms; */
	}
	.arrowDown { transform: rotate(90deg); }
</style>
