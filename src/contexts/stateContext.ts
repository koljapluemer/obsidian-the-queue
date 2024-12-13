
export interface QueueState {
    allowUnstartedLearnNotes: boolean,
    allowUnstartedLongMediaNotes: boolean
}

let context: QueueState = {
    allowUnstartedLearnNotes: false,
    allowUnstartedLongMediaNotes: false
}

export function setQueueState(allowUnstartedLearnNotes: boolean, allowUnstartedLongMediaNotes: boolean): void {
    context = {
        allowUnstartedLearnNotes: allowUnstartedLearnNotes,
        allowUnstartedLongMediaNotes: allowUnstartedLongMediaNotes
    }
}


export function getPluginContext(): QueueState {
    if (!context) {
        throw new Error("Queue state context not set")
    }
    return context
}