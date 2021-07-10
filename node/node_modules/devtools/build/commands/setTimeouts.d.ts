import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Set Timeouts command sets timeout durations associated with the current session.
 * The timeouts that can be controlled are listed in the table of session timeouts below.
 *
 * @alias browser.setTimeouts
 * @see https://w3c.github.io/webdriver/#dfn-set-timeouts
 * @param {number} implicit  integer in ms for session implicit wait timeout
 * @param {number} pageLoad  integer in ms for session page load timeout
 * @param {number} script    integer in ms for session script timeout
 */
export default function setTimeouts(this: DevToolsDriver, { implicit, pageLoad, script }: {
    implicit: number;
    pageLoad: number;
    script: number;
}): Promise<null>;
//# sourceMappingURL=setTimeouts.d.ts.map