"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
class UserController {
    constructor(createUser) {
        this.createUser = createUser;
    }
    async create(req, res) {
        const { name, email } = req.body;
        try {
            await this.createUser.execute(name, email);
            res.status(201).send('Usuário criado com sucesso!');
        }
        catch (err) {
            res.status(400).send({ error: err.message });
        }
    }
}
exports.UserController = UserController;
