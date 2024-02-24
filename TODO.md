- next up
    0. check Telegram
    1. start a `utils` folder and put in function becaue `TheQueueModal` is still cursed (700 lines, most having not too much to do with the actual modal)
    2. document it, at this point could even consider automating it, given that I have actual function and class headers and what not
        - get into contracts?
    3. write a generator that at least covers one card of every type
        - a test vault for manual testing is already good automation, full auto testing can come later
        - also, test idea: *generate cards with data and then assert that correct nr. of cards is in this and that card array, like `dueMisc` etc. etc.*
- would love the ability to show non-note cards (would be fun at least)
    - or maybe that's shit?
    - but maybe convenient for *oops that last one was a leech* and stuff like that
* check if this works with fresh vault, and with all kinds of incomplete data!
* find a way to do automated tests
    1. take out the obsidian surroundings
    2. unrandomize the random

    1. or: start unit testing what can be tested easily with [this guide](https://www.freecodecamp.org/news/how-to-start-unit-testing-javascript/)

* implement priority
    - started in `utils/priority_sandbox.py` (project with Nate)
* handle the fact that notes may be dirty in a million trillion ways (validate cards, essentially), and have elegant fallbacks
* document how the program works lol
- implement leech check
    - could use my existing log to kickstart with a little bit of scripting
    - could hide away in a variable in q-data.model or something
- calendar functionality
    - start with birthdays
- elegant way to handle first-time learn cards
- implement house cleaning into the-q
    - *adopt this orphan* would be an obvious start...
    - or a regex or whatever or a `[[]]` or a `#` with *this needs improvement*
* check for wrong q-label `book` - some random internet links that are new have it, may be the bookmark importer
* at least for habit, stop the 16h hack and go for 4am (?)
    - core problem is I don't understand js variables, lmao
* some error when completing todos (todo is deleted, but it causes lag and error msg)
- make *Show Less Often* influence prio, not interval
- when note is renamed when editing from q, there is an error msg when reopening
    - does nothing bad but not elegant either
- *Marta*: Skip trivially easy cards
    - first, improve tracking and do an hour of cramming with some small dataset
- account for the case that learn cards are really easy, but we don't have new learn cards 
    - in that case we may want to learn some easy cards, or maybe not
- deal with the weird global variables
    - especially the one that saves a setting that should be accessible anyways
- add notices
- optional: pass current keyword filter into QueueFilterModal so that it can be preselected
- special treatment of new learn cards
- fix `Component`-related error that console throws
- don't set useless properties, like `q-interval` for learn cards
    - I think we need some better abstractions here, maybe even a class representation for QCards or something
- allow less silly formatted learn cards
- bug: we get same card again with learn cards (probably some `last-seen` problem)
- make log work again
- actual prio selection