"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailProviderMock = void 0;
const vitest_1 = require("vitest");
exports.mailProviderMock = {
    sendMail: vitest_1.vi.fn().mockResolvedValue(undefined), // Simula sucesso
};
