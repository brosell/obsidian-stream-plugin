import { TFile, TextFileView, WorkspaceLeaf } from 'obsidian';

import Component from '../components/PluginRoot.svelte';
import { get, getContextualStores } from '../stores/contextual-stores';
import { BusEvent, Context } from '../services/bus';

export const STREAM_VIEW_TYPE = 'stream-view';

export class StreamView extends TextFileView {
	
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
		const stores = getContextualStores(this.guid);
		stores.loadChatPoints(data);
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
		return STREAM_VIEW_TYPE;
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


(window as any).chat_map_activate = (guid: string, id: string) => {
	const stores = getContextualStores(guid); 
	console.log(`activate ${id}`);
	stores.sendMessage(BusEvent.SlashFunction, { ...Context.Null, guid }, {content: `/setThread(${id})` } );
}


