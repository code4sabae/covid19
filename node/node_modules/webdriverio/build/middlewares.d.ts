/**
 * This method is an command wrapper for elements that checks if a command is called
 * that wasn't found on the page and automatically waits for it
 *
 * @param  {Function} fn  commandWrap from wdio-sync package (or shim if not running in sync)
 */
export declare const elementErrorHandler: (fn: Function) => (commandName: string, commandFn: Function) => (this: WebdriverIO.Element, ...args: any[]) => any;
/**
 * handle single command calls from multiremote instances
 */
export declare const multiremoteHandler: (wrapCommand: Function) => (commandName: keyof WebdriverIO.Browser) => any;
//# sourceMappingURL=middlewares.d.ts.map