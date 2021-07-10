/**
 * notify `WDIOCLInterface` about failure in hook
 * we need to do it this way because `beforeFn` and `afterFn` are not real hooks.
 * Otherwise hooks failures are lost.
 *
 * @param {string}  hookName    name of the hook
 * @param {Array}   hookResults hook functions results array
 * @param {string}  cid         cid
 */
export declare const logHookError: (hookName: string, hookResults: any[] | undefined, cid: string) => void;
//# sourceMappingURL=errorHandler.d.ts.map