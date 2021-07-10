import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Find Element command is used to find an element in the current browsing context
 * that can be used for future commands.
 *
 * @alias browser.findElement
 * @see https://w3c.github.io/webdriver/#dfn-find-element
 * @param {string} using  a valid element location strategy
 * @param {string} value  the actual selector that will be used to find an element
 * @return {Object}       A JSON representation of an element object.
 */
export default function findElement(this: DevToolsDriver, { using, value }: {
    using: string;
    value: string;
}): Promise<import("@wdio/protocols").ElementReference | Error>;
//# sourceMappingURL=findElement.d.ts.map