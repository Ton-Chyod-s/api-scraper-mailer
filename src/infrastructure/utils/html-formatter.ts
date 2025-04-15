export function formatarLista(dados: (string | string[])[]): string {
    let html = "";
  
    for (const item of dados) {
      if (Array.isArray(item) || typeof item === "object") {
        for (const linha of item) {
          html += `<p>${linha}</p>`;
        }
      } else if (typeof item === "string") {
        if (item.includes("Prepare-se e leia")) {
          html += `<div id="exercito">${item}</div>`;
        } else {
          html += `<h4>${item}</h4>`;
        }
      }
    }
  
    return html;
  }