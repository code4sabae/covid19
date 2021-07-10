import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Element Click command scrolls into view the element if it is not already pointer-interactable,
 * and clicks its in-view center point. If the element's center point is obscured by another element,
 * an element click intercepted error is returned.
 *
 * If the element is outside the viewport, an element not interactable error is returned.
 *
 * @alias browser.elementClick
 * @see https://w3c.github.io/webdriver/#dfn-element-click
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 */
export default function elementClick(this: DevToolsDriver, { elementId }: {
    elementId: string;
}): Promise<unknown>;
//# sourceMappingURL=elementClick.d.ts.map