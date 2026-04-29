import { startOfWeek, subWeeks, setHours, setMinutes, isAfter, addWeeks } from 'date-fns';

// Configuration: Closes Sunday (day 0) at 23:00
const CLOSE_DAY = 0; // Sunday
const CLOSE_HOUR = 23;
const CLOSE_MINUTE = 0;

interface DateRange {
    start: Date;
    end: Date;
}

export function getCurrentCommunityRange(now = new Date()): DateRange {
    // 1. Get the Sunday of the current week (defaults to start of week being Sunday)
    // We need to be careful with "startOfWeek". By default week starts on Sunday.
    const currentWeekSunday = startOfWeek(now, { weekStartsOn: 0 }); // Sunday 00:00

    // 2. Set it to close time (Sunday 23:00)
    const currentWeekClose = setMinutes(setHours(currentWeekSunday, CLOSE_HOUR), CLOSE_MINUTE);

    // 3. Logic:
    // If we are AFTER Sunday 23:00, the "Current Community" started this Sunday 23:00 and ends next Sunday 23:00.
    // If we are BEFORE Sunday 23:00, the "Current Community" started LAST Sunday 23:00 and ends this Sunday 23:00.

    if (isAfter(now, currentWeekClose)) {
        // We are e.g. on Monday, or Sunday 23:01.
        // Cycle Started: This Sunday 23:00
        // Cycle Ends: Next Sunday 23:00
        return {
            start: currentWeekClose,
            end: addWeeks(currentWeekClose, 1)
        };
    } else {
        // We are e.g. on Friday, or Sunday 20:00.
        // Cycle Started: Last Sunday 23:00
        // Cycle Ends: This Sunday 23:00
        return {
            start: subWeeks(currentWeekClose, 1),
            end: currentWeekClose
        };
    }
}

export function getPastCommunityRange(now = new Date()): DateRange {
    // The past community is simply the one before the current one.
    const currentRange = getCurrentCommunityRange(now);
    return {
        start: subWeeks(currentRange.start, 1),
        end: currentRange.start
    };
}
