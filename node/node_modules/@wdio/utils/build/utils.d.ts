import type { Services } from '@wdio/types';
/**
 * overwrite native element commands with user defined
 * @param {object} propertiesObject propertiesObject
 */
export declare function overwriteElementCommands(propertiesObject: {
    '__elementOverrides__'?: {
        value: any;
    };
    [key: string]: any;
}): void;
/**
 * get command call structure
 * (for logging purposes)
 */
export declare function commandCallStructure(commandName: string, args: any[]): string;
/**
 * transforms WebDriver result for log stream to avoid unnecessary long
 * result strings e.g. if it contains a screenshot
 * @param {Object} result WebDriver response body
 */
export declare function transformCommandLogResult(result: {
    file?: string;
    script?: string;
}): "\"<Screenshot[base64]>\"" | "\"<Script[base64]>\"" | {
    file?: string | undefined;
    script?: string | undefined;
};
/**
 * checks if command argument is valid according to specificiation
 *
 * @param  {*}       arg           command argument
 * @param  {Object}  expectedType  parameter type (e.g. `number`, `string[]` or `(number|string)`)
 * @return {Boolean}               true if argument is valid
 */
export declare function isValidParameter(arg: any, expectedType: string): boolean;
/**
 * get type of command argument
 */
export declare function getArgumentType(arg: any): "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "null";
/**
 * Allows to safely require a package, it only throws if the package was found
 * but failed to load due to syntax errors
 * @param  {string} name  of package
 * @return {object}       package content
 */
export declare function safeRequire(name: string): Services.ServicePlugin | null;
/**
 * is function async
 * @param  {Function} fn  function to check
 * @return {Boolean}      true provided function is async
 */
export declare function isFunctionAsync(fn: Function): boolean;
/**
 * filter out arguments passed to specFn & hookFn, don't allow callbacks
 * as there is no need for user to call e.g. `done()`
 */
export declare function filterSpecArgs(args: any[]): any[];
/**
 * checks if provided string is Base64
 * @param  {String} str  string in base64 to check
 * @return {Boolean} true if the provided string is Base64
 */
export declare function isBase64(str: string): boolean;
/**
 * Helper utility to check file access
 * @param {String} file file to check access for
 * @return              true if file can be accessed
 */
export declare const canAccess: (file: string) => boolean;
/**
 * sleep
 * @param {number=0} ms number in ms to sleep
 */
export declare const sleep: (ms?: number) => Promise<unknown>;
//# sourceMappingURL=utils.d.ts.map