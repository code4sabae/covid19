import { Services } from '@wdio/types';
/**
 * initialise WebdriverIO compliant plugins like reporter or services in the following way:
 * 1. if package name is scoped (starts with "@"), require scoped package name
 * 2. otherwise try to require "@wdio/<name>-<type>"
 * 3. otherwise try to require "wdio-<name>-<type>"
 */
export default function initialisePlugin(name: string, type?: string): Services.ServicePlugin | Services.RunnerPlugin;
//# sourceMappingURL=initialisePlugin.d.ts.map