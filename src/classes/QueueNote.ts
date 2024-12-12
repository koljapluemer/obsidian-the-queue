import { TFile } from "obsidian"
import { getNoteDataFromFrontmatter, getNoteDataFromFrontmatterWithLegacyParadigm } from "src/helpers/frontmatterReaders"
import { getFrontmatterOfFile } from "src/helpers/vaultUtils"
import { QueueButton, QueueNoteData, QueueNoteStage, QueueNoteTemplate } from "src/types"

// every TFile may be converted to a QueueNote,
// which holds the actual properties that interests us directly
// (e.g. the interval, or the template)
// has a million methods used by other classes related to interactiong
// w/ a singular note
export class QueueNote {
    file: TFile
    qData: QueueNoteData
    constructor(file: TFile, qData: QueueNoteData) {
        this.file = file;
        this.qData = qData
    }

    public static async createNoteFromFile(file: TFile): Promise<QueueNote> {
        const frontmatter = await getFrontmatterOfFile(file)
        let qData: QueueNoteData
        // check if note is already written in the new paradigm
        if (frontmatter["q"]) {
            qData = getNoteDataFromFrontmatter(frontmatter)
        } else {
            qData = getNoteDataFromFrontmatterWithLegacyParadigm(frontmatter)
        }

        const note = new QueueNote(file, qData)
        return note
    }

    public getButtons(): QueueButton[] {
        switch (this.qData.template) {
            case QueueNoteTemplate.Habit:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done]
            case QueueNoteTemplate.Learn:
                return [QueueButton.Wrong, QueueButton.Hard, QueueButton.Correct, QueueButton.Easy]
            case QueueNoteTemplate.Todo:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
            case QueueNoteTemplate.Check:
                return [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]
            case QueueNoteTemplate.ShortMedia:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
            case QueueNoteTemplate.LongMedia:
                return [QueueButton.NotToday, QueueButton.Later, QueueButton.Done, QueueButton.Finished]
            case QueueNoteTemplate.Exclude:
                return [QueueButton.ShowNext]
            default:
                return [QueueButton.ShowLess, QueueButton.ShowNext, QueueButton.ShowMore]
        }
    }

    public isDue(allowNewLearns = false, allowNewLongMedia = false): boolean {
        if (!allowNewLearns && this.qData.template === QueueNoteTemplate.Learn && this.qData.stage !== QueueNoteStage.Ongoing) {
            return false
        }
        if (!allowNewLongMedia && this.qData.template === QueueNoteTemplate.LongMedia && (!(this.qData.stage === QueueNoteStage.Ongoing || this.qData.stage === QueueNoteStage.Finished))) {
            return false
        }
        let isDue = true
        if (this.qData.due) {
            isDue = this.qData.due < new Date()
        }
        return isDue
    }



}
