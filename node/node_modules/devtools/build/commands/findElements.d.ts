import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Find Elements command is used to find elements
 * in the current browsing context that can be used for future commands.
 *
 * @alias browser.findElements
 * @see https://w3c.github.io/webdriver/#dfn-find-elements
 * @param {string} using  a valid element location strategy
 * @param {string} value  the actual selector that will be used to find an element
 * @return {object[]}     A (possibly empty) JSON list of representations of an element object.
 */
export default function findElements(this: DevToolsDriver, { using, value }: {
    using: string;
    value: string;
}): Promise<import("@wdio/protocols").ElementReference[]>;
//# sourceMappingURL=findElements.d.ts.map