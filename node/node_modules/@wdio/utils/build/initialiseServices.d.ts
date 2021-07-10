import type { Capabilities, Services, Options } from '@wdio/types';
/**
 * initialise service for launcher process
 * @param  {Object}   config  wdio config
 * @param  {Object[]} caps    list of capabilities
 * @return {Object}           containing a list of launcher services as well
 *                            as a list of services that don't need to be
 *                            required in the worker
 */
export declare function initialiseLauncherService(config: Omit<Options.Testrunner, 'capabilities' | keyof Services.HookFunctions>, caps: Capabilities.DesiredCapabilities): {
    ignoredWorkerServices: string[];
    launcherServices: Services.ServiceInstance[];
};
/**
 * initialise services for worker instance
 * @param  {Object} config                 wdio config
 * @param  {Object} caps                   worker capabilities
 * @param  {[type]} ignoredWorkerServices  list of services that don't need to be required in a worker
 *                                         as they don't export a service for it
 * @return {Object[]}                      list if worker initiated worker services
 */
export declare function initialiseWorkerService(config: Options.Testrunner, caps: Capabilities.DesiredCapabilities, ignoredWorkerServices?: string[]): Services.ServiceInstance[];
//# sourceMappingURL=initialiseServices.d.ts.map