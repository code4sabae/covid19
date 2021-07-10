import type DevToolsDriver from '../devtoolsdriver';
/**
 * Create a new top-level browsing context.
 *
 * @alias browser.createWindow
 * @see https://w3c.github.io/webdriver/#new-window
 * @param {string} type  Set to 'tab' if the newly created window shares an OS-level window with the current browsing context, or 'window' otherwise.
 * @return {object}      New window object containing 'handle' with the value of the handle and 'type' with the value of the created window type
 */
export default function createWindow(this: DevToolsDriver, { type }: {
    type: 'window' | 'tab';
}): Promise<{
    handle: string | undefined;
    type: "tab" | "window";
}>;
//# sourceMappingURL=createWindow.d.ts.map