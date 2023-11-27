import { MarkdownView, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { StreamView, STREAM_VIEW_TYPE } from "./views/ExampleView";
import "virtual:uno.css";

interface ObsidianNoteConnectionsSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ObsidianNoteConnectionsSettings = {
	mySetting: "default",
};

export default class ObsidianNoteConnections extends Plugin {
	settings!: ObsidianNoteConnectionsSettings;

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload() {
		this.registerView(STREAM_VIEW_TYPE, (leaf: WorkspaceLeaf) => {
			const v = new StreamView(leaf);
			return v;
		});

		this.registerEvent(this.app.workspace.on('file-open', this.handleFileOpen));

		this.registerEvent(this.app.workspace.on('active-leaf-change', (l) => { console.log('leaf change', l)}));

		(window as any).toggleMyPluginView = this.toggleView.bind(this);
		this.addCommand({
      id: 'toggle-stream-view',
      name: 'Toggle between Stream and markdown mode',
      callback: () => {
				const file = app.workspace.getActiveFile();
				if (!file) {
					return;
				}
				const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
				if (frontmatter && frontmatter.stream === 'basic') {
					this.toggleView(file)
			 	}
			},
		});
	}

	handleFileOpen = async (file: TFile | null): Promise<void> => {
		console.log('handle file open', file);
		if (!file) return;
		const fileContent = await this.app.vault.read(file);
		const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

		if (frontmatter && frontmatter.stream === 'basic') {
			this.openCustomView(file);
		}
	};

	

	openCustomView(file: TFile) {
		console.log('opening custom view');
		let leaf = this.app.workspace.getLeaf(false);
		if (leaf.view.getViewType() !== STREAM_VIEW_TYPE) {
				leaf.setViewState({
						type: STREAM_VIEW_TYPE,
						state: { file: file.path }
				}).then(() => {
						const view = (leaf.view as StreamView);
						view.setFile(file);
						// leaf.openFile(file);
				});
				
		}
	}

	toggleView(file: TFile) {
		// Find the current active markdown view
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (markdownView) {
			// If we're in the markdown view, switch to the custom view
			this.openCustomView(file);
		} else {
			// Otherwise, we're in the custom view, so switch back to the markdown view
			const leaf = this.app.workspace.getLeaf(true);
			leaf.setViewState({
				type: 'markdown',
				state: { file: file.path },
				// You can also include other state properties if needed
			});
			// You may need to explicitly open the file if the view state change is not enough
			leaf.openFile(file);
		}
	}


	onunload() {
		console.log("unloading plugin");
		delete (window as any).toggleMyPluginView;
	}

	// async activateView() {
	// 	this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

	// 	await this.app.workspace.getRightLeaf(false).setViewState({
	// 		type: VIEW_TYPE_EXAMPLE,
	// 		active: true,
	// 	});

	// 	this.app.workspace.revealLeaf(
	// 		this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0],
	// 	);
	// }
}
