# Obsidian — The Queue


There is no point in creating notes you never see again! 

*The Queue* is a plugin for [Obsidian.md]() that shows you random notes from your vault, one at a time. You can configure your notes to function as habits, flashcards, iterative reading prompts, to-dos and more.

<!-- explain the floating bar -->

> [!NOTE]  
> You are reading the documentation of The Queue 2, an all-new version recently released.
> I implemented some fundamental changes.
> If you're looking for the old documentation, see [here](OLD_README.md).


## What *The Queue* can help you with

1. Overcoming favorite & forget
2. Gradually building up a genuine Zettelkasten
3. Low-friction iterative reading
4. Spaced Repetition flashcard learning
5. Getting through to-do lists without being overwhelmed
6. Building & tracking habits (a lot of them, if you want)
7. Intersperse boring or unpleasant work with fun and enjoyment
8. Serendipitously discover connections between your notes
9. Improving your PKM in a gradual, natural way

## Installation

### As Community Plugin

*The Queue* is available as a community plugin, so you can install it like every other plugin.

### Manual

1. Download this repository as a `.zip` file and unzip
2. Locate your Obsidian plugin folder and copy the project folder there
3. Activate `The Queue` in your Community Plugins tab in your Obsidian Settings

If any of these steps cause you trouble, refer to *Method 2* in [this excellent installation guide](https://www.makeuseof.com/install-obsidian-plugins/).


## Get Started

1. Select the little $ICON in your ribbon. (![queue icon](doc/img/queue.png))
2. You are in your queue, have fun!

## Usage, Features and Functionality

### Frontmatter Settings

1. *The Queue* always shows one of your notes at a time
2. How exactly your note is treated is depending on its *frontmatter* (also called *metadata*)

If you never heard of frontmatter, I recommend [this excellent introduction](https://notes.nicolevanderhoeven.com/obsidian-playbook/Using+Obsidian/03+Linking+and+organizing/YAML+Frontmatter). 

<!-- ALL STUFF IS IN THE q OBJ -->


Below is an example note with all properties that *The Queue* can interpret.


<!-- TABLE -->

Again, all of these properties are optional. You can set some, all or none of them. For examples, this is also a completely valid note that will be understood by *The Queue*:

<!-- MINIMAL EXAMPLE -->

Which properties you need depends highly on what kind of note you are creating (as determined by `template`). In the next chapter, you will learn about all the different types of notes in *The Queue*. 


### Types of Notes

<!-- TABLE -->

<!-- One by one -->


## Credit

This ongoing project is the culmination of quite a few years of researching and tinkering. As such, it incorporates uncountable ideas, approaches, tools and concepts that others have built. I could not possibly name (or even remember) all of them, so here is a non-exhaustive list of the most integral sources that enabled me to create this:

1. [Obsidian.md](https://obsidian.md/), which is not only the software this is built upon but also how I organize my thinking around it.
2. [Piotr Wozniak's writing](https://supermemo.guru), which gave me many pointers on Spaced Repetition, iterative reading and more.
3. [ebisu](https://github.com/fasiha/ebisu.js), the algorithm that flashcards used to be based on.
4. [FSRS](https://github.com/open-spaced-repetition/ts-fsrs), the new flashcard algo.
4. The writings of Cal Newport, Niklas Luhmann, James Clear, Jeff Olson, Maxwell Maltz, Mihaly Csikszentmihalyi and many others, who all influenced my thinking about note-taking, productivity, learning and habits.
5. The folder settings' code is inspired by [Templater](https://github.com/SilentVoid13/Templater/blob/0596dc2c756e8c581d55ca3fd897abcb01f6c271/src/settings/suggesters/FolderSuggester.ts), which in turn credits [Liam's Periodic Notes Plugin](https://github.com/liamcain/obsidian-periodic-notes)

## Running Locally & Contributing

Pull requests are always welcome — for ideas, complaints, feature requests or software patches.

There are no specific guidelines for contributing as of now; be pleasant and kind.

Detailed instructions for running the project locally are still pending, however this is just a basic `ts` project. Cloning it locally, installing dependencies with `npm i` and then running it with `npm run dev` should work fine. To use it in Obsidian, you have to put the project folder in your plugin folder.

To start hacking away at the plugin, check `DOC.md` for a brief introduction on where to find what functionality.

If you have any trouble, please open an issue. Cheerz!
