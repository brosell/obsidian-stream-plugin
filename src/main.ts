import { MarkdownView, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { ExampleView, VIEW_TYPE_EXAMPLE } from "./views/ExampleView";
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
		this.registerView(VIEW_TYPE_EXAMPLE, (leaf: WorkspaceLeaf) => {
			console.log('creating view', leaf)
			return new ExampleView(leaf)
		});

		this.registerEvent(this.app.workspace.on('file-open', this.handleFileOpen));
		(window as any).toggleMyPluginView = this.toggleView.bind(this);
		this.addCommand({
      id: 'toggle-stream-view',
      name: 'Toggle between Stream and markdown mode',
      checkCallback: (checking) => {
				const file = app.workspace.getActiveFile();
				if (!file) {
					return;
				}
				const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
				if (frontmatter && frontmatter.stream === 'basic') {
					if (checking) {
						return true;
					}

					this.toggleView(file)
			 	}
			},
		});
	}

	handleFileOpen = async (file: TFile | null): Promise<void> => {
		if (!file) return;
		const fileContent = await this.app.vault.read(file);
		const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

		if (frontmatter && frontmatter.stream === 'basic') {
			console.log('opening stream file', file);
			this.openCustomView(file);
		}
	};

	openCustomView(file: TFile) {
		let leaf = this.app.workspace.getLeaf(false);
		if (leaf.view.getViewType() !== VIEW_TYPE_EXAMPLE) {
			console.log('opening custom view');
				leaf.setViewState({
						type: VIEW_TYPE_EXAMPLE,
						state: { file: file.path }
				}).then(() => {
						const view = (leaf.view as ExampleView);
						view.setFile(file);
						// leaf.openFile(file);
				});
				
		}
}

// 	openCustomView(file: TFile) {
//     // Check if there's already a leaf with the custom view for this file
//     let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)
//         .find(leaf => (leaf.view as ExampleView).file.path === file.path);
    
//     if (!leaf) {
//         // Create a new leaf if one doesn't exist
//         leaf = this.app.workspace.createLeafBySplit(this.app.workspace.activeLeaf!);
//     }

//     // Open the custom view in the leaf
//     const view = new ExampleView(leaf, file);
//     leaf.setViewState({
//         type: VIEW_TYPE_EXAMPLE,
//         state: { file: file.path }
//     });
//     // If needed, you can manually trigger the view to display the content
//     view.leaf.open(view);
// }

	// openCustomView(file: TFile) {
	// 	console.log('opening view?');
	// 	const leaf = this.app.workspace.getLeaf(false);
	// 	leaf.setViewState({
	// 		type: VIEW_TYPE_EXAMPLE,
	// 		state: { file: file.path }
	// 	});

	// 	leaf.openFile(file, { state: { view: VIEW_TYPE_EXAMPLE } });
	// }

	// toggleView(file: TFile) {
	// 		const activeLeaf = this.app.workspace.activeLeaf!;
	// 		if (activeLeaf.view.getViewType() === 'markdown') {
	// 				this.openCustomView(file);
	// 		} else {
	// 				activeLeaf.setViewState({
	// 						type: 'markdown',
	// 						state: { file: file.path }
	// 				});
	// 		}
	// }

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
