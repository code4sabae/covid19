/**
 * wait on element if:
 *  - elementId couldn't be fetched in the first place
 *  - command is not explicit wait command for existance or displayedness
 */
export default function implicitWait(currentElement: WebdriverIO.Element, commandName: string): Promise<WebdriverIO.Element>;
//# sourceMappingURL=implicitWait.d.ts.map