import QueueFilterModal from "../elements/QueueFilterModal";
import { MarkdownRenderer, setIcon } from "obsidian";
import QueuePrompt from "../classes/QueuePrompt";

/** Responsible for generating the actual HTML elements in the modal that you see every time you engage with the plugin */
export function render(qPrompt: QueuePrompt, parentContext: any) {
	// RENDER FUNCTION
	const { modalEl } = parentContext;
	modalEl.empty();
	modalEl.addClass("queue-modal");

	// load the content of the random note
	this.app.vault.cachedRead(qPrompt.qNote.noteFile).then((content: any) => {

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
			new QueueFilterModal(parentContext.app, (keywordFilter: string) => {
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
		const name = qPrompt.qNote.getBasename();
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
			// TODO: what if we have badly formatted learn note with no (or multiple separators)
			const splitNote = renderedContent.split("---");
			if (splitNote.length > 1) {
				renderedContent = splitNote[0];
				// rest of note
				initiallyHiddenContent = splitNote.slice(1).join("---");
			} else {
				// we just show the name, aka renderedContent is just nothing
				renderedContent = "";
				initiallyHiddenContent = splitNote[0];
			}
		}
		// add name of note before front, with a # to make it a name
		renderedContent = `# ${name}\n\n` + renderedContent;

		MarkdownRenderer.renderMarkdown(
			renderedContent,
			contentEl,
			qPrompt.qNote.getNoteFile().path,
			contentEl
		);

		/** small, internal helper function to actually add a given button and its event listener
		 * we do this a lot, but all that ever changes is the label and the string we return (like "Not Today" and "not-today", respectively)
		 */
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
		}
		if (qPrompt.promptType === "orphans") {
			contentEl.createEl("p", {
				text: "This note is an orphan. Link it with another note!",
				cls: "button-prompt",
			});
		}
		const learnLeechPrompts = [
			"Add an image from the internet to the back to remember it more easily.",
			"Link the note to another note to help your brain out.",
			"Split the note into several easier-to-remember notes.",
			"Make up a silly mnemonic and add it to the back of the note.",
			"Come up with a helpful rhyme and put it on the back of the note.",
		];
		if (qPrompt.promptType === "learnLeeches") {
			contentEl.createEl("p", {
				text:
					"This note is a leech. " +
					learnLeechPrompts[
						Math.floor(Math.random() * learnLeechPrompts.length)
					],
				cls: "button-prompt",
			});
		}
		if (qPrompt.promptType === "checkLeeches") {
			contentEl.createEl("p", {
				text: "You are pressing 'No' a lot. Do you want to redesign the question?",
				cls: "button-prompt",
			});
		}
		if (qPrompt.promptType === "readingLeeches") {
			contentEl.createEl("p", {
				text: "You are delaying reading this note a lot. Do you want to edit or delete the note?",
				cls: "button-prompt",
			});
		}
		const otherLeechPrompts = [
			"Consider to reduce the scope.",
			"Add a *minimum valuable action* to the note that will move you an inch closer to your goal.",
			"Consider splitting the note into several smaller activities.",
			"Reformulate the note to make it less dreadful",
			"Add a reward for completing the task to the note.",
			"Add a SMART goal to the note so the activity is clearly defined.",
		];
		if (qPrompt.promptType === "otherLeeches") {
			contentEl.createEl("p", {
				text:
					"You are delaying this task a lot. " +
					otherLeechPrompts[
						Math.floor(Math.random() * otherLeechPrompts.length)
					],
				cls: "button-prompt",
			});
		}

		const buttonRow = contentEl.createDiv("button-row");

		const specialPromptTypes = [
			"improvables",
			"orphans",
			"learnLeeches",
			"checkLeeches",
			"readingLeeches",
			"otherLeeches",
		];

		if (specialPromptTypes.includes(qPrompt.promptType)) {
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
					// by decrementing the leech count, we prevent
					// the note from showing up as a leech again before
					// we had it in a natural context at least once and it failed
					// we're technically also running a leechReset on notes that were never registered as leech
					// but that's fine for now
					qPrompt.qNote.decrementLeechCount(1);
					qPrompt.qNote.save();
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
