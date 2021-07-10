import type { Options } from '@wdio/types';
import command from './command';
import { DEFAULTS } from './constants';
import { getPrototype } from './utils';
import type { Client, AttachOptions } from './types';
export default class WebDriver {
    static newSession(options: Options.WebDriver, modifier?: (...args: any[]) => any, userPrototype?: {}, customCommandWrapper?: (...args: any[]) => any): Promise<Client>;
    /**
     * allows user to attach to existing sessions
     */
    static attachToSession(options?: AttachOptions, modifier?: (...args: any[]) => any, userPrototype?: {}, commandWrapper?: (...args: any[]) => any): Client;
    /**
     * Changes The instance session id and browser capabilities for the new session
     * directly into the passed in browser object
     *
     * @param   {Object} instance  the object we get from a new browser session.
     * @returns {string}           the new session id of the browser
    */
    static reloadSession(instance: Client): Promise<string>;
    static get WebDriver(): typeof WebDriver;
}
/**
 * Helper methods consumed by webdriverio package
 */
export { getPrototype, DEFAULTS, command };
export * from './types';
//# sourceMappingURL=index.d.ts.map