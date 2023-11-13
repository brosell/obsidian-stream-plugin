interface HierarchicalEntry {
  id: string;
  parent: string;
  name: string;
  desc: string;
}

export const hierarchicalEntries: HierarchicalEntry[] = [
  // Level 1
  { id: 'id0', parent: '', desc: '', name: 'Root node description Root node description Root node description Root node description Root node description Root node description Root node description Root node description Root node description Root node description Root node description Root node description Root node description Root node description ' },
  
  // Level 2
  { id: 'id1', parent: 'id0', name: 'Child Level 2 a', desc: 'Child node description' },
  { id: 'id2', parent: 'id0', name: 'Child Level 2 b', desc: 'Child node description' },
  
  // Level 3
  { id: 'id3', parent: 'id1', name: 'Child Level 3 c ', desc: 'Child node description' },
  { id: 'id4', parent: 'id1', name: 'Child Level 3 d ', desc: 'Child node description' },
  { id: 'id5', parent: 'id2', name: 'Child Level 3 e', desc: 'Child node description' },
  { id: 'id6', parent: 'id2', name: 'Child Level 3 f', desc: 'Child node description' },
  
  // Level 4
  { id: 'id7', parent: 'id3', name: 'Child Level 4 g', desc: 'Child node description' },
  { id: 'id8', parent: 'id3', name: 'Child Level 4 h', desc: 'Child node description' },
  { id: 'id9', parent: 'id4', name: 'Child Level 4 i', desc: 'Child node description' },
  { id: 'id10', parent: 'id4', name: 'Child Level 4 j', desc: 'Child node description' },
  { id: 'id11', parent: 'id5', name: 'Child Level 4 k', desc: 'Child node description' },
  { id: 'id12', parent: 'id5', name: 'Child Level 4 l', desc: 'Child node description' },
  { id: 'id13', parent: 'id6', name: 'Child Level 4 m', desc: 'Child node description' },
  { id: 'id14', parent: 'id6', name: 'Child Level 4 n', desc: 'Child node description' },

  // Repeat the pattern
  { id: 'id15', parent: 'id0', name: 'Child Level 2 o', desc: 'Child node description' },
  { id: 'id16', parent: 'id0', name: 'Child Level 2 p', desc: 'Child node description' },
  // { id: 'id17', parent: 'id15', name: 'Child Level 3 q', desc: 'Child node description' },
  // { id: 'id18', parent: 'id15', name: 'Child Level 3 r', desc: 'Child node description' },
  { id: 'id19', parent: 'id16', name: 'Child Level 3 s', desc: 'Child node description' },
  { id: 'id20', parent: 'id16', name: 'Child Level 3 t', desc: 'Child node description' },
  { id: 'id21', parent: 'id17', name: 'Child Level 4 u', desc: 'Child node description' },
  { id: 'id22', parent: 'id17', name: 'Child Level 4 v', desc: 'Child node description' },
  { id: 'id23', parent: 'id18', name: 'Child Level 4 w', desc: 'Child node description' },
  { id: 'id24', parent: 'id18', name: 'Child Level 4 x', desc: 'Child node description' },
  { id: 'id25', parent: 'id19', name: 'Child Level 4 y', desc: 'Child node description' },
  { id: 'id26', parent: 'id19', name: 'Child Level 4 z', desc: 'Child node description' },
  { id: 'id27', parent: 'id20', name: 'Child Level 4 1', desc: 'Child node description' },
  { id: 'id28', parent: 'id20', name: 'Child Level 4 2', desc: 'Child node description' },
  { id: 'id29', parent: '', name: 'Root Level 1 3', desc: 'Root node description' },
];
