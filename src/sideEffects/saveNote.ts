import QueuePlugin from "src/main";
import { QueueNoteStage, QueueNoteTemplate } from "src/types";

export function saveCurrentNote(plugin: QueuePlugin) {
    const note = plugin.currentlyTargetedNote
    if (note) {
        this.app.fileManager.processFrontMatter(note.file, (frontmatter: any) => {
            frontmatter["q"] = frontmatter["q"] || {}

            const template = Object.keys(QueueNoteTemplate).find(
                // @ts-ignore
                key => QueueNoteTemplate[key] === note.template
            )

            frontmatter["q"]["template"] = template?.toLowerCase()

            if (note.stage && note.stage !== QueueNoteStage.Base) {
                const stage = Object.keys(QueueNoteStage).find(
                    // @ts-ignore
                    key => QueueNoteTemplate[key] === note.stage
                )
                frontmatter["q"]["stage"] = template?.toLowerCase()
            }

            if (note.due) frontmatter["q"]["due"] = note.due
            if (note.seen) frontmatter["q"]["seen"] = note.seen
            if (note.interval && note.interval != 1) frontmatter["q"]["interval"] = note.interval
            if (note.stability) frontmatter["q"]["stability"] = note.stability
            if (note.difficulty) frontmatter["q"]["difficulty"] = note.difficulty
            if (note.elapsed) frontmatter["q"]["elapsed"] = note.elapsed
            if (note.scheduled) frontmatter["q"]["scheduled"] = note.scheduled
            if (note.reps) frontmatter["q"]["reps"] = note.reps
            if (note.lapses) frontmatter["q"]["lapses"] = note.lapses
            if (note.state) frontmatter["q"]["state"] = note.state
        })
    }
}