import { getNoteFromString } from "../queueNoteUtils"
import { mdLearnEgBenefitFromOg, noteLearnEgBenefitFromOg } from "./data/learnEgBenefitFrom"

test(`legacy learn note parses correctly`, () => {
    expect(
        getNoteFromString(mdLearnEgBenefitFromOg)
    ).toEqual(noteLearnEgBenefitFromOg)
})