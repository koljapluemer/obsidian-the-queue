import QueuePlugin from "src/main";

export function saveCurrentNote(plugin: QueuePlugin) {
    const note = plugin.currentlyTargetedNote
    if (note) {

        this.app.fileManager.processFrontMatter(note.file, (frontmatter: any) => {
            frontmatter["q-data"] = frontmatter["q-data"] || {}
            frontmatter["q-data"]["due-at"] = note.due
        })
    }
}