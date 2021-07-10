"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The Refresh command causes the browser to reload the page in current top-level browsing context.
 *
 * @alias browser.refresh
 * @see https://w3c.github.io/webdriver/#dfn-refresh
 */
async function refresh() {
    delete this.currentFrame;
    const page = this.getPageHandle();
    await page.reload();
    return null;
}
exports.default = refresh;
