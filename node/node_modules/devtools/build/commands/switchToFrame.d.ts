import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Switch To Frame command is used to select the current top-level browsing context
 * or a child browsing context of the current browsing context to use as the current
 * browsing context for subsequent commands.
 *
 * @alias browser.switchToFrame
 * @see https://w3c.github.io/webdriver/#dfn-switch-to-frame
 * @param {string|object|null} id  one of three possible types: null: this represents the top-level browsing context (i.e., not an iframe), a Number, representing the index of the window object corresponding to a frame, an Element object received using `findElement`.
 */
export default function switchToFrame(this: DevToolsDriver, { id }: {
    id: string;
}): Promise<{
    id: null;
} | {
    id: string;
}>;
//# sourceMappingURL=switchToFrame.d.ts.map