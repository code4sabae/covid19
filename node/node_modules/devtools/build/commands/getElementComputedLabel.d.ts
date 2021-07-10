import type DevToolsDriver from '../devtoolsdriver';
/**
 * Get the computed WAI-ARIA label of an element.
 *
 * @alias browser.getElementComputedLabel
 * @see https://w3c.github.io/webdriver/#get-computed-label
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @return {string}           The result of computing the WAI-ARIA label of element.
 */
export default function getElementComputedLabel(this: DevToolsDriver, { elementId }: {
    elementId: string;
}): Promise<string | undefined>;
//# sourceMappingURL=getElementComputedLabel.d.ts.map