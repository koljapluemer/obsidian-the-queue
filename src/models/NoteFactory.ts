import { QueueNoteData, QueueNoteTemplate } from "src/types";
import { QueueNote } from "./QueueNote";
import { TFile } from "obsidian";
import { QueueNoteMisc } from "./QueueNoteMisc";
import { getFrontmatterOfFile } from "src/helpers/vaultUtils";
import { getNoteDataFromFrontmatter, getNoteDataFromFrontmatterWithLegacyParadigm } from "src/helpers/frontmatterReaders";

export class QueueNoteFactory {

    // these functions _could_ be unified into one, as in the wild we're not ever going to create
    // a QueueNote except by loading in a TFile and reading its frontmatter
    // however this separation makes it easier to unit test
    // createNoteFromFile() does the rather dirty logic of reading in frontmatter with old and new paradigm
    // and create() approaches something like an actual factory
    public static async createNoteFromFile(file: TFile): Promise<QueueNote> {
        const frontmatter = await getFrontmatterOfFile(file)
        let qData: QueueNoteData
        // check if note is already written in the new paradigm
        if (frontmatter["q"]) {
            qData = getNoteDataFromFrontmatter(frontmatter)
        } else {
            qData = getNoteDataFromFrontmatterWithLegacyParadigm(frontmatter)
        }

        const note = this.create(file, qData)
        return note
    }

    public static create(file:TFile, qData: QueueNoteData):QueueNote {
        switch(qData.template) {
            case (QueueNoteTemplate.Misc):
                return new QueueNoteMisc(file, qData)
            default:
                return new QueueNote(file, qData)
        }
    } 
}