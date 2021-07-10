import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Get Timeouts command gets timeout durations associated with the current session.
 *
 * @alias browser.getTimeouts
 * @see https://w3c.github.io/webdriver/#dfn-get-timeouts
 * @return {Object}  Object containing timeout durations for `script`, `pageLoad` and `implicit` timeouts.
 */
export default function getTimeouts(this: DevToolsDriver): {
    implicit: number | undefined;
    pageLoad: number | undefined;
    script: number | undefined;
};
//# sourceMappingURL=getTimeouts.d.ts.map