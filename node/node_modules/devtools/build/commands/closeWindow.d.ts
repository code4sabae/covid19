import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Close Window command closes the current top-level browsing context.
 * Once done, if there are no more top-level browsing contexts open,
 * the WebDriver session itself is closed.
 *
 * @alias browser.closeWindow
 * @see https://w3c.github.io/webdriver/#dfn-close-window
 */
export default function closeWindow(this: DevToolsDriver): Promise<string>;
//# sourceMappingURL=closeWindow.d.ts.map