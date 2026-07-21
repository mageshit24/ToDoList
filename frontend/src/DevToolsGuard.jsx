/**
 * <DevToolsGuard /> — a pure configuration-driven deterrent that blocks the
 * right-click context menu and common DevTools keyboard shortcuts (F12,
 * Ctrl+Shift+I/J/C, Ctrl+U) when enabled. Renders nothing — there is no
 * visible on/off control in the UI; it's controlled entirely by the
 * VITE_DEVTOOLS_GUARD environment variable, set at build time.
 *
 * Important honesty check: this is a deterrent, not real security. Anyone
 * who wants to inspect the page can still do so (browser menu → DevTools,
 * disabling JS before load, viewing the deployed JS bundle directly, etc).
 * Never rely on this to actually hide anything sensitive — nothing sent to
 * the browser is truly private. Use it only for the "stop casual right-click
 * snooping" effect, not as a real access control.
 *
 * Configuration: set VITE_DEVTOOLS_GUARD=true in .env to enable.
 * Anything else (or unset) leaves it off. Changing this requires a rebuild
 * (`npm run dev` / `npm run build`) since Vite inlines env vars at build
 * time — it can't be flipped at runtime.
 */
import { useEffect } from "react";

const ENABLED = import.meta.env.VITE_DEVTOOLS_GUARD === "true";

export default function DevToolsGuard() {
    useEffect(() => {
        if (!ENABLED) return; // guard is off, don't attach any listeners

        const blockContextMenu = (e) => e.preventDefault();

        const blockDevToolsKeys = (e) => {
            const key = e.key;
            const blockedCombo =
                key === "F12" ||
                (e.ctrlKey && e.shiftKey && ["I", "J", "C", "i", "j", "c"].includes(key)) ||
                (e.ctrlKey && (key === "u" || key === "U")); // view-source shortcut

            if (blockedCombo) {
                e.preventDefault();
            }
        };

        document.addEventListener("contextmenu", blockContextMenu);
        document.addEventListener("keydown", blockDevToolsKeys);

        // Cleanup: remove both listeners on unmount (defensive — in practice
        // this component lives for the whole app lifetime).
        return () => {
            document.removeEventListener("contextmenu", blockContextMenu);
            document.removeEventListener("keydown", blockDevToolsKeys);
        };
    }, []); // ENABLED is a module-level constant, not state — never changes after mount

    return null; // no UI — this component is purely a side-effect
}
