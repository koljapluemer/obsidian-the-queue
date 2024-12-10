import { getQueueNoteFromString } from "src/utilities/queueNoteUtils"
import { mdLearnEgBenefitFromOg, noteLearnEgBenefitFromOg } from "./data/learnEgBenefitFrom"

test(`legacy learn note parses correctly`, () => {
    expect(
        getQueueNoteFromString(mdLearnEgBenefitFromOg)
    ).toEqual(noteLearnEgBenefitFromOg)
})