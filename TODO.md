### Documentation

- need some system, and need to get serious about it

1. User Documentation
    1. make the `README` passable for `gh`
2. start publishing screencasts/screenshots

### Code Quality and Friends

1. create checklist from Obsidian community guidelines 
    - fill in data on `package.json`
2. find a way to do automated tests
    1. take out the obsidian surroundings
    2. unrandomize the random
    3. or: start unit testing what can be tested easily with [this guide](https://www.freecodecamp.org/news/how-to-start-unit-testing-javascript/)


### Ideas

- would love the ability to show non-note cards (would be fun at least)
    - or maybe that's shit?
    - but maybe convenient for *oops that last one was a leech* and stuff like that
- implement leech check
    - give cool options, like splitting, adding image, making a mnemonic...
- calendar functionality
    - start with birthdays
- implement house cleaning into the-q
    - *adopt this orphan* would be an obvious start...
    - or a regex or whatever or a `[[]]` or a `#` with *this needs improvement*
- add notices (Toasts)
- dependent learn notes?
    - poetry is just *so* hard
- hook up housekeeping functionality


### Bugs and minor improvements

- make a class obj for each shown modal
    - this both solves fucky logic with `orphan` *and* notes showing up again even when renamed 
        - (no it doesn't as such)
            - maybe I need to persist data in a more sophisticated way...maybe just saving the whole `QueueNote` or something...
            - still it's good for the `orphan` problem
- optional: pass current keyword filter into QueueFilterModal so that it can be preselected
- allow less silly formatted learn cards
- make log work again
- handle broken/illegal `q-type`s
    - they get selected as `misc` anyhow but scoring just doesn't affect them
- Notes with no frontmatter break (completely blank) — embarrassing slip in test coverage
- handle `orphan` type better. Logic is all over main file, and sometimes irrelevant cards get classified as an orphan etc.