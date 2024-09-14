import { Plugin, WorkspaceLeaf, TFile } from "obsidian";
import { QueueView } from "./views/QueueView";
import { getRandomFile } from "./utils/helpers";

export default class QueuePlugin extends Plugin {
	async onload() {
		console.log("Loading QueuePlugin...");

		// Register a new ribbon button
		this.addRibbonIcon(
			"dice",
			"Open Random Note in QueueView",
			async () => {
				// Get or create a new QueueView
				const leaf = this.app.workspace.getLeaf(false);
				const randomFile = getRandomFile(this.app.vault);

				if (randomFile) {
					const file = await randomFile;
					if (file) {
						leaf.openFile(file);
						leaf.setViewState({
							type: "queue",
							state: { file: randomFile.path },
						});
					}
				}
			}
		);

		// Register the custom QueueView
		this.registerView(
			"queue",
			(leaf: WorkspaceLeaf) => new QueueView(leaf, new TFile())
		);
	}

	onunload() {
		console.log("Unloading QueuePlugin...");
		this.app.workspace.detachLeavesOfType("queue");
	}
}
