
  🔴 CRITICAL (Fix Immediately)

  1. Duplicate unreachable case statements - QueueNoteTodo.ts, QueueNoteShortMedia.ts, QueueNoteLongMedia.ts
    - Same case QueueButton.Finished: appears twice in switch statements
    - Second occurrence is dead code, never executed
  2. Version mismatch - package.json (2.0.2) vs manifest.json (2.0.3)
  3. Unused class property - QueueMediator.streakManager declared but never used
  4. Empty placeholder file - src/helpers/fsrsUtils.ts (only has TODO comment)
  5. Dead class - QueuePluginSettingsTab fully implemented but never instantiated anywhere

  🟠 DEAD CODE (Verified Unused)

  1. shuffleArray<T>() - src/helpers/arrayUtils.ts:17 - Exported but never imported
  2. getUniqueArray<T>() - src/helpers/arrayUtils.ts:31 - Exported but never imported
  3. QueueMediator.streakManager - Declared but never initialized or used
  4. isDue() parameters - QueueNoteExclude.ts:12 - Parameters defined but ignored in body
  5. Test file - tests/pickingNotes.test.ts - Only commented code, no actual tests

  🟡 CODE SMELLS

  1. God Class - NoteShuffler (179 lines, too many responsibilities)
    - Handles: loading, filtering, streaming, stats, file watching, business logic
    - Should be split into smaller focused classes
  2. "Cheese" algorithm - NoteShuffler.getDueNoteQuickly() lines 159-176
    - Overly complex array slicing/concatenation for random sampling
    - Author admits it's hacky in comments
  3. Complex conditionals - NoteShuffler.filterForNotesWithTemplate() lines 100-126
    - Deep nested logic with special cases
    - Violates Open/Closed Principle
  4. Terrible variable name - noteToExcludeBecauseWeJustHadIt
    - Should be lastPickedNote or recentlyShownNote
  5. Magic numbers - NoteShuffler lines 149, 152
    - Hard-coded 20 and 5 with no constants or explanation
  6. Type safety suppressed - vaultUtils.ts lines 41, 49
    - @ts-ignore comments bypass TypeScript checks
    - Indicates poor type design

  🟤 HALF-IMPLEMENTED FEATURES

  1. History tracking incomplete - QueueNote.addScoreToHistory() line 31
    - TODO says to store button history, but only stores timestamp
    - Method name is misleading
  2. Settings tab - QueuePluginSettingsTab lines 4-28
    - Entire display() method commented out with "TODO: build"
  3. Legacy cleanup - vaultUtils.deletePropertiesWithOldPrefix() line 73
    - TODO says should be behind settings toggle, but is automatic
  4. Missing fallback - NoteShuffler line 90
    - TODO for misc note fallback not implemented
  5. Empty test file - Only placeholder comments

  🔵 LEGACY PATTERNS

  1. Legacy frontmatter support - frontmatterReaders.ts lines 66-141
    - Entire parallel code path for old format (q-type, q-data vs q.template)
    - Technical debt maintaining two systems
  2. Old type mappings - Lines 74-98
    - Maps 'learn-started', 'book-started', 'article' to new enums
  3. Throw string anti-pattern - QueueNote.score() line 43
    - throw "string" instead of throw new Error()
    - Loses stack traces, can't be properly typed

  ⚠️ ANTI-PATTERNS

  1. Circular dependencies - QueueMediator pattern
    - Mediator sets mediator.queueBar = this creating circular refs
    - Memory leak potential
  2. Global mutable state - pluginContext.ts lines 10-23
    - Module-level singleton with no encapsulation
    - Makes testing impossible
  3. Side effects in constructor - NoteShuffler lines 26-42
    - Registers event handlers in constructor
    - Violates constructor best practices
  4. Duplicate case statements - Multiple files
    - Unreachable dead code from copy-paste errors
  5. Swallowed errors - vaultUtils.getFrontmatterOfFile() lines 9-21
    - Catches errors, logs them, returns null
    - Caller can't distinguish "no data" from "error"
  6. Inconsistent error handling
    - Some throw, some log and continue, some ignore
    - No coherent error strategy

  📊 INCONSISTENCIES

  1. Button naming chaos - types.ts QueueButton enum
    - Mixed styles: "RegisterRep" vs "Register repetition"
  2. Unsafe null handling - arrayUtils.pickRandom() can return null
    - But NoteShuffler:134 uses ! to assert non-null
  3. Stage handling varies - Different note types use stages differently
    - Learn/Todo/Media use stages, Habit/Check ignore them
  4. Mixed comment styles - Some JSDoc, some inline, most none
  5. Due date semantics - undefined means "due now" (implicit behavior)
  6. Version mismatch - Already noted as critical

