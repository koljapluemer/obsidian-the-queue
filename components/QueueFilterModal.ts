import { App, Modal, Setting } from "obsidian";

// define QueueFilterModal:
export default class QueueFilterModal extends Modal {
	keywordFilter: string = "all-notes";

	onSubmit: (keywordFilter: string) => void;

	constructor(app: App) {
		super(app);
		this.onSubmit = this.onSubmit;
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
		// make a radio button group with all the keywords
		const radioGroup = contentEl.createDiv("queue-settings-radio-group");
		// first, make an 'all notes' option (input first, then label) [RADIO BUTTON!!!]
		const allNotesWrapper = radioGroup.createDiv(
			"queue-settings-radio-wrapper"
		);
		const allNotesInput = allNotesWrapper.createEl("input", {
			type: "radio",
			value: "all-notes",
		});
		// set name property to q-keyword, so that only one can be selected at a time
		allNotesInput.name = "q-keyword";
		allNotesInput.checked = this.keywordFilter === "all-notes";
		const allNotesLabel = allNotesWrapper.createEl("label", {
			text: "All Notes",
		});
		// then, make an option for each keyword
		allKeywords.forEach((keyword) => {
			const keywordWrapper = radioGroup.createDiv(
				"queue-settings-radio-wrapper"
			);
			const keywordInput = keywordWrapper.createEl("input", {
				type: "radio",
				value: keyword,
			});
			keywordInput.name = "q-keyword";
			keywordInput.checked = this.keywordFilter === keyword;
			const keywordLabel = keywordWrapper.createEl("label", {
				text: keyword,
			});
		});

		// on change, set keywordFilter to the value of the selected radio button
		radioGroup.addEventListener("change", (evt) => {
			this.keywordFilter = (evt.target as HTMLInputElement).value;
		});

		// add a submit button via the Setting API
		new Setting(contentEl).setName("Filter Queue").addButton((button) =>
			button.setButtonText("Filter").onClick(() => {
				this.onSubmit(this.keywordFilter);
				this.close();
			})
		);
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
