import { carregarTemplateExercitoOtt, gearListaFormatadaExercictoOtt, preencherTemplate } from "@utils/email/email-helper";

export async function buildMilitaryOttEmail(ano: string): Promise<string> {
    const exercitoTemplate = await carregarTemplateExercitoOtt(ano.toString());
    const listaFormatadaExercito = await gearListaFormatadaExercictoOtt();
    return preencherTemplate(exercitoTemplate, 'listaExercito', listaFormatadaExercito);
    }