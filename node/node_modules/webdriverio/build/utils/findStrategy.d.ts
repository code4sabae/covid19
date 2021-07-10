declare type SelectorStrategy = string | {
    name: string;
    args: string;
};
export declare const findStrategy: (selector: SelectorStrategy, isW3C?: boolean | undefined, isMobile?: boolean | undefined) => {
    using: string;
    value: string;
};
export {};
//# sourceMappingURL=findStrategy.d.ts.map