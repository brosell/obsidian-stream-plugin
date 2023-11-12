<script lang="ts">
    import { NestedListBuilder } from '../services/nested-list-builder';

    interface HierarchicalEntry {
  id: string;
  parent: string;
  name: string;
  desc: string;
}

const hierarchicalEntries: HierarchicalEntry[] = [
    // Level 1
    { id: 'id0', parent: '', name: 'Root Level 1', desc: 'Root node description' },
    
    // Level 2
    { id: 'id1', parent: 'id0', name: 'Child Level 2', desc: 'Child node description' },
    { id: 'id2', parent: 'id0', name: 'Child Level 2', desc: 'Child node description' },
    
    // Level 3
    { id: 'id3', parent: 'id1', name: 'Child Level 3', desc: 'Child node description' },
    { id: 'id4', parent: 'id1', name: 'Child Level 3', desc: 'Child node description' },
    { id: 'id5', parent: 'id2', name: 'Child Level 3', desc: 'Child node description' },
    { id: 'id6', parent: 'id2', name: 'Child Level 3', desc: 'Child node description' },
    
    // Level 4
    { id: 'id7', parent: 'id3', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id8', parent: 'id3', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id9', parent: 'id4', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id10', parent: 'id4', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id11', parent: 'id5', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id12', parent: 'id5', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id13', parent: 'id6', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id14', parent: 'id6', name: 'Child Level 4', desc: 'Child node description' },

    // Repeat the pattern
    { id: 'id15', parent: 'id0', name: 'Child Level 2', desc: 'Child node description' },
    { id: 'id16', parent: 'id0', name: 'Child Level 2', desc: 'Child node description' },
    { id: 'id17', parent: 'id15', name: 'Child Level 3', desc: 'Child node description' },
    { id: 'id18', parent: 'id15', name: 'Child Level 3', desc: 'Child node description' },
    { id: 'id19', parent: 'id16', name: 'Child Level 3', desc: 'Child node description' },
    { id: 'id20', parent: 'id16', name: 'Child Level 3', desc: 'Child node description' },
    { id: 'id21', parent: 'id17', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id22', parent: 'id17', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id23', parent: 'id18', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id24', parent: 'id18', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id25', parent: 'id19', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id26', parent: 'id19', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id27', parent: 'id20', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id28', parent: 'id20', name: 'Child Level 4', desc: 'Child node description' },
    { id: 'id29', parent: '', name: 'Root Level 1', desc: 'Root node description' },
  ];

  const builder = new NestedListBuilder(hierarchicalEntries, (i) => i.parent);
  let myList = builder.buildList('id0', (i) => `p: ${i.parent} id: ${i.id}`);

</script>

<div class="w-1/3 bg-gray-200 p-4 overflow-auto">
  <!-- Tree view content goes here -->
  {@html myList}
</div>