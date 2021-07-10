/// <reference types="node" />
import type { ExtendedCapabilities } from '../types';
import type DevToolsDriver from '../devtoolsdriver';
/**
 * The New Session command creates a new WebDriver session with the endpoint node.
 * If the creation fails, a session not created error is returned.
 *
 * @alias browser.newSession
 * @see https://w3c.github.io/webdriver/#dfn-new-sessions
 * @param  {Object} capabilities An object describing the set of capabilities for the capability processing algorithm
 * @return {Object}              Object containing sessionId and capabilities of created WebDriver session.
 */
export default function newSession(this: DevToolsDriver, { capabilities }: {
    capabilities: ExtendedCapabilities;
}): Promise<{
    sessionId: string;
    capabilities: {
        browserName: string;
        browserVersion: string;
        platformName: NodeJS.Platform;
        platformVersion: string;
    };
}>;
//# sourceMappingURL=newSession.d.ts.map