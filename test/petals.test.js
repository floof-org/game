import { describe, expect, test } from "bun:test";

import { petalConfigs } from "../public/server/lib/config.js";

const petal = name => petalConfigs.find(config => config.name === name);

describe("lightning absorption", () => {
    test("Rubber attracts lightning", () => {
        expect(petal("Rubber").attractsLightning).toBeTruthy();
    });

    test("Magnet no longer attracts lightning", () => {
        expect(petal("Magnet").attractsLightning).toBeFalsy();
    });
});
