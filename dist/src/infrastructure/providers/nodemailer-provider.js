"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailerProvider = void 0;
const nodemailer = require("nodemailer");
require('dotenv').config({ path: '.env' });
class NodemailerProvider {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORT,
            secure: true,
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD,
            },
        });
    }
    sendMail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ to, subject, html }) {
            yield this.transporter.sendMail({
                from: process.env.USER,
                to,
                subject,
                html,
            });
        });
    }
}
exports.NodemailerProvider = NodemailerProvider;
