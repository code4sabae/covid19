import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Get Element Property command will return the result of getting a property of an element.
 *
 * @alias browser.getElementProperty
 * @see https://w3c.github.io/webdriver/#dfn-get-element-property
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @param {string} name       name of the attribute property to retrieve
 * @return {string}           The named property of the element, accessed by calling GetOwnProperty on the element object.
 */
export default function getElementProperty(this: DevToolsDriver, { elementId, name }: {
    elementId: string;
    name: string;
}): Promise<unknown>;
//# sourceMappingURL=getElementProperty.d.ts.map