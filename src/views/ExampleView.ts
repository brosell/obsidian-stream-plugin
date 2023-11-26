import { ItemView, TFile, TextFileView, WorkspaceLeaf } from "obsidian";

import Component from "../components/PluginRoot.svelte";
import { getContextualStores } from "../stores/contextual-stores";
import { get } from "svelte/store";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends TextFileView {
	
	constructor(leaf: WorkspaceLeaf) {
		console.log('constructing view');
		super(leaf);
		this.guid = Math.random().toString(36).substring(2);
	}

	getViewData(): string {
		console.log(`getViewData ${this.guid}`);
		const { saveData } = getContextualStores(this.guid);
		return get(saveData);
	}
	setViewData(data: string, clear: boolean): void {
		console.log("setViewData", this.guid);
		// console.log(data, clear);
		const { loadChatPoints } = getContextualStores(this.guid);
		loadChatPoints(data);
	}
	clear(): void {
		console.log("clear Method not implemented.");
	}

	component!: Component;
	file: TFile | null = null;

	guid: string;

	setFile(file: TFile) {
		this.file = file;
		console.log('file', file)
		// Perform any additional setup required for displaying the file
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		const title = this.file?.basename || 'wtf';
		return title;
	}

	async onOpen() {
		console.log('onOpen');
		this.component = new Component({
			target: this.contentEl,
			props: { guid: this.guid, viewParent: this },
		});
	}

	async onClose() {
		if (this?.component?.$destroy) {
			this.component.$destroy();
		}
	}

	async onLoadFile (file: TFile) {
		console.log('onLoadFile', file);
		return await super.onLoadFile(file);
	}
}
