import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Get Element Tag Name command returns the qualified element name of the given web element.
 *
 * @alias browser.getElementTagName
 * @see https://w3c.github.io/webdriver/#dfn-get-element-tag-name
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @return {string}           The tagName attribute of the element.
 */
export default function getElementTagName(this: DevToolsDriver, { elementId }: {
    elementId: string;
}): Promise<string>;
//# sourceMappingURL=getElementTagName.d.ts.map