/**
 * The Status command returns information about whether a remote end is in a state
 * in which it can create new sessions and can additionally include arbitrary meta information
 * that is specific to the implementation.
 *
 * @alias browser.status
 * @see https://w3c.github.io/webdriver/#dfn-status
 * @return {Object} returning an object with the Puppeteer version being used
 */
export default function status(): Promise<{
    message: string;
    ready: boolean;
    puppeteerVersion: any;
}>;
//# sourceMappingURL=status.d.ts.map