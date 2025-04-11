import { Request, Response } from 'express';

const express = require('express');
const server = express();
const PORT = 3000;

server.get('/', (req: Request, res: Response) => {
    return res.json({
        "": "Welcome to the Web Assist API! Here are the available endpoints:",
        "DOE": " /DOE/:id {nome do usuario}",
        "DIOGRANDE": " /DIOGRANDE/:id {nome do usuario}",
        'FAPEC': '/fapec',
        'CONCURSO ESTADO': '/concursoEstado',
        'EXERCITO': '/Exercito',
        'UFMS': '/UFMS',
        'SEGES': '/seges',
        'FIEMS': '/fiems',
        'PCI': '/PCI/:id {nome do estado}',
        'UFMS Geral': '/ufmsGeral',
        'SUPER ESTAGIOS': '/supEstagios'
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});