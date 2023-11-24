import { ItemView, TFile, WorkspaceLeaf } from "obsidian";

import Component from "../components/PluginRoot.svelte";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {
	component!: Component;
	file: TFile | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

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
		console.log('title', title);
		return title;
	}

	async onOpen() {
		this.component = new Component({
			target: this.contentEl,
		});
	}

	async onClose() {
		if (this?.component?.$destroy) {
			this.component.$destroy();
		}
	}
}
