declare function darwin(): string[];
/**
 * Look for linux executables in 3 ways
 * 1. Look into the directories where .desktop are saved on gnome based distros
 * 2. Look for edge by using the which command
 */
declare function linux(): string[];
declare function win32(): string[];
declare const _default: {
    darwin: typeof darwin;
    linux: typeof linux;
    win32: typeof win32;
};
export default _default;
//# sourceMappingURL=edge.d.ts.map