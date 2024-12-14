import { QueueMediator } from "./QueueMediator"
import { QueueNote } from "../models/QueueNote"
import { QueueNoteStage, QueueNoteTemplate } from "src/types"
import { getAllMdFiles } from "src/helpers/vaultUtils"
import { getRandomInt, pickRandom } from "src/helpers/arrayUtils"
import { StreakManager } from "./StreakManager"
import { QueueNoteFactory } from "src/models/NoteFactory"

// knows the notes
// when asked, produces a random note (probably to open it)
export class NoteShuffler {
    mediator: QueueMediator
    notes: QueueNote[] = []
    streakManager: StreakManager
    notesCurrentlyLoading = false

    constructor(mediator: QueueMediator) {
        this.mediator = mediator
        mediator.noteShuffler = this
        this.streakManager = new StreakManager()
    }

    public async getDueNote(): Promise<QueueNote | null> {
        let note: QueueNote | null
        if (this.notes.length > 0) {
            note = this.getDueNoteFromAllNotes()
        } else {
            note = await this.getDueNoteQuickly()
        }
        if (note) this.streakManager.onNoteWasPicked(note.qData)
        return note
    }

    public requestLoadingNotes() {
        if (!this.notesCurrentlyLoading) {
            this.notesCurrentlyLoading = true
            this.loadNotes()
        } else {
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
            console.info('Finished loading notes:', notes.length)
            this.notes = notes
        } catch (error) {
            console.error('Error loading notes:', error);
        }
        this.notesCurrentlyLoading = false
    }

    private getDueNoteFromAllNotes(): QueueNote | null {

        const templateToPick = this.getRandomTemplateToPick()
        console.info('loaded notes', this.notes.length)
        const notesToPickFrom = this.decideWhichNotesToPickFrom()

        const simplyAllDueNotes = notesToPickFrom.filter(note => note.isDue())
        console.info('notes after only due', simplyAllDueNotes.length)
        const notesWithDesiredTemplate = simplyAllDueNotes.filter(note => note.qData.template === templateToPick)
        console.info('notes due with desired template', notesWithDesiredTemplate.length)

        // return a note with desired template, if we have none, return any due note
        // TODO: if we have none at all, also allow just any misc
        let noteToPick = pickRandom(notesWithDesiredTemplate) 
        console.log('note to pick from des. template', noteToPick)
        if (!noteToPick) {
            noteToPick = pickRandom(simplyAllDueNotes)
            console.log('no note w/ desired template, now got', noteToPick) 
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
        const ongoingLearns = this.notes.filter(note => note.qData.template === QueueNoteTemplate.Learn && note.qData.stage === QueueNoteStage.Ongoing)
        const nrDueLearns = ongoingLearns.filter(note => note.isDue()).length
        const exludeUnstartedLearns = nrDueLearns > 20

        const nrActiveLongMedia = this.notes.filter(note => note.qData.template === QueueNoteTemplate.LongMedia && note.qData.stage === QueueNoteStage.Ongoing).length
        const exludeUnstartedLongMedia = nrActiveLongMedia > 5
        console.info('excl new learns', exludeUnstartedLearns, 'excl new longmedia', exludeUnstartedLongMedia)
        let notes = this.notes
        if (exludeUnstartedLearns) notes = notes.filter(note => !(note.qData.template === QueueNoteTemplate.Learn && note.qData.stage === QueueNoteStage.Unstarted))
        console.info('notes after (maybe) exl new learn', notes.length)
        if (exludeUnstartedLongMedia) notes = notes.filter(note => !(note.qData.template === QueueNoteTemplate.LongMedia && note.qData.stage === QueueNoteStage.Unstarted))
        console.info('notes after (maybe) exl new longmedia', notes.length)

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

