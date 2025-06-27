import { carregarTemplateExercitoStt, gearListaFormatadaExercictoStt, preencherTemplate } from "@utils/email/email-helper";


export async function buildMilitarySttEmail(ano: string): Promise<string> {
    const exercitoTemplate = await carregarTemplateExercitoStt(ano);
    const listaFormatadaExercito = await gearListaFormatadaExercictoStt();
    return preencherTemplate(exercitoTemplate, 'listaExercitoStt', listaFormatadaExercito);
}