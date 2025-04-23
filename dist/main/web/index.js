"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = require("../../main/web/routes");
require("../../infrastructure/node-cron/scheduler");
const server = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
server.use(express_1.default.json());
server.use(routes_1.router);
server.listen(PORT, () => {
    console.log(`Servidor em execução em http://localhost:${PORT}`);
});
