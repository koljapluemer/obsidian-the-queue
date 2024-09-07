import { Plugin, WorkspaceLeaf, ItemView, WorkspaceSplit, EditableFileView, MarkdownView } from "obsidian";

import QueueSettingsTab from "./elements/QueueSettingsTab";
import QueueModal from "./elements/QueueModal";
import QueueLog from "./classes/QueueLog";

interface TheQueueSettings {
	improvablesKeyword: string;
	booksActiveMax: number;
	disableLeechPrompts: boolean;
	disableImprovablesPrompts: boolean;
	excludedFolders: string[];
}

const DEFAULT_SETTINGS: Partial<TheQueueSettings> = {
	improvablesKeyword: "needs-improvement",
	booksActiveMax: 5,
	disableLeechPrompts: false,
	disableImprovablesPrompts: false,
	excludedFolders: [],
};

const VIEW_TYPE_BUTTON_BAR = "button-bar-view";

/** The outer plugin class.
 * Tasked with adding the ribbon button opening the modal, initializing the settings, and housekeeping like clearing up when closing.
 *
 */
export default class TheQueue extends Plugin {
	settings: TheQueueSettings;

	async onload() {

		// tutorial
		this.registerView(
			QUEUE_VIEW,
			(leaf) => new QueueView(leaf)
		);



		// This creates an icon in the left ribbon.
		this.addRibbonIcon("sticky-note", "Start your queue", (evt: MouseEvent) => {
			console.log('hi, opening...')
			/** Here, the modal where the action happens is opened; see class definition */
			new QueueModal(this.app, this.settings).open();
		});
		// add settings tab
		await this.loadSettings();
		this.addSettingTab(new QueueSettingsTab(this.app, this));
		// event listener for file renames
		// this is important so that the same note can be opened in queue, even if it's renamed
		this.registerEvent(
			this.app.vault.on("rename", function (file, oldname) {
				// if old_name corresponds to localstorage.lastOpenedNoteName, update it localstorage
				if (localStorage.getItem("lastOpenedNoteName") === oldname) {
					localStorage.setItem("lastOpenedNoteName", file.name);
				}
			})
		);

		QueueLog.loadFromLocalStorage();

		this.addRibbonIcon("clock", "Start queue in view", (evt: MouseEvent) => {
			/** Here, the modal where the action happens is opened; see class definition */
			console.log('opening...')
			// this.activateQueueView();
			this.addButtonToEditor();
		});
	}


	async activateQueueView() {
		const { workspace } = this.app;
	
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(QUEUE_VIEW);
	
		if (leaves.length > 0) {
		  // A leaf with our view already exists, use that
		  leaf = leaves[0];
		} else {
		  // Our view could not be found in the workspace, create a new leaf
		  // in the right sidebar for it
		  leaf = workspace.getRightLeaf(false);
		  await leaf.setViewState({ type: QUEUE_VIEW, active: true });
		}
	
		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	  }

	  async addButtonToEditor() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
	
		if (activeView) {
		  const editorContainer = activeView.containerEl;
	
		  // Create the button element
		  const button = document.createElement('button');
		  button.textContent = 'Click Me';
		  button.style.marginTop = '10px';  // Add some margin for spacing
		  button.style.position = 'absolute';  // Stick the button to the bottom
		  button.style.bottom = '10px';
	
		  // Append the button to the editor container
		  editorContainer.appendChild(button);
	
		  // Add an event listener to the button
		  button.addEventListener('click', () => {
			new Notice('Button clicked!');
		  });
		} else {
		  console.warn('No active markdown view found');
		}
	  }
	

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


export const QUEUE_VIEW = "queue-view";

export class QueueView extends MarkdownView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return QUEUE_VIEW;
  }

  async onOpen() {
    // const container = this.containerEl.children[1];
    // container.empty();
    // container.createEl("h4", { text: "Example view" });
  }

  async onClose() {
    // Nothing to clean up.
  }
}


