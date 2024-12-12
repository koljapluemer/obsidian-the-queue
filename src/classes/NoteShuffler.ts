import { getRandomInt, pickRandom } from "src/utils/arrayUtils"
import { QueueMediator } from "./QueueMediator"
import { QueueNote } from "./QueueNote"
import { QueueNoteTemplate } from "src/types"
import { getAllMdFiles } from "src/helpers/vaultUtils"

export class NoteShuffler {
    mediator: QueueMediator
    notes: QueueNote[] = []

    constructor(mediator: QueueMediator) {
        this.mediator = mediator
        mediator.noteShuffler = this
    }

    public async getDueNote(): Promise<QueueNote | null> {
        return await this.getDueNoteQuickly()
    }

    // async loadNotes() {
    //     const allFiles = getAllMdFiles();
    //     this.notes = await getNotesFromFiles(allFiles)
    // }

    // getRandomDueNote(): QueueNote | null {
    //     const noteTemplates = [QueueNoteTemplate.Learn, QueueNoteTemplate.Learn, QueueNoteTemplate.Todo, QueueNoteTemplate.Habit, QueueNoteTemplate.Check, QueueNoteTemplate.ShortMedia, QueueNoteTemplate.LongMedia, QueueNoteTemplate.Misc]
    //     let templateToPick: QueueNoteTemplate | null

    //     templateToPick = pickRandom(noteTemplates)

    //     const nrDueLearns = notes.filter(note => note.template === QueueNoteTemplate.Learn && note.stage === QueueNoteStage.Ongoing && isNoteDue(note)).length
    //     const nrActiveLongMedia = notes.filter(note => note.template === QueueNoteTemplate.LongMedia && note.stage === QueueNoteStage.Ongoing).length
    //     // TODO: hook up magic numbers to settings instead
    //     const allowNewLearns = nrDueLearns < 20
    //     const allowNewLongMedia = nrActiveLongMedia < 5
    //     console.info('ongoing learn notes currently due:', nrDueLearns)
    //     const simplyAllDueNotes = notes.filter(note => isNoteDue(note, allowNewLearns, allowNewLongMedia))
    //     const notesWithDesiredTemplate = simplyAllDueNotes.filter(note => note.template === templateToPick)
    //     return pickRandom(notesWithDesiredTemplate) || pickRandom(simplyAllDueNotes) || null
    // }

    private async getDueNoteQuickly(): Promise<QueueNote | null> {
        let dueNote: QueueNote | null = null

        // the following is a bit cheese, but it ensures that we randomly get due files
        // from the whole vault, not always from the same part of the file list
        const allFiles = getAllMdFiles();
        const randomStartingIndex = getRandomInt(0, allFiles.length - 1)
        const allFilesFromStartingIndexAndAddedToTheEndAgain = allFiles.slice(randomStartingIndex).concat(allFiles) 

        for (const file of allFilesFromStartingIndexAndAddedToTheEndAgain) {
            const note = await QueueNote.createNoteFromFile(file)
            if (note) {
                dueNote = note
                break
            }
        }
        return dueNote
    }
}