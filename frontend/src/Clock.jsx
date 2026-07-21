/**
 * <Clock /> — a small live-updating date/time display, shown in the header.
 * Ticks every second via setInterval and cleans the interval up on unmount
 * so it doesn't keep running (and leaking) after the component is removed.
 */
import { useEffect, useState } from "react";
import "./Clock.css";

export default function Clock() {
    // Start with the real current time immediately (not null/undefined) so
    // there's no flash of empty content on first render.
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        // Tick once a second. A 1000ms interval is precise enough for a
        // display clock — no need for anything faster.
        const timer = setInterval(() => setNow(new Date()), 1000);

        // Cleanup: clear the interval when the component unmounts, otherwise
        // it keeps firing in the background and calling setState on an
        // unmounted component (a classic React memory-leak warning).
        return () => clearInterval(timer);
    }, []); // empty deps — set the interval up once, not on every render

    const time = now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const date = now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="th-clock" aria-live="off">
            <span className="th-clock-time">{time}</span>
            <span className="th-clock-date">{date}</span>
        </div>
    );
}
