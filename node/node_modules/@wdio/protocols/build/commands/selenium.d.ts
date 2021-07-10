import { ProtocolCommandResponse } from '../types';
export default interface SeleniumCommands {
    /**
     * Selenium Protocol Command
     *
     * Upload a file to remote machine on which the browser is running.
     * @ref https://www.seleniumhq.org/
     *
     */
    file(file: string): string;
    /**
     * Selenium Protocol Command
     *
     * Receive hub config remotely.
     * @ref https://github.com/nicegraham/selenium-grid2-api#gridapihub
     *
     */
    getHubConfig(): ProtocolCommandResponse;
    /**
     * Selenium Protocol Command
     *
     * Get the details of the Selenium Grid node running a session.
     * @ref https://github.com/nicegraham/selenium-grid2-api#gridapitestsession
     *
     */
    gridTestSession(session: string): ProtocolCommandResponse;
    /**
     * Selenium Protocol Command
     *
     * Get proxy details.
     * @ref https://github.com/nicegraham/selenium-grid2-api#gridapiproxy
     *
     */
    gridProxyDetails(id: string): ProtocolCommandResponse;
    /**
     * Selenium Protocol Command
     *
     * Manage lifecycle of hub node.
     * @ref https://github.com/nicegraham/selenium-grid2-api#lifecycle-manager
     *
     */
    manageSeleniumHubLifecycle(action: string): void;
}
//# sourceMappingURL=selenium.d.ts.map