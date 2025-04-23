"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const home_controller_1 = require("../../../controllers/home-controller");
const user_controller_1 = require("../../../controllers/user-controller");
const create_user_1 = require("../../../usecases/user/create-user");
const user_repository_1 = require("../../../infrastructure/repositories/user-repository");
const exercito_web_scraper_1 = require("../../../infrastructure/providers/gateways/exercito-work/exercito-web-scraper");
const exercito_use_case_1 = require("../../../usecases/exercito-work/exercito-use-case");
const diario_oficial_estado_web_1 = require("../../../infrastructure/providers/gateways/diario-oficial/diario-oficial-estado-web");
const consultar_diario_oficial_estado_1 = require("../../../usecases/diario-oficial/consultar-diario-oficial-estado");
const diario_oficial_estado_controller_1 = require("../../../controllers/diario-oficial/diario-oficial-estado-controller");
const diario_oficial_municipio_controller_1 = require("../../../controllers/diario-oficial/diario-oficial-municipio-controller");
const send_email_controller_1 = require("../../../controllers/email/send-email-controller");
const diario_oficial_municipio_web_1 = require("../../../infrastructure/providers/gateways/diario-oficial/diario-oficial-municipio-web");
const consultar_diario_oficial_municipio_1 = require("../../../usecases/diario-oficial/consultar-diario-oficial-municipio");
exports.router = (0, express_1.Router)();
exports.router.get('/', home_controller_1.HomeController.welcome);
const userRepository = new user_repository_1.PrismaUserRepository();
const createUser = new create_user_1.CreateUser(userRepository);
const userController = new user_controller_1.UserController(createUser);
exports.router.post('/users', (req, res) => userController.create(req, res));
const scraper = new exercito_web_scraper_1.ExercitoWebScraper();
const exercitoUseCase = new exercito_use_case_1.ExercitoUseCase(scraper);
exports.router.post('/mail', async (req, res) => {
    try {
        const { email, html, ano } = req.body;
        await (0, send_email_controller_1.enviarEmail)(email, html, ano);
        res.status(200).send('E-mails enviados com sucesso!');
    }
    catch (error) {
        res.status(500).send('Erro ao enviar e-mails');
    }
});
exports.router.get('/exercito', async (req, res) => {
    try {
        const content = await exercitoUseCase.execute();
        res.send(content);
    }
    catch (error) {
        res.status(500).send('Error fetching content from Exercito website');
    }
});
const diarioOficialEstadoWeb = new diario_oficial_estado_web_1.DiarioOficialEstadoWeb();
const consultarEstadoUseCase = new consultar_diario_oficial_estado_1.ConsultarDiarioOficialEstadoUseCase(diarioOficialEstadoWeb);
const diarioEstadoController = new diario_oficial_estado_controller_1.DiarioOficialEstadoController(consultarEstadoUseCase);
exports.router.post('/doe', (req, res) => diarioEstadoController.consultar(req, res));
const diarioOficialMunicipioWeb = new diario_oficial_municipio_web_1.DiarioOficialMunicipioWeb();
const consultarMunicipioUseCase = new consultar_diario_oficial_municipio_1.ConsultarDiarioOficialMunicipioUseCase(diarioOficialMunicipioWeb);
const diarioMunicipioController = new diario_oficial_municipio_controller_1.DiarioOficialMunicipioController(consultarMunicipioUseCase);
exports.router.post('/diogrande', (req, res) => diarioMunicipioController.consultar(req, res));
