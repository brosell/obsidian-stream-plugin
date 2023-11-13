type Formatter<T> = (item: T) => string;
type IdFn<T> = (item: T) => string;
type TtoString<T> = (item: T) => string;

export interface HierarchicalData {
  id: string;
  children?: HierarchicalData[]
}

export interface TreeItem {
  name: string;
  children?: TreeItem[];

  // To allow custom keys
  [key: string]: any;
}

export type TreeData = TreeItem[];

export class NestedListBuilder<T extends HierarchicalData> {
  private dataMap: Map<string | null, T[]>;

  constructor(data: T[], idFn: IdFn<T>) {

    this.dataMap = new Map<string | null, T[]>();
    data.forEach(item => {
      const parentId = idFn(item);
      if (!this.dataMap.has(parentId)) {
        this.dataMap.set(parentId, []);
      }
      this.dataMap.get(parentId)?.push(item);
    });
  }

  buildList(parentId: string | null, formatter: Formatter<T>): string {
    const children = this.dataMap.get(parentId) || [];
    if (children.length === 0) return '';

    let listHtml = `<ul>`;
    children.forEach(child => {
      listHtml += `<li>${formatter(child)}${this.buildList(child.id, formatter)}</li>`;
    });
    listHtml += `</ul>`;

    return listHtml;
  }
}


export function transformToTree<T extends TreeItem>(entries: T[], parentIdFn: TtoString<T>, labelFn: TtoString<T>): TreeData {
  const map: { [key: string]: TreeItem } = {};
  const roots: TreeData = [];

  entries.forEach(entry => {
      map[entry.id] = { ...entry, name: labelFn(entry), children: [] };
  });

  entries.forEach(entry => {
    const parentId = parentIdFn(entry);
      if (parentId === '') {
          roots.push(map[entry.id]);
      } else {
          const parent = map[parentId];
          if (parent) {
              parent.children?.push(map[entry.id]);
          }
      }
  });

  return roots;
}