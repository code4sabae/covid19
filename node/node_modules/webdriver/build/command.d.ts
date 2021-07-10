import type { CommandEndpoint } from '@wdio/protocols';
import { WebDriverResponse } from './request';
import { BaseClient } from './types';
export default function (method: string, endpointUri: string, commandInfo: CommandEndpoint, doubleEncodeVariables?: boolean): (this: BaseClient, ...args: any[]) => Promise<WebDriverResponse>;
//# sourceMappingURL=command.d.ts.map