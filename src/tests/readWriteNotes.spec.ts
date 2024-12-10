import { getNoteFromString } from "../queueNoteUtils"
import { mdLearnEgBenefitFromOg, noteLearnEgBenefitFromOg, yamlLearnEgBenefitFromOg } from "./data/learnEgBenefitFrom"

test(`legacy learn note parses correctly`, () => {
    expect(
        getNoteFromString(mdLearnEgBenefitFromOg)
    ).toEqual(noteLearnEgBenefitFromOg)
})

test(`learn note parses correctly`, () => {
    expect(
        getNoteFromString(yamlLearnEgBenefitFromOg)
    ).toEqual(noteLearnEgBenefitFromOg)
})