import axios from "axios";

/**
 * Token (Google Translate Token)
 * Generate the current token key and allows generation of tokens (tk) with it
 * Python version of `token-script.js` itself from translate.google.com
 *
 * @export
 * @class Token
 */
export class Token {
    private tokenKey: string|null;

    constructor() {
        this.tokenKey = null;
    }

    /**
     * Calculate the request token (`tk`) of a string
     *
     * @param {string} text The text to calculate a token for
     * @param {string|null} [seed=null] The seed to use. By default this is the number of hours since epoch
     * @memberof Token
     */
    public async calculateToken(text: string, seed: string|null = null): Promise<string> {
        // TODO: Deobfuscate script
        const xr = (a: any) => {
            return () => {
                return a;
            };
        };
        const yr = (a: any, b: any) => {
            for (let c = 0; c < b.length - 2; c += 3) {
                let d = b.charAt(c + 2);
                d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
                d = "+" === b.charAt(c + 1) ? a >>> d : a << d;
                a = "+" === b.charAt(c) ? a + d & 4294967295 : a ^ d;
            }
            return a;
        };
        let zr: any = null;
        const Ar = async (a: any) => {
            let b;
            if (null  !== zr) {
                b = zr;
            } else {
                b = await this.getTokenKey();
            }
            let d: any = xr(String.fromCharCode(116));
            let c: any = xr(String.fromCharCode(107));
            d = [d(), d()];
            d[1] = c();
            c = "&" + d.join("") + "=";
            d = b.split(".");
            b = Number(d[0]) || 0;
            // tslint:disable-next-line: no-var-keyword
            for (var e = [], f = 0, g = 0; g < a.length; g++) {
                let l = a.charCodeAt(g);
                // tslint:disable-next-line: max-line-length
                128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 === (l & 64512) && g + 1 < a.length && 56320 === (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
                e[f++] = l >> 18 | 240,
                e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
                e[f++] = l >> 6 & 63 | 128),
                e[f++] = l & 63 | 128);
            }
            a = b;
            for (f = 0; f < e.length; f++) {
                a += e[f];
                a = yr(a, "+-a^+6");
            }
            a = yr(a, "+-3^+b+-f");
            a ^= Number(d[1]) || 0;
            // tslint:disable-next-line: no-unused-expression
            0 > a && (a = (a & 2147483647) + 2147483648);
            a %= 1E6;
            return (a.toString() + "." + (a ^ b));
        };

        zr = seed;
        return await Ar(text);
    }

    private async getTokenKey(): Promise<any> {
        if ( this.tokenKey !== null ) {
            return this.tokenKey;
        }

        const resp = await axios.get("https://translate.google.com/");
        const tkkExprMatch = (resp.data as string).match(/(tkk:.*?),/);
        let tkkExpr;
        if ( tkkExprMatch === null ) {
            throw new Error("Unable to find token seed! Did https://translate.google.com change?");
        }
        tkkExpr = tkkExprMatch[0];

        const tokenMatch = tkkExpr.match(/\d{6}\.[0-9]+/);
        let token;
        if ( tokenMatch !== null ) {
            token = tokenMatch[0];
        } else {
            const timestamp = Math.floor(+new Date() / 1000);
            const hours = Math.floor(timestamp / 3600);
            const aMatch = tkkExpr.match(/a\\\\x3d(-?\d+);/);
            const a = aMatch !== null ? parseInt(aMatch[0], 10) : 0;
            const bMatch = tkkExpr.match(/b\\\\x3d(-?\d+);/);
            const b = bMatch !== null ? parseInt(bMatch[0], 10) : 0;

            token = `${hours}.${a + b}`;
        }

        this.tokenKey = token;

        return token;
    }

}
