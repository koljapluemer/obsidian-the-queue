import { App, Modal, Setting } from "obsidian";

/** Responsible for filtering the queue by keyword.
 * Opens *another* modal, on top of the standard QueueModal
 */
export default class QueueFilterModal extends Modal {
	keywordFilter: string = "All notes";

	onSubmit: (keywordFilter: string) => void;

	constructor(app: App, onSubmit: (keywordFilter: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		// TODO: technically we don't need the markdown loop or the manual frontmatter check, we can use QueueNote[] array
		// loop through all notes, and generate a set from all found values in the q-keywords frontmatter list property
		const allKeywords = new Set();

		const allNotes = this.app.vault.getMarkdownFiles();
		allNotes.forEach((note) => {
			const metadata = this.app.metadataCache.getFileCache(note);
			const keywordsProperty = metadata?.frontmatter?.["q-keywords"];
			if (keywordsProperty) {
				// check type of keywordsProperty
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
		contentEl.createEl("h2", { text: "Filter queue" });
		// add more text to describe
		contentEl.createEl("p", {
			text: "Show only notes with q-keyword:",
		});

		// make a radio button group with all the keywords found, plus an "All notes" option
		new Setting(contentEl)
			.setName("Filter by keyword")
			.addDropdown((dropdown) => {
				dropdown.addOption("All notes", "All notes");
				allKeywords.forEach((keyword) => {
					dropdown.addOption(keyword as string, keyword as string);
				});
                dropdown.setValue(this.keywordFilter);
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
