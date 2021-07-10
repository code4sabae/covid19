import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Get Element Attribute command will return the attribute of a web element.
 *
 * @alias browser.getElementAttribute
 * @see https://w3c.github.io/webdriver/#dfn-get-element-attribute
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @param {string} name       name of the attribute value to retrieve
 * @return {string}           The named attribute of the element.
 */
export default function getElementAttribute(this: DevToolsDriver, { elementId, name }: {
    elementId: string;
    name: string;
}): Promise<string | null>;
//# sourceMappingURL=getElementAttribute.d.ts.map