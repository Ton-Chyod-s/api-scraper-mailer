import { carregarTemplateExercitoOtt, gearListaFormatadaExercictoOtt, preencherTemplate } from "@utils/email/email-helper";

export async function buildMilitaryOttEmail(ano: string): Promise<string> {
    const exercitoTemplate = await carregarTemplateExercitoOtt(ano);
    const listaFormatadaExercito = await gearListaFormatadaExercictoOtt();
    return preencherTemplate(exercitoTemplate, 'listaExercitoOtt', listaFormatadaExercito);
    }