import type DevToolsDriver from '../devtoolsdriver';
/**
 * Is Element Selected determines if the referenced element is selected or not.
 * This operation only makes sense on input elements of the Checkbox- and Radio Button states,
 * or option elements.
 *
 * @param browser.isElementSelected
 * @see https://w3c.github.io/webdriver/#dfn-is-element-selected
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @return {boolean}          `true` or `false` based on the selected state.
 */
export default function isElementSelected(this: DevToolsDriver, { elementId }: {
    elementId: string;
}): Promise<boolean>;
//# sourceMappingURL=isElementSelected.d.ts.map