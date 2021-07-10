import type DevToolsDriver from '../devtoolsdriver';
/**
 * Get the computed WAI-ARIA role of an element.
 *
 * @alias browser.getElementComputedRole
 * @see https://w3c.github.io/webdriver/#get-computed-role
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @return {string}           The result of computing the WAI-ARIA role of element.
 */
export default function getElementComputedRole(this: DevToolsDriver, { elementId }: {
    elementId: string;
}): Promise<string>;
//# sourceMappingURL=getElementComputedRole.d.ts.map