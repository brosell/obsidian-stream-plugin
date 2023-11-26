import { ItemView, TFile, WorkspaceLeaf } from "obsidian";

import Component from "../components/PluginRoot.svelte";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {
	component!: Component;
	file: TFile | null = null;

	constructor(leaf: WorkspaceLeaf) {
		console.log('constructing view');
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
		return title;
	}

	async onOpen() {
		console.log('onOpen');
		const guid = '1234'; //this.leaf.getViewState().state?.file?.basename;
		this.component = new Component({
			target: this.contentEl,
			props: {
				guid: guid
			}
		});
		this.file = this.leaf.getViewState().state?.file;
	}

	async onClose() {
		if (this?.component?.$destroy) {
			this.component.$destroy();
		}
	}
}
