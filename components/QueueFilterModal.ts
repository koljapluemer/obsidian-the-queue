import { App, Modal, Setting } from "obsidian";

// define QueueFilterModal:
export default class QueueFilterModal extends Modal {
	keywordFilter: string;

	onSubmit: (keywordFilter: string) => void;

	constructor(app: App, onSubmit: (keywordFilter: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		// loop through all notes, and generate a set from all found values in the q-keywords frontmatter list property
		const allKeywords = new Set();

		const allNotes = this.app.vault.getMarkdownFiles();
		allNotes.forEach((note) => {
			const metadata = this.app.metadataCache.getFileCache(note);
			const keywordsProperty = metadata?.frontmatter?.["q-keywords"];
			if (keywordsProperty) {
				// check type of keywordsProperty
				const typeOfKeywordsProperty = typeof keywordsProperty;
				console.info("Type", typeOfKeywordsProperty);
				// if it's an array, loop through, if it's a string, add it to the set
				if (Array.isArray(keywordsProperty)) {
					keywordsProperty.forEach((keyword: String) => {
						allKeywords.add(keyword);
					});
				} else if (typeof keywordsProperty === "string") {
					allKeywords.add(keywordsProperty);
				}
			}
		});
		let { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Filter Queue" });
		// add more text to describe
		contentEl.createEl("p", {
			text: "Show only notes with q-keyword:",
		});

		// make a radio button group with all the keywords found, plus an "All Notes" option
		new Setting(contentEl)
			.setName("Filter by Keyword")
			.addDropdown((dropdown) => {
				dropdown.addOption("All Notes", "All Notes");
				allKeywords.forEach((keyword) => {
					dropdown.addOption(keyword, keyword);
				});
				dropdown.onChange((value) => {
					this.keywordFilter = value;
				});
			})
			.addButton((button) =>
				button.setButtonText("Filter").onClick(() => {
					this.close();
					this.onSubmit(this.keywordFilter);
				})
			);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
