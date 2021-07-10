import { Cookie } from '@wdio/protocols';
import type DevToolsDriver from '../devtoolsdriver';
/**
 * The Add Cookie command adds a single cookie to the cookie store
 * associated with the active document's address.
 *
 * @alias browser.addCookie
 * @see https://w3c.github.io/webdriver/#dfn-adding-a-cookie
 * @param {object} cookie  A JSON object representing a cookie. It must have at least the name and value fields and could have more, including expiry-time and so on
 */
export default function addCookie(this: DevToolsDriver, { cookie }: {
    cookie: Cookie;
}): Promise<null>;
//# sourceMappingURL=addCookie.d.ts.map