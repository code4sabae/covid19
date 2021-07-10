import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Find Elements From Element command is used to find elements from a web element
 * in the current browsing context that can be used for future commands.
 *
 * @alias browser.findElementFromElements
 * @see https://w3c.github.io/webdriver/#dfn-find-elements-from-element
 * @param {string} using  a valid element location strategy
 * @param {string} value  the actual selector that will be used to find an element
 * @return {object[]}     A (possibly empty) JSON list of representations of an element object.
 */
export default function findElementFromElements(this: DevToolsDriver, { elementId, using, value }: {
    elementId: string;
    using: string;
    value: string;
}): Promise<import("@wdio/protocols").ElementReference[]>;
//# sourceMappingURL=findElementsFromElement.d.ts.map