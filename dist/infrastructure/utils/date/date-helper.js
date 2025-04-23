"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatarData = void 0;
const formatarData = (data) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
};
exports.formatarData = formatarData;
