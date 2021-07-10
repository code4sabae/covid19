import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Get Element Rect command returns the dimensions and coordinates of the given web element.
 *
 * @alias browser.getElementRect
 * @see https://w3c.github.io/webdriver/#dfn-get-element-rect
 * @param {string} elementId  the id of an element returned in a previous call to Find Element(s)
 * @return {string}           A JSON object representing the position and bounding rect of the element.
 */
export default function getElementRect(this: DevToolsDriver, { elementId }: {
    elementId: string;
}): Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
}>;
//# sourceMappingURL=getElementRect.d.ts.map