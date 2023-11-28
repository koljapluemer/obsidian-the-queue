## Large Scale

* check if this works with fresh vault, and with all kinds of incomplete data!
* find a way to do automated tests
    1. take out the obsidian surroundings
    2. unrandomize the random

* bring back the *excuses* or/and *what would you be willing to do instead*
* implement priority
* handle the fact that notes may be dirty in a million trillion ways (validate cards, essentially), and have elegant fallbacks
* log data somehow (if only for self-analysis)
    * does not have to be in note metadata, I *can* filedump (or even just localstorage, I do have a browser essentially) 

## Small Scale

* at least for habit, stop the 16h hack and go for 4am (?)
* document how the program works lol
- shit is being selected that is definitely not due (not just the same card again) [argh]
* there is a function to only allow 12 new learn cards per session, however that resets when the modal is closed (which is all the time)
    * make a smarter function here: 
        1. some kind of running head array storing the time of the last n new learn cards 
        2. then see how many of those are w/in a critical time period