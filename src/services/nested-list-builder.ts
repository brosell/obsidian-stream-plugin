import type { ChatPoint } from "../models/chat-point";
import { errorBus } from "./bus";

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

export interface ChatPointDisplay {
  id: string;
  depth: number;
  displayValue: string;
  chatPoint: ChatPoint;
}

export function prepareChatPointsForDisplay(
  chatPoints: ChatPoint[],
  getDisplayValue: (chatPoint: ChatPoint) => string
): ChatPointDisplay[] {
  const chatPointMap = new Map<string, ChatPoint>();
  chatPoints.forEach((chatPoint) => {
    chatPointMap.set(chatPoint.id, chatPoint);
  });

  const findRoots = () => chatPoints.filter((cp) => !cp.previousId);

  const computeDepth = (chatPoint: ChatPoint): number => {
    let depth = 0;
    let current = chatPoint;
    while (current.previousId) {
      if (chatPointMap.has(current.previousId)) {
        current = chatPointMap.get(current.previousId)!;
        depth++;
      } else {
        errorBus.set(`Invalid previousId reference found: ${current.previousId}`);
      }
    }
    return depth;
  };

  const buildDisplayPoints = (current: ChatPoint, depth: number): ChatPointDisplay[] => {
    const displayPoints: ChatPointDisplay[] = [{
      id: current.id,
      depth: depth,
      displayValue: getDisplayValue(current),
      chatPoint: current
    }];
    
    const children = chatPoints.filter((cp) => cp.previousId === current.id);
    children.forEach((child) => {
      displayPoints.push(...buildDisplayPoints(child, depth + 1));
    });

    return displayPoints;
  };

  const roots = findRoots();
  const chatPointDisplay: ChatPointDisplay[] = [];

  roots.forEach((root) => {
    if (root.previousId) {
      errorBus.set('Root node has a previousId');
      return;
    }
    chatPointDisplay.push(...buildDisplayPoints(root, computeDepth(root)));
  });

  return chatPointDisplay;
}