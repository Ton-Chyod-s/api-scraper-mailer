"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatarData = void 0;
exports.parseExecutedAt = parseExecutedAt;
const formatarData = (data) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
};
exports.formatarData = formatarData;
function parseExecutedAt(executedAtString) {
    const executedAtUTC = new Date(executedAtString);
    const campoGrandeTimestamp = executedAtUTC.getTime() - (4 * 60 * 60 * 1000); // UTC-4
    return new Date(campoGrandeTimestamp);
}
