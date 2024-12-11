import QueuePlugin from "src/main";
import { QueueNoteStage, QueueNoteTemplate } from "src/types";

export async function saveCurrentNote(plugin: QueuePlugin) {
    const note = plugin.currentlyTargetedNote
    if (note) {
        this.app.fileManager.processFrontMatter(note.file, (frontmatter: any) => {
            frontmatter["q"] = frontmatter["q"] || {}

            if (note.template !== QueueNoteTemplate.Misc) {
                const template = Object.keys(QueueNoteTemplate).find(
                    // @ts-ignore
                    key => QueueNoteTemplate[key] === note.template
                )
                frontmatter["q"]["template"] = template?.toLowerCase()
            }

            if (note.stage !== undefined && note.stage !== QueueNoteStage.Base) {
                const stage = Object.keys(QueueNoteStage).find(
                    // @ts-ignore
                    key => QueueNoteStage[key] === note.stage
                )
                frontmatter["q"]["stage"] = stage?.toLowerCase()
            }

            if (note.due !== undefined) frontmatter["q"]["due"] = note.due
            if (note.seen !== undefined) frontmatter["q"]["seen"] = note.seen
            if (note.interval !== undefined && note.interval != 1) frontmatter["q"]["interval"] = note.interval
            if (note.stability !== undefined) frontmatter["q"]["stability"] = note.stability
            if (note.difficulty !== undefined) frontmatter["q"]["difficulty"] = note.difficulty
            if (note.elapsed !== undefined) frontmatter["q"]["elapsed"] = note.elapsed
            if (note.scheduled !== undefined) frontmatter["q"]["scheduled"] = note.scheduled
            if (note.reps !== undefined) frontmatter["q"]["reps"] = note.reps
            if (note.lapses !== undefined) frontmatter["q"]["lapses"] = note.lapses
            if (note.state !== undefined) frontmatter["q"]["state"] = note.state

            console.log('processed frontmatter, it is now', frontmatter)
            deletePropertiesWithOldPrefix(frontmatter)
        })

        // delete note that was saved from notes, so that it won't be opened again
        plugin.notes = plugin.notes.filter(el => el != note)
    }
}

// TODO: put this behind a settings toggle
function deletePropertiesWithOldPrefix(obj: Record<string, any>): void {
    for (const key of Object.keys(obj)) {
        if (key.startsWith("q-")) {
            delete obj[key];
        }
    }
}