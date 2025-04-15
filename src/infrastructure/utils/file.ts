import { readFile } from 'fs/promises';

export async function carregarArquivo(path: string): Promise<string> {
  return await readFile(path, 'utf-8');
}