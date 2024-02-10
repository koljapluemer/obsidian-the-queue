## Large Scale

* check if this works with fresh vault, and with all kinds of incomplete data!
* find a way to do automated tests
    1. take out the obsidian surroundings
    2. unrandomize the random

    1. or: start unit testing what can be tested easily with [this guide](https://www.freecodecamp.org/news/how-to-start-unit-testing-javascript/)

* maybe the *excuses* or/and *what would you be willing to do instead*
* implement priority
* handle the fact that notes may be dirty in a million trillion ways (validate cards, essentially), and have elegant fallbacks
* log data somehow (if only for self-analysis)
    * does not have to be in note metadata, I *can* filedump (or even just localstorage, I do have a browser essentially) 
    - think I started doing that, no?

## Small Scale


* way too many fucking new learn cards being introduced
    * there is a function to only allow 12 new learn cards per session, however that resets when the modal is closed (which is all the time)
        * make a smarter function here: (*or replace*)
            1. some kind of running head array storing the time of the last n new learn cards 
            2. then see how many of those are w/in a critical time period
    - approach:
        1. get an overview how many active learning cards there are, and what their half life is
        2. somehow use this heuristic to inform introduction of new cards
* check for wrong q-label `book` - some random internet links that are new have it, may be the bookmark importer
* at least for habit, stop the 16h hack and go for 4am (?)
* again, we're getting too many books even tho started books exceeds 5
    - strangely, this happened only once
* document how the program works lol
- shit is being selected that is definitely not due - check if this is now fixed, maybe it was just books (condition missing there)
    - may be because stuff is async, including the function that filters cards that are due?
        - would also explain why the queue filter is also working, but delayed...

* when queue is filtered, sometimes it takes a note selection or two until effects show up (?!)
* keywordFilter not being updated instantly, but on reloading reopening?! 
    - core problem is I don't understand js variables, lmao
* some error when completing todos (todo is deleted, but it causes lag and error msg)
