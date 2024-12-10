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
                queueNote.template = noteTemplate = QueueNoteTemplate.Learn
                queueNote.stage = QueueNoteStage.Unstarted
            case 'learn-started':
                queueNote.template = noteTemplate = QueueNoteTemplate.Learn
                queueNote.stage = QueueNoteStage.Ongoing
        }

        if (noteTemplate == QueueNoteTemplate.Learn) {
            const dueDateString: string | undefined = frontmatter["q-data"]["fsrs-data"]["due"]
            if (dueDateString) {
                queueNote.due = new Date(dueDateString)
            }
            const seenDateString: string | undefined = frontmatter["q-data"]["fsrs-data"]["last_review"]
            if (seenDateString) {
                queueNote.seen = new Date(seenDateString)
            }
            if ("difficulty" in frontmatter["q-data"]["fsrs-data"]) queueNote.difficulty = frontmatter["q-data"]["fsrs-data"]["difficulty"]
            if ("stability" in frontmatter["q-data"]["fsrs-data"]) queueNote.stability = frontmatter["q-data"]["fsrs-data"]["stability"]
            if ("elapsed_days" in frontmatter["q-data"]["fsrs-data"]) queueNote.elapsed = frontmatter["q-data"]["fsrs-data"]["elapsed_days"]
            if ("lapses" in frontmatter["q-data"]["fsrs-data"]) queueNote.lapses = frontmatter["q-data"]["fsrs-data"]["lapses"]
            if ("scheduled_days" in frontmatter["q-data"]["fsrs-data"]) queueNote.scheduled = frontmatter["q-data"]["fsrs-data"]["scheduled_days"]
            if ("state" in frontmatter["q-data"]["fsrs-data"]) queueNote.state = frontmatter["q-data"]["fsrs-data"]["state"]
            if ("reps" in frontmatter["q-data"]["fsrs-data"]) queueNote.reps = frontmatter["q-data"]["fsrs-data"]["reps"]
        }

        // the following codes handles new frontmatter syntax
        const qData = frontmatter["q"]
        if (qData) {
            const noteTemplateString: string = qData["template"] ?? ""
            switch (noteTemplateString) {
                case 'learn':
                    queueNote.template = QueueNoteTemplate.Learn
            }

            const noteStageString = qData["stage"]
            switch(noteStageString) {
                case 'ongoing':
                    queueNote.stage = QueueNoteStage.Ongoing
            } 

            const dueDateString: string | undefined = qData["due"]
            if (dueDateString) {
                queueNote.due = new Date(dueDateString)
            }
            const seenDateString: string | undefined = qData["seen"]
            if (seenDateString) {
                queueNote.seen = new Date(seenDateString)
            }
            if ("difficulty" in qData) queueNote.difficulty = qData["difficulty"]
            if ("stability" in qData) queueNote.stability = qData["stability"]
            if ("elapsed" in qData) queueNote.elapsed = qData["elapsed"]
            if ("lapses" in qData) queueNote.lapses = qData["lapses"]
            if ("scheduled" in qData) queueNote.scheduled = qData["scheduled"]
            if ("state" in qData) queueNote.state = qData["state"]
            if ("reps" in qData) queueNote.reps = qData["reps"]
        }


    }

    return queueNote;
}