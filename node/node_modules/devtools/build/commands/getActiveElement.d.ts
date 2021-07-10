import type DevToolsDriver from '../devtoolsdriver';
/**
 * Get Active Element returns the active element of the current browsing context’s document element.
 *
 * @param browser.getActiveElement
 * @see https://w3c.github.io/webdriver/#dfn-get-active-element
 * @return {Object}       A JSON representation of an element object.
 */
export default function getActiveElement(this: DevToolsDriver): Promise<import("@wdio/protocols").ElementReference | Error>;
//# sourceMappingURL=getActiveElement.d.ts.map