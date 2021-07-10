declare namespace rgb2hex {
    interface HexColor {
        hex: string,
        alpha: number
    }
}

declare const rgb2hex: {
    (rgb: string): {
        hex: string,
        alpha: number
    }
}

export = rgb2hex