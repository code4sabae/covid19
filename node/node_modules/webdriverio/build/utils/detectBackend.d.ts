import { Capabilities, Options } from '@wdio/types';
interface BackendConfigurations {
    port?: number;
    hostname?: string;
    user?: string;
    key?: string;
    protocol?: string;
    region?: Options.SauceRegions;
    headless?: boolean;
    path?: string;
    capabilities?: Capabilities.RemoteCapabilities | Capabilities.RemoteCapability;
}
/**
 * helper to detect the Selenium backend according to given capabilities
 */
export default function detectBackend(options?: BackendConfigurations): {
    hostname: string | undefined;
    port: number | undefined;
    protocol: string | undefined;
    path: string | undefined;
};
export {};
//# sourceMappingURL=detectBackend.d.ts.map