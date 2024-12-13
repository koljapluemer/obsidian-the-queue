export function dateTomorrow3Am(): Date {
    return dateInNrOfDaysAt3Am(1)
}


export function dateInNrOfDaysAt3Am(days:number): Date {
    const now = new Date()
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + days);
    futureDate.setHours(3, 0, 0, 0);
    return futureDate
}


export function dateTenMinutesFromNow(): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    return now;
}
