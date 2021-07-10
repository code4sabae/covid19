import type { ElementHandle } from 'puppeteer-core/lib/cjs/puppeteer/common/JSHandle';
import type { Frame } from 'puppeteer-core/lib/cjs/puppeteer/common/FrameManager';
export default class ElementStore {
    private _index;
    private _elementMap;
    private _frameMap;
    set(elementHandle: ElementHandle): string;
    get(index: string): Promise<ElementHandle<Element> | undefined>;
    clear(frame?: Frame): void;
}
//# sourceMappingURL=elementstore.d.ts.map