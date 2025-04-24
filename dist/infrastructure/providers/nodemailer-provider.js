"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodemailerProvider = void 0;
const nodemailer = require("nodemailer");
require('dotenv').config({ path: '.env' });
class NodemailerProvider {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORT,
            secure: false,
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD,
            },
        });
    }
    async sendMail({ to, subject, html }) {
        await this.transporter.sendMail({
            from: process.env.USER,
            to,
            subject,
            html,
        });
    }
}
exports.NodemailerProvider = NodemailerProvider;
