export default class QueueLog {
	createdAt: Date;
	logData: any;
	logType: string;

	constructor(logType: string, logData: any) {
		this.createdAt = new Date();
		this.logData = logData;
		this.logType = logType;
	}

	static logs: QueueLog[] = [];
	/**
	 * get the saved log data from localStorage, should be triggered onLoad() of the app
	 * @param parentVaultId globally accessible id for the vault, we're using this to distinguish between different vault's logs
	 */
	static loadFromLocalStorage() {
		// load from local storage
		// check for `q-logs-${parentVaultId}` in local storage
		// if it exists, parse it and set logs to it
		// if it doesn't exist, set logs to []
		const parentVaultId = (app as any).appId;
		const logData = localStorage.getItem(`q-logs-${parentVaultId}`) ?? "[]";
		const parsedLogData = JSON.parse(logData);
		QueueLog.logs = parsedLogData;
	}

	static saveToLocalStorage() {
		// save to local storage
		// stringify logs and save it to `q-logs-${parentVaultId}`
		const parentVaultId = (app as any).appId;
		localStorage.setItem(
			`q-logs-${parentVaultId}`,
			JSON.stringify(QueueLog.logs)
		);
	}

	static addLog(logType: string, logData: any) {
		const log = new QueueLog(logType, logData);
		QueueLog.logs = [log, ...QueueLog.logs];
		QueueLog.saveToLocalStorage();
	}

    static resetLogs() {
        const parentVaultId = (app as any).appId;
        localStorage.setItem(
            `q-logs-${parentVaultId}`,
            JSON.stringify([])
        );
        QueueLog.logs = [];
    }
}
