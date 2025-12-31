import tls from 'node:tls';
import { X509Certificate } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Agent, fetch as undiciFetch } from 'undici';
import { diograndeConfig } from './diogrande.config';

const TLS_CODES = new Set([
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'CERT_HAS_EXPIRED',
  'ERR_TLS_CERT_ALTNAME_INVALID',
]);

export function findTlsCode(err: unknown): string | undefined {
  let cur: unknown = err;

  for (let i = 0; i < 8; i++) {
    if (!cur || typeof cur !== 'object') return undefined;

    const rec = cur as Record<string, unknown>;
    const code = rec.code;
    if (typeof code === 'string' && TLS_CODES.has(code)) return code;

    cur = rec.cause;
  }

  return undefined;
}

function derToPem(der: Buffer): string {
  const b64 = der.toString('base64');
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN CERTIFICATE-----\n${lines.join('\n')}\n-----END CERTIFICATE-----\n`;
}

function getRawBuffer(cert: tls.PeerCertificate): Buffer | undefined {
  const raw = (cert as unknown as { raw?: unknown }).raw;
  return Buffer.isBuffer(raw) ? raw : undefined;
}

function getIssuer(cert: tls.PeerCertificate): tls.PeerCertificate | undefined {
  const issuer = (cert as unknown as { issuerCertificate?: unknown }).issuerCertificate;

  if (!issuer || typeof issuer !== 'object') return undefined;
  if (Object.keys(issuer as Record<string, unknown>).length === 0) return undefined;

  const issuerCert = issuer as tls.PeerCertificate;
  if (issuerCert === cert) return undefined;

  return issuerCert;
}

function collectChainFromPeer(peer: tls.PeerCertificate): Buffer[] {
  const out: Buffer[] = [];
  const seen = new Set<string>();

  const push = (buf?: Buffer) => {
    if (!buf) return;
    const key = buf.toString('base64');
    if (seen.has(key)) return;
    seen.add(key);
    out.push(buf);
  };

  // leaf
  push(getRawBuffer(peer));

  let cur: tls.PeerCertificate | undefined = peer;

  for (let i = 0; i < 12 && cur; i++) {
    const next = getIssuer(cur);
    if (!next) break;

    push(getRawBuffer(next));
    cur = next;
  }

  return out;
}

function extractCaIssuersUrls(infoAccess: string): string[] {
  const urls: string[] = [];
  const re = /CA Issuers\s*-\s*URI:([^\s]+)/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(infoAccess)) !== null) {
    const url = m[1]?.trim();
    if (url) urls.push(url);
  }

  return urls;
}

async function fetchCertPemFromUrl(url: string): Promise<string | null> {
  try {
    const res = await undiciFetch(url, { method: 'GET' });
    if (!res.ok) return null;

    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);

    const x509 = new X509Certificate(buf);
    return x509.toString();
  } catch {
    try {
      const res = await undiciFetch(url, { method: 'GET' });
      if (!res.ok) return null;

      const ab = await res.arrayBuffer();
      const buf = Buffer.from(ab);
      return derToPem(buf);
    } catch {
      return null;
    }
  }
}

function chainToPem(raws: Buffer[]): string {
  const pems: string[] = [];

  for (let i = 1; i < raws.length; i++) {
    const raw = raws[i];
    if (!raw) continue;

    try {
      const cert = new X509Certificate(raw);
      pems.push(cert.toString());
    } catch {
      pems.push(derToPem(raw));
    }
  }

  return pems.join('\n').trim();
}

async function ensureDirForFile(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function readCachePem(cachePath: string): Promise<string> {
  try {
    const abs = path.isAbsolute(cachePath) ? cachePath : path.join(process.cwd(), cachePath);
    const s = await fs.readFile(abs, 'utf8');
    return String(s || '').trim();
  } catch {
    return '';
  }
}

async function writeCachePem(cachePath: string, pem: string) {
  const abs = path.isAbsolute(cachePath) ? cachePath : path.join(process.cwd(), cachePath);
  await ensureDirForFile(abs);
  await fs.writeFile(abs, pem, 'utf8');
}

function getBaseCAs(): string[] {
  const base = [...tls.rootCertificates];

  const getCA = (tls as unknown as { getCACertificates?: (type: string) => string[] })
    .getCACertificates;

  if (typeof getCA === 'function') {
    try {
      base.push(...getCA('system'));
    } catch {
      // ignore
    }
    try {
      base.push(...getCA('extra'));
    } catch {
      // ignore
    }
  }

  return [...new Set(base.map((x) => x.trim()))].filter(Boolean);
}

async function discoverDiograndeChainPem(): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host: diograndeConfig.host,
        port: diograndeConfig.port,
        servername: diograndeConfig.host,
        rejectUnauthorized: false,
      },
      () => {
        void (async () => {
          try {
            const peer = socket.getPeerCertificate(true) as tls.PeerCertificate;
            const raws = collectChainFromPeer(peer);

            socket.end();

            if (raws.length === 0) {
              reject(new Error('Não foi possível ler o certificado do servidor (chain vazia).'));
              return;
            }

            const chainPem = chainToPem(raws);
            if (chainPem) {
              resolve(chainPem);
              return;
            }

            const leafRaw = raws[0];
            if (!leafRaw) {
              reject(new Error('Não foi possível ler o certificado leaf (raw vazio).'));
              return;
            }

            let leaf: X509Certificate;
            try {
              leaf = new X509Certificate(leafRaw);
            } catch {
              reject(new Error('Não foi possível parsear o certificado leaf.'));
              return;
            }

            const urls = extractCaIssuersUrls(leaf.infoAccess ?? '');
            for (const u of urls) {
              const pem = await fetchCertPemFromUrl(u);
              if (pem?.trim()) {
                resolve(pem.trim());
                return;
              }
            }

            reject(
              new Error(
                `Não foi possível descobrir CA via AIA. URLs tentadas: ${urls.join(', ') || '(nenhuma)'}`,
              ),
            );
          } catch (e) {
            socket.end();
            reject(e);
          }
        })();
      },
    );

    socket.on('error', (e) => reject(e));
  });
}

export async function createDiograndeDispatcher(): Promise<Agent | undefined> {
  if (diograndeConfig.allowInsecureTls) {
    return new Agent({
      connect: {
        rejectUnauthorized: false,
        servername: diograndeConfig.host,
      },
    });
  }

  const baseCAs = getBaseCAs();

  if (diograndeConfig.pinnedCaPem) {
    return new Agent({
      connect: {
        ca: [...baseCAs, diograndeConfig.pinnedCaPem],
        servername: diograndeConfig.host,
      },
    });
  }

  const cached = await readCachePem(diograndeConfig.caCachePath);
  if (cached) {
    return new Agent({
      connect: {
        ca: [...baseCAs, cached],
        servername: diograndeConfig.host,
      },
    });
  }

  if (diograndeConfig.autoDiscoverCa) {
    const discovered = (await discoverDiograndeChainPem()).trim();
    if (discovered) {
      await writeCachePem(diograndeConfig.caCachePath, discovered);
      return new Agent({
        connect: {
          ca: [...baseCAs, discovered],
          servername: diograndeConfig.host,
        },
      });
    }
  }

  return undefined;
}
