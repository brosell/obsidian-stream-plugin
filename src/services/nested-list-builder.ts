type Formatter<T> = (item: T) => string;
type IdFn<T> = (item: T) => string;

export interface HierarchicalData {
  id: string;
  // 'parent' field name will now be dynamic
  // ... other properties
}

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
