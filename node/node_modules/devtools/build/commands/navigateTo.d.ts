import type DevToolsDriver from '../devtoolsdriver';
/**
 * The navigateTo (go) command is used to cause the user agent to navigate the current
 * top-level browsing context a new location.
 *
 * @alias browser.navigateTo
 * @see https://w3c.github.io/webdriver/#dfn-navigate-to
 * @param  {string} url  current top-level browsing context’s active document’s document URL
 * @return {string}      current document URL of the top-level browsing context.
 */
export default function navigateTo(this: DevToolsDriver, { url }: {
    url: string;
}): Promise<null>;
//# sourceMappingURL=navigateTo.d.ts.map