import { Request, Response } from "express";

export class HomeController {
    static async welcome ( req: Request, res: Response ) {
        res.status(200).json({ message: "Hello World" });
    }
}
