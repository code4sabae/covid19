import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Get Current URL command returns the URL of the current top-level browsing context
 *
 * @alias browser.getUrl
 * @see https://w3c.github.io/webdriver/#dfn-get-current-url
 * @returns {String} current document URL of the top-level browsing context.
 */
export default function getUrl(this: DevToolsDriver): Promise<string>;
//# sourceMappingURL=getUrl.d.ts.map