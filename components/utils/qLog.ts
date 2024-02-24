export function saveQLog() {
    // TODO: design function header etc.
    // or maybe make this a class, idk (overengineering or data quality?)
	// save to localstorage q-log
	const qLog = JSON.parse(localStorage.getItem(`q-log-${app.appId}`)!);
	qLog.push({
		noteName: note.name,
		answer: answer,
		time: new Date(),
		noteMetadata: frontmatter,
	});
	localStorage.setItem(`q-log-${app.appId}`, JSON.stringify(qLog));
}
