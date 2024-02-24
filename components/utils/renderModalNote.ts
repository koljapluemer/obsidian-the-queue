import QueueFilterModal from "components/elements/QueueFilterModal";
import { MarkdownPreviewView, setIcon } from "obsidian";
import { adaptQueueNoteByScore } from "./adaptQueueNoteByScore";
import QueueNote from "components/classes/QueueNote";

export function render(qNote: QueueNote, parentContext: any) {
	// RENDER FUNCTION
	// save note name to local storage
	if (qNote.noteFile) {
		localStorage.setItem("lastOpenendNoteName", qNote.noteFile.name);
	}

	const { modalEl } = parentContext;
	modalEl.empty();
	modalEl.addClass("queue-modal");

	// load the content of the random note
	this.app.vault.cachedRead(qNote.noteFile).then((content: any) => {
		if (!content) {
			return;
		}
		// HEADER
		const headerEl = modalEl.createDiv("headerEl");

		// use q-topic frontmatter property if it exists, otherwise empty
		// give id #modal-topic to make it easy to style
		let labelText = qNote.getType();
		if (qNote.getTopic()) {
			labelText += ` — ${qNote.getTopic()}`;
		}
		const topicLabel = headerEl.createEl("span", {
			text: labelText,
		});
		topicLabel.id = "modal-topic";

		// create button to jump to note
		const jumpToNoteButton = headerEl.createEl("button", {});
		setIcon(jumpToNoteButton, "pencil");
		jumpToNoteButton.addEventListener("click", () => {
			parentContext.app.workspace.openLinkText(
				qNote.noteFile.path,
				"",
				true
			);
			parentContext.close();
		});
		// button to open queue settings dialog (add filter to button, but override if its default)
		const queueSettingsButton = headerEl.createEl("button", {
			text: parentContext.keywordFilter,
		});
		if (parentContext.keywordFilter === "All Notes") {
			setIcon(queueSettingsButton, "filter");
		}
		// on click open QueueFilterModal
		queueSettingsButton.addEventListener("click", () => {
			new QueueFilterModal(parentContext.app, (keywordFilter) => {
				parentContext.keywordFilter = keywordFilter;
				parentContext.loadNewNote();
			}).open();
		});

		const closeModalButton = headerEl.createEl("button", {});
		setIcon(closeModalButton, "cross");
		closeModalButton.addEventListener("click", () => {
			parentContext.close();
		});

		// MAIN CONTENT
		const contentEl = modalEl.createDiv("contentEl");
		const title = qNote.getBasename();
		let renderedContent = content;
		let initiallyHiddenContent: String;

		// check if first line is ---!!!!!
		// if so, we have frontmatter that we should treat omit
		if (content.startsWith("---")) {
			const splitNote = content.split("---");
			// rendered content is everything after 2nd index, rejoined
			renderedContent = splitNote.slice(2).join("---");
		}

		if (qNote.getType() === "learn-started") {
			// TODO: what if we have badly formatted learn card with no (or multiple separators)
			const splitNote = renderedContent.split("---");
			renderedContent = splitNote[0];
			initiallyHiddenContent = splitNote[1];
		}
		// add title of note before front, with a # to make it a title
		renderedContent = `# ${title}\n\n` + renderedContent;

		MarkdownPreviewView.renderMarkdown(
			renderedContent,
			contentEl,
			parentContext.currentQueueNote.path,
			parentContext.component 
		);

		const buttonRow = contentEl.createDiv("button-row");

		function appendScoreButton(
			parent: HTMLElement,
			label: string,
			returnValue: string
		) {
			const button = parent.createEl("button", {
				text: label,
			});
			button.addEventListener("click", () => {
				const adaptedQNote = adaptQueueNoteByScore(qNote, returnValue);
                adaptedQNote.save();
                console.log('about to load new note')
                parentContext.loadNewNote();
			});
		}

		if (qNote.getType() === "learn") {
			appendScoreButton( buttonRow, "Seems Hard", "hard");
			appendScoreButton(
				
				buttonRow,
				"I'll Try to Remember",
				"medium"
			);
			appendScoreButton( buttonRow, "Easy, Got It", "easy");
		} else if (qNote.getType() === "learn-started") {
			buttonRow
				.createEl("button", {
					text: "Reveal",
				})
				.addEventListener("click", () => {
					contentEl.empty();
					MarkdownPreviewView.renderMarkdown(
						renderedContent + "\n---\n" + initiallyHiddenContent,
						contentEl,
						parentContext.currentQueueNote.path,
						parentContext.component
					);
					const secondButtonRow = contentEl.createDiv("button-row");

					appendScoreButton(
						
						secondButtonRow,
						"Wrong",
						"wrong"
					);
					appendScoreButton(
						
						secondButtonRow,
						"Correct",
						"correct"
					);
					appendScoreButton( secondButtonRow, "Easy", "easy");
				});
		} else if (qNote.getType() === "habit") {
			// not today, do later, done
			appendScoreButton( buttonRow, "Not Today", "not-today");
			appendScoreButton( buttonRow, "Do Later", "later");
			appendScoreButton( buttonRow, "Done", "done");
			// todo
		} else if (qNote.getType() === "todo") {
			appendScoreButton( buttonRow, "Delete", "delete");
			appendScoreButton( buttonRow, "Not Today", "not-today");
			appendScoreButton( buttonRow, "Later", "later");
			appendScoreButton( buttonRow, "Completed", "completed");
		}
		// check:
		else if (qNote.getType() === "check") {
			appendScoreButton( buttonRow, "No", "no");
			appendScoreButton( buttonRow, "Kind of", "kind-of");
			appendScoreButton( buttonRow, "Yes", "yes");
		}
		// book or article
		else if (
			qNote.getType() === "book" ||
			qNote.getType() === "book-started" ||
			qNote.getType() === "article"
		) {
			buttonRow.createEl("span", {
				text: "Read at a bit:",
			});
			appendScoreButton( buttonRow, "Not Today", "not-today");
			appendScoreButton( buttonRow, "Later", "later");
			appendScoreButton( buttonRow, "Done", "done");
			appendScoreButton( buttonRow, "Finished", "finished");
		} else {
			appendScoreButton(
				
				buttonRow,
				"Show Less Often",
				"show-less"
			);
			appendScoreButton( buttonRow, "Ok, Cool", "show-next");
			appendScoreButton(
				
				buttonRow,
				"Show More Often",
				"show-more"
			);
		}
	});
}
