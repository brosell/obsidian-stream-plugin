type Formatter<T> = (item: T) => string;
type IdFn<T> = (item: T) => string;
type TtoString<T> = (item: T) => string;
export interface Item {
  id: string;
  previousId: string;
  [key: string]: any;
}

export interface HierarchyItem extends Omit<Item, 'previousId'> {
  children: HierarchyItem[];
}

export function buildHierarchy(items: Item[]): HierarchyItem[] {
  const itemsMap = new Map<string, HierarchyItem>();
  const rootItems: HierarchyItem[] = [];

  // Initialize items map with items without children
  items.forEach(item => {
    itemsMap.set(item.id, { ...item, children: [] });
  });

  // Build hierarchy
  items.forEach(item => {
    const currentItem = itemsMap.get(item.id);
    if (currentItem) {
      if (item.previousId === null || item.previousId === '') {
        rootItems.push(currentItem);
      } else {
        const parentItem = itemsMap.get(item.previousId);
        if (parentItem) {
          parentItem.children.push(currentItem);
        }
      }
    }
  });

  return rootItems;
}
