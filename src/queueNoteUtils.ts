import { parse, stringify } from 'yaml'
import { QueueNote, QueueNoteStage, QueueNoteTemplate } from './types/queueNoteRelated';



export function getNoteFromString(str: string): QueueNote {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const queueNote: QueueNote = {
        template: QueueNoteTemplate.Misc
    }

    // Extract the frontmatter (if it exists)
    const frontmatterMatch = str.match(frontmatterRegex);
    if (frontmatterMatch) {
        const frontmatter = parse(frontmatterMatch[1])
        // the following code handles the legacy frontmatter
        const noteTemplateString: string = frontmatter["q-type"] ?? ""
        let noteTemplate: QueueNoteTemplate = QueueNoteTemplate.Misc
        let noteStage: QueueNoteStage | undefined
        switch (noteTemplateString) {
            case 'learn':
                noteTemplate = QueueNoteTemplate.Learn
                noteStage = QueueNoteStage.Unstarted
            case 'learn-started':
                noteTemplate = QueueNoteTemplate.Learn
                noteStage = QueueNoteStage.Ongoing
        }

        queueNote.template = noteTemplate
        queueNote.stage = noteStage

        if (noteTemplate == QueueNoteTemplate.Learn) {
            const dueDateString: string | undefined = frontmatter["q-data"]["fsrs-data"]["due"]
            if (dueDateString) {
                queueNote.due = new Date(dueDateString)
            }
            const seenDateString: string | undefined = frontmatter["q-data"]["fsrs-data"]["last_review"]
            if (seenDateString) {
                queueNote.seen = new Date(seenDateString)
            }
            queueNote.difficulty = frontmatter["q-data"]["fsrs-data"]["difficulty"]
            queueNote.stability = frontmatter["q-data"]["fsrs-data"]["stability"]
            queueNote.elapsed = frontmatter["q-data"]["fsrs-data"]["elapsed_days"]
            queueNote.lapses = frontmatter["q-data"]["fsrs-data"]["lapses"]
            queueNote.scheduled = frontmatter["q-data"]["fsrs-data"]["scheduled_days"]
            queueNote.state = frontmatter["q-data"]["fsrs-data"]["state"]
            queueNote.reps = frontmatter["q-data"]["fsrs-data"]["reps"]
        }

    }

    return queueNote;
}