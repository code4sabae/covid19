import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Element Clear command scrolls into view an editable or resettable element and then attempts
 * to clear its selected files or text content.
 *
 * @alias browser.elementClear
 * @see https://w3c.github.io/webdriver/#dfn-element-clear
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 */
export default function elementClear(this: DevToolsDriver, { elementId }: {
    elementId: string;
}): Promise<null>;
//# sourceMappingURL=elementClear.d.ts.map