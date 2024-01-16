import { App, MarkdownView, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from "obsidian";
import { StreamView, STREAM_VIEW_TYPE } from "./views/ExampleView";
import "virtual:uno.css";
import { settingsStore } from "./stores/settings";

export interface StreamSettings {
	API_KEY: string;
	MODEL: string;
	SUMMARY_MODEL: string;
	AUTO_SUMMARIZE: boolean;
}

const DEFAULT_SETTINGS: StreamSettings = {
	API_KEY: "sk-...",
	MODEL: "gpt-3.5-turbo",
	SUMMARY_MODEL: "gpt-3.5-turbo",
	AUTO_SUMMARIZE: true,
};

export default class ObsidianStream extends Plugin {
	settings!: StreamSettings;

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		settingsStore.set(this.settings);
	}

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new StreamSettingsTab(this.app, this));

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

		settingsStore.set(this.settings);
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

	
}

class StreamSettingsTab extends PluginSettingTab {
	plugin: ObsidianStream;

	constructor(app: App, plugin: ObsidianStream) {
			super(app, plugin);
			this.plugin = plugin;
	}

	display(): void {
			let { containerEl } = this;

			containerEl.empty();

			new Setting(containerEl)
					.setName("API Key")
					.setDesc("The API key for your service")
					.addText(text => text
							.setPlaceholder("Enter your API key")
							.setValue(this.plugin.settings.API_KEY)
							.onChange(async (value) => {
									this.plugin.settings.API_KEY = value;
									await this.plugin.saveSettings();
							}));

			new Setting(containerEl)
					.setName("Model")
					.setDesc("The model used for chat")
					.addText(text => text
							.setPlaceholder("Enter the model identifier")
							.setValue(this.plugin.settings.MODEL)
							.onChange(async (value) => {
									this.plugin.settings.MODEL = value;
									await this.plugin.saveSettings();
							}));

			new Setting(containerEl)
					.setName("Summary Model")
					.setDesc("The model used for summarization")
					.addText(text => text
							.setPlaceholder("Enter the model identifier")
							.setValue(this.plugin.settings.SUMMARY_MODEL)
							.onChange(async (value) => {
									this.plugin.settings.SUMMARY_MODEL = value;
									await this.plugin.saveSettings();
							}));

			new Setting(containerEl)
					.setName("Auto Summarize")
					.setDesc("Whether to automatically summarize notes")
					.addToggle(toggle => toggle
							.setValue(this.plugin.settings.AUTO_SUMMARIZE)
							.onChange(async (value) => {
									this.plugin.settings.AUTO_SUMMARIZE = value;
									await this.plugin.saveSettings();
							}));
	}
}