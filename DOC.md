# Documentation

## Structure

Everything worth noting happens in `main.ts`.

### Files

#### main.ts

We're essentially doing nothing but setting up a modal. The plugin's `onload()` loads it and created a button for it.

`ExampleModel` then (could be renamed) sets up some variables, which are mostly filled in the `constructor`. There, we first get all files from the vault, immediately filtering any with the tag `#inactive`.

The next section is dedicated to books. We want only 5 books active at a time (make this a setting at some point). That makes the random selection process quite different, so we save them in `this.startedBookNotes`. A started book is both a `#book` and posesses the tag `#started`. This is the first filter. If that yields less than 5 books, add one to the ephemeral list of `this.startedBookNotes`.