import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Get Window Rect command returns the size and position on the screen of the operating system window
 * corresponding to the current top-level browsing context.
 *
 * @alias browser.getWindowRect
 * @see https://w3c.github.io/webdriver/#dfn-get-window-rect
 * @return {object}  A JSON representation of a "window rect" object. This has 4 properties: `x`, `y`, `width` and `height`.
 */
export default function getWindowRect(this: DevToolsDriver): Promise<{
    width: number;
    height: number;
    x: number;
    y: number;
}>;
//# sourceMappingURL=getWindowRect.d.ts.map