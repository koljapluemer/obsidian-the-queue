import QueuePlugin from "src/main";

export function saveCurrentNote(plugin: QueuePlugin) {
    console.log('saving current', plugin.currentlyTargetedNote)
    const note = plugin.currentlyTargetedNote
    if (note) {
        this.app.fileManager.processFrontMatter(note.file, (frontmatter: any) => {
            frontmatter["q-data"] = frontmatter["q-data"] || {}
            frontmatter["q-data"]["due-at"] = note.due
        })
    }
}