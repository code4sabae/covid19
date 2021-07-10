import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Find Element From Element command is used to find an element from a web element
 * in the current browsing context that can be used for future commands.
 *
 * @alias browser.findElementFromElement
 * @see https://w3c.github.io/webdriver/#dfn-find-element-from-element
 * @param {string} using  a valid element location strategy
 * @param {string} value  the actual selector that will be used to find an element
 * @return {Object}       A JSON representation of an element object.
 */
export default function findElementFromElement(this: DevToolsDriver, { elementId, using, value }: {
    elementId: string;
    using: string;
    value: string;
}): Promise<import("@wdio/protocols").ElementReference | Error>;
//# sourceMappingURL=findElementFromElement.d.ts.map