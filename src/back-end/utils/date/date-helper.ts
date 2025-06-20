
export const formatarData = (data: Date): string => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

export function parseExecutedAt(executedAtString: string): Date {
    const executedAtUTC = new Date(executedAtString);
    const campoGrandeTimestamp = executedAtUTC.getTime() - (4 * 60 * 60 * 1000); // UTC-4
    return new Date(campoGrandeTimestamp);
}