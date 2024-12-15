- add stats to flex on myself
    - goal 1: something that ties into my existing plotting thing so I can see where I'm at


- bugs:
	- appears to be trouble with articles, not due, `Show Next`
	- something wrong with checks? buttons not loaded?
	- also learnign cards should probably not removed from queue, they may be done immediately or anyways much before reload...
	- starting from empty editor still loads last file's bar
	- counter of due learn cards in NoteShuffler is SIMPLY NOT GOING DOWN (except by reloading q)
		- for some reason the note shuffler still has the old note data saved...some mutability problem...
		- ok, think I have it: ActiveNoteManager is creating its own notes, they have nothing to do with the note list...
	- is *not* starting a learning note handled correctly? think not
- notes that are deleted should be removed from this.notes
- prevent last note immediately being picked again

## Ideas

- glob style folder exclusions?
- temp filter?
- keyboard/command support?
