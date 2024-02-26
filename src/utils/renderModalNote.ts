import QueueFilterModal from "src/elements/QueueFilterModal";
import { MarkdownRenderer, setIcon } from "obsidian";
import QueuePrompt from "src/classes/QueuePrompt";

export function render(qPrompt: QueuePrompt, parentContext: any) {
	// RENDER FUNCTION
	const { modalEl } = parentContext;
	modalEl.empty();
	modalEl.addClass("queue-modal");

	// load the content of the random note
	this.app.vault.cachedRead(qPrompt.qNote.noteFile).then((content: any) => {
		if (!content) {
			return;
		}
		// HEADER
		const headerEl = modalEl.createDiv("headerEl");

		// give id #modal-topic to make it easy to style
		let labelText;
		if (qPrompt.qNote.getTopic() != null) {
			labelText = qPrompt.qNote.getTopic();
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
				qPrompt.qNote.noteFile.path,
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
		const title = qPrompt.qNote.getBasename();
		let renderedContent = content;
		let initiallyHiddenContent: String;

		// check if first line is ---
		// if so, we have frontmatter that we should treat omit
		if (content.startsWith("---")) {
			const splitNote = content.split("---");
			// rendered content is everything after 2nd index, rejoined
			renderedContent = splitNote.slice(2).join("---");
		}

		if (qPrompt.promptType === "startedLearnNoteMostCloseToForgetting") {
			// TODO: what if we have badly formatted learn card with no (or multiple separators)
			const splitNote = renderedContent.split("---");
			renderedContent = splitNote[0];
			initiallyHiddenContent = splitNote[1];
		}
		// add title of note before front, with a # to make it a title
		renderedContent = `# ${title}\n\n` + renderedContent;

		MarkdownRenderer.renderMarkdown(
			renderedContent,
			contentEl,
			qPrompt.qNote.getNoteFile().path,
			contentEl
		);

		function appendScoreButton(
			parent: HTMLElement,
			label: string,
			returnValue: string
		) {
			const button = parent.createEl("button", {
				text: label,
			});
			button.addEventListener("click", () => {
				qPrompt.qNote.adaptByScore(returnValue);
				qPrompt.qNote.save();
				parentContext.loadNewNote();
			});
		}

		// HANDLE SPECIAL USED SELECTION
		// for orphans and improvables, we want to show a different set of buttons
		// one 'Ok' opens the current note and closes the modal, and a standard 'Not Today' button
		if (qPrompt.promptType === "improvables") {
			contentEl.createEl("p", {
				text: "You marked this note as improvable. Make it slightly nicer!",
				cls: "button-prompt",
			});
		} else if (qPrompt.promptType === "orphans") {
			contentEl.createEl("p", {
				text: "This note is an orphan. Link it with another note!",
				cls: "button-prompt",
			});
		}

		const buttonRow = contentEl.createDiv("button-row");

		if (
			qPrompt.promptType === "improvables" ||
			qPrompt.promptType === "orphans"
		) {
			appendScoreButton(buttonRow, "Not Now", "not-today");
			buttonRow
				.createEl("button", {
					text: "Let's Go",
				})
				.addEventListener("click", () => {
					// open note in editor and close modal
					parentContext.app.workspace.openLinkText(
						qPrompt.qNote.noteFile.path,
						"",
						true
					);
					parentContext.close();
				});
		} else {
			// HANDLE STANDARD CASES

			if (qPrompt.promptType === "newLearns") {
				appendScoreButton(buttonRow, "Seems Hard", "hard");
				appendScoreButton(buttonRow, "I'll Try to Remember", "medium");
				appendScoreButton(buttonRow, "Easy, Got It", "easy");
			} else if (
				qPrompt.promptType === "startedLearnNoteMostCloseToForgetting"
			) {
				buttonRow
					.createEl("button", {
						text: "Reveal",
					})
					.addEventListener("click", () => {
						contentEl.empty();
						MarkdownRenderer.renderMarkdown(
							renderedContent +
								"\n---\n" +
								initiallyHiddenContent,
							contentEl,
							qPrompt.qNote.getNoteFile().path,
							contentEl
						);
						const secondButtonRow =
							contentEl.createDiv("button-row");

						appendScoreButton(secondButtonRow, "Wrong", "wrong");
						appendScoreButton(
							secondButtonRow,
							"Correct",
							"correct"
						);
						appendScoreButton(secondButtonRow, "Easy", "easy");
					});
			} else if (qPrompt.promptType === "dueHabits") {
				// not today, do later, done
				appendScoreButton(buttonRow, "Not Today", "not-today");
				appendScoreButton(buttonRow, "Do Later", "later");
				appendScoreButton(buttonRow, "Done", "done");
				// todo
			} else if (qPrompt.promptType === "dueTodos") {
				appendScoreButton(buttonRow, "Delete", "delete");
				appendScoreButton(buttonRow, "Not Today", "not-today");
				appendScoreButton(buttonRow, "Later", "later");
				appendScoreButton(buttonRow, "Completed", "completed");
			}
			// check:
			else if (qPrompt.promptType === "dueChecks") {
				appendScoreButton(buttonRow, "No", "no");
				appendScoreButton(buttonRow, "Kind of", "kind-of");
				appendScoreButton(buttonRow, "Yes", "yes");
			}
			// book or article
			else if (
				qPrompt.promptType === "dueStartedBooks" ||
				qPrompt.promptType === "newBooks" ||
				qPrompt.promptType === "dueArticles"
			) {
				buttonRow.createEl("span", {
					text: "Read at a bit:",
				});
				appendScoreButton(buttonRow, "Not Today", "not-today");
				appendScoreButton(buttonRow, "Later", "later");
				appendScoreButton(buttonRow, "Done", "done");
				appendScoreButton(buttonRow, "Finished", "finished");
			} else {
				appendScoreButton(buttonRow, "Show Less Often", "show-less");
				appendScoreButton(buttonRow, "Ok, Cool", "show-next");
				appendScoreButton(buttonRow, "Show More Often", "show-more");
			}
		}
	});
}
