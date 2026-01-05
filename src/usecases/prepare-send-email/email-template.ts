import { FetchedDiaryItem, UserListItem } from '@domain/dtos/prepare-send-email/prepare-send-email';
import { escapeHtml } from '../../utils/html/html-utils';
import { formatDayCampoGrande } from '@utils/date/date-time';

export function formatEmailBodyForUser(args: {
  user: UserListItem;
  municipal: FetchedDiaryItem[];
  state: FetchedDiaryItem[];
  targetDayStr: string;
  year: string;
}): string {
  const { user, municipal, state } = args;

  const parts: string[] = [];

  parts.push(`<p>Prezado(a), ${escapeHtml(user.name)}</p>`);
  parts.push(`<p>Aqui estão as análises solicitadas:</p>`);

  const renderSection = (title: string, items: FetchedDiaryItem[]) => {
    parts.push(`<h3>${escapeHtml(title)}</h3>`);

    if (!items?.length) {
      parts.push(`<p><em>No journals found.</em></p>`);
      return;
    }

    for (const item of items) {
      const line = `${item.numero} | ${formatDayCampoGrande(item.dia)} | ${item.descricao ?? ''} | ${item.arquivo}`;
      if (line.includes(' KB')) continue;

      const safe = escapeHtml(line);

      if ((item.descricao ?? '').includes('Prepare-se e leia')) {
        parts.push(`<div class="army">${safe}</div>`);
      } else {
        parts.push(`<p>${safe}</p>`);
      }
    }
  };

  renderSection('Municipal', municipal);
  renderSection('State', state);

  return parts.join('');
}

export function buildEmailHtml(mainHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 1.1em;
      background-color: #f4f4f4;
      padding: 10px;
      border-radius: 5px;
    }

    h3 {
      color: black;
      display: flex;
      justify-content: center;
    }

    .army {
      color: red;
      font-size: 1.2em;
    }
  </style>
</head>
<body>
  <main>
    ${mainHtml}
  </main>
</body>
</html>`;
}
