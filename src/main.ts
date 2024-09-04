import { Plugin, MarkdownView } from "obsidian";

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

/** The outer plugin class.
 * Tasked with adding the ribbon button opening the modal, initializing the settings, and housekeeping like clearing up when closing.
 *
 */
export default class TheQueue extends Plugin {
	settings: TheQueueSettings;

	async onload() {
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
			this.addButtonBarToActiveView();
			// new QueueModal(this.app, this.settings).open();
		});
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



    addButtonBarToActiveView() {
		console.log('adding button bar...')
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
            const container = activeView.containerEl.querySelector('.view-content');
            if (container) {
                // Create the button bar
                const buttonBar = document.createElement('div');
                buttonBar.style.display = 'flex';
                buttonBar.style.justifyContent = 'flex-end';
                buttonBar.style.marginBottom = '10px';
                
                // Add buttons to the bar
                const button1 = document.createElement('button');
                button1.textContent = 'Button 1';
                button1.onclick = () => {
                    new Notice('Button 1 clicked!');
                };

                const button2 = document.createElement('button');
                button2.textContent = 'Button 2';
                button2.onclick = () => {
                    new Notice('Button 2 clicked!');
                };

                buttonBar.appendChild(button1);
                buttonBar.appendChild(button2);

                // Insert the button bar into the view
                container.prepend(buttonBar);
            }
        }
    }
}
