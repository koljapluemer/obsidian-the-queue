import { QueueNoteData, QueueNoteTemplate } from "src/types";
import { QueueNote } from "./QueueNote";
import { TFile } from "obsidian";
import { getFrontmatterOfFile } from "src/helpers/vaultUtils";
import { getNoteDataFromFrontmatter, getNoteDataFromFrontmatterWithLegacyParadigm } from "src/helpers/frontmatterReaders";

import { QueueNoteMisc } from "./QueueNoteMisc"
import { QueueNoteHabit } from "./QueueNoteHabit"
import { QueueNoteLearn } from "./QueueNoteLearn"
import { QueueNoteTodo } from "./QueueNoteTodo"
import { QueueNoteCheck } from "./QueueNoteCheck"
import { QueueNoteShortMedia } from "./QueueNoteShortMedia"
import { QueueNoteLongMedia } from "./QueueNoteLongMedia"
import { QueueNoteExclude } from "./QueueNoteExclude"


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

    public static create(file: TFile, qData: QueueNoteData): QueueNote {
        switch (qData.template) {
            case QueueNoteTemplate.Habit:
                return new QueueNoteHabit(file, qData)
            case QueueNoteTemplate.Learn:
                return new QueueNoteLearn(file, qData)
            case QueueNoteTemplate.Todo:
                return new QueueNoteTodo(file, qData)
            case QueueNoteTemplate.Check:
                return new QueueNoteCheck(file, qData)
            case QueueNoteTemplate.ShortMedia:
                return new QueueNoteShortMedia(file, qData)
            case QueueNoteTemplate.LongMedia:
                return new QueueNoteLongMedia(file, qData)
            case QueueNoteTemplate.Exclude:
                return new QueueNoteExclude(file, qData)
            case QueueNoteTemplate.Misc:
                return new QueueNoteMisc(file, qData)
        }
    }
}