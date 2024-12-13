export function dateTomorrow3Am(): Date {
    const now = new Date()
    const nextDay = new Date(now);
    nextDay.setDate(now.getDate() + 1);
    nextDay.setHours(3, 0, 0, 0);
    return nextDay
}


export function dateTenMinutesFromNow(): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    return now;
}
