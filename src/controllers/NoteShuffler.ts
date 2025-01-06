import { QueueMediator } from "./QueueMediator"
import { QueueNote } from "../models/QueueNote"
import { QueueNoteStage, QueueNoteTemplate } from "src/types"
import { getAllMdFiles, getFrontmatterOfFile } from "src/helpers/vaultUtils"
import { getRandomInt, pickRandom } from "src/helpers/arrayUtils"
import { StreakManager } from "./StreakManager"
import { QueueNoteFactory } from "src/models/NoteFactory"
import { getPluginContext } from "src/contexts/pluginContext"
import { TFile } from "obsidian"
import { StatsManager } from "./StatsManager"

// knows the notes
// when asked, produces a random note (probably to open it)
export class NoteShuffler {
    mediator: QueueMediator
    notes: QueueNote[] = []
    streakManager: StreakManager
    notesCurrentlyLoading = false
    noteToExcludeBecauseWeJustHadIt: QueueNote | null = null

    constructor(mediator: QueueMediator) {
        this.mediator = mediator
        mediator.noteShuffler = this
        this.streakManager = new StreakManager()

        const context = getPluginContext()

        // watching for new changes to open files
        // int this case, we generate a note from the changed file
        // compare that to this.notes, and adapt the note in notes
        // otherwise, any kind of write, whether scoring in other parts of the plugin
        // nor user edits would have an effect until plugin/obs restart
        context.plugin.registerEvent(context.app.vault.on('modify', async (file) => {
            if (this.notes.length > 0 && file instanceof TFile && file.extension === 'md') {
                const noteFromFile = await QueueNoteFactory.createNoteFromFile(file)
                const index = this.notes.findIndex((note) => noteFromFile.file === note.file)
                if (index !== -1) {
                    this.notes[index] = noteFromFile
                }
            }
        })
        )
    }

    public async getDueNote(): Promise<QueueNote | null> {
        let note: QueueNote | null
        if (this.notes.length > 0) {
            note = this.getDueNoteFromAllNotes()
        } else {
            note = await this.getDueNoteQuickly()
        }
        if (note) this.streakManager.onNoteWasPicked(note.qData)
        this.noteToExcludeBecauseWeJustHadIt = note
        return note
    }

    public requestLoadingNotes() {
        if (!this.notesCurrentlyLoading) {
            this.notesCurrentlyLoading = true
            this.loadNotes()
        }
    }

    private async loadNotes() {
        const allFiles = getAllMdFiles();
        try {
            const notes: QueueNote[] = []
            for (const file of allFiles) {
                const note = await QueueNoteFactory.createNoteFromFile(file)
                if (note && note.qData.template !== QueueNoteTemplate.Exclude) {
                    notes.push(note)
                }
            }
            this.notes = notes
            StatsManager.logDueStats(this.notes)
        } catch (error) {
            console.error('Error loading notes:', error);
        }
        this.notesCurrentlyLoading = false
    }

    private getDueNoteFromAllNotes(): QueueNote | null {
        const templateToPick = this.getRandomTemplateToPick()
        const notesToPickFrom = this.decideWhichNotesToPickFrom()

        const simplyAllDueNotes = notesToPickFrom.filter(note => note.isDue() && note !== this.noteToExcludeBecauseWeJustHadIt)
        const notesWithDesiredTemplate = simplyAllDueNotes.filter(note => note.qData.template === templateToPick)

        // return a note with desired template, if we have none, return any due note
        // TODO: if we have none at all, also allow just any misc
        let noteToPick = pickRandom(notesWithDesiredTemplate)
        if (!noteToPick) {
            noteToPick = pickRandom(simplyAllDueNotes)
        }
        return noteToPick
    }

    private getRandomTemplateToPick(): QueueNoteTemplate {
        const noteTemplates = [QueueNoteTemplate.Learn, QueueNoteTemplate.Learn, QueueNoteTemplate.Todo, QueueNoteTemplate.Habit, QueueNoteTemplate.Check, QueueNoteTemplate.ShortMedia, QueueNoteTemplate.LongMedia, QueueNoteTemplate.Misc]

        let templateFromStreak = this.streakManager.getCurrentStreakTemplate()
        if (templateFromStreak === null || templateFromStreak === undefined) {
            return pickRandom(noteTemplates)!
        } else {
            return templateFromStreak
        }
    }

    private decideWhichNotesToPickFrom(): QueueNote[] {
        // filters after deciding whether to filter out new learns (if we have a lot of learns already); and same with longmedia
        return this.getFilteredNotes(this.notes)
        // this is wrapped in another function to isolate the side effect (gettin the external this.notes state)
    }

    private getFilteredNotes(notes: QueueNote[]): QueueNote[] {
        const ongoingLearns = notes.filter(note => note.qData.template === QueueNoteTemplate.Learn && note.qData.stage === QueueNoteStage.Ongoing)
        const nrDueLearns = ongoingLearns.filter(note => note.isDue()).length
        const exludeUnstartedLearns = nrDueLearns > 20

        const nrActiveLongMedia = notes.filter(note => note.qData.template === QueueNoteTemplate.LongMedia && note.qData.stage === QueueNoteStage.Ongoing).length
        const exludeUnstartedLongMedia = nrActiveLongMedia > 5
        if (exludeUnstartedLearns) notes = notes.filter(note => !(note.qData.template === QueueNoteTemplate.Learn && note.qData.stage === QueueNoteStage.Unstarted))
        if (exludeUnstartedLongMedia) notes = notes.filter(note => !(note.qData.template === QueueNoteTemplate.LongMedia && note.qData.stage === QueueNoteStage.Unstarted))

        return notes
    }

    private async getDueNoteQuickly(): Promise<QueueNote | null> {
        let dueNote: QueueNote | null = null

        // the following is a bit cheese, but it ensures that we randomly get due files
        // from the whole vault, not always from the same part of the file list
        const allFiles = getAllMdFiles();
        const randomStartingIndex = getRandomInt(0, allFiles.length - 1)
        const allFilesFromStartingIndexAndAddedToTheEndAgain = allFiles.slice(randomStartingIndex).concat(allFiles)

        for (const file of allFilesFromStartingIndexAndAddedToTheEndAgain) {
            const note = await QueueNoteFactory.createNoteFromFile(file)
            if (note) {
                dueNote = note
                break
            }
        }
        return dueNote
    }

}

