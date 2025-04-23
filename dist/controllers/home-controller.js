"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeController = void 0;
class HomeController {
    static async welcome(req, res) {
        res.status(200).json({ message: "Hello World" });
    }
}
exports.HomeController = HomeController;
