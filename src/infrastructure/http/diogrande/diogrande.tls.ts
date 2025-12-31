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

function debugLog(...args: unknown[]) {
  if (!diograndeConfig.debug) return;
  console.debug('[diogrande:tls]', ...args);
}

const PEM_BLOCK_RE = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g;

function extractPemBlocks(pem: string): string[] {
  const blocks = String(pem || '').match(PEM_BLOCK_RE) ?? [];
  return blocks.map((b) => b.trim()).filter(Boolean);
}

function normalizePemChain(pem: string): string {
  return extractPemBlocks(pem).join('\n\n').trim();
}

function isValidPemChain(pem: string): boolean {
  const blocks = extractPemBlocks(pem);
  if (blocks.length === 0) return false;

  for (const b of blocks) {
    try {
      new X509Certificate(b);
    } catch {
      return false;
    }
  }

  return true;
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

type AbortSignalWithTimeout = typeof AbortSignal & {
  timeout?: (ms: number) => AbortSignal;
};

function createTimeoutSignal(ms: number | undefined): { signal?: AbortSignal; clear: () => void } {
  const timeoutMs = typeof ms === 'number' ? ms : 0;
  if (!timeoutMs || timeoutMs <= 0) return { clear: () => {} };

  const AS = AbortSignal as AbortSignalWithTimeout;
  if (typeof AS.timeout === 'function') {
    return { signal: AS.timeout(timeoutMs), clear: () => {} };
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(new Error(`Timeout ${timeoutMs}ms`)), timeoutMs);
  return { signal: ac.signal, clear: () => clearTimeout(t) };
}

function matchHost(pattern: string, host: string): boolean {
  const p = pattern.toLowerCase();
  const h = host.toLowerCase();

  if (p === h) return true;

  if (p.startsWith('*.')) {
    const suffix = p.slice(1); // ".example.com"
    return h.endsWith(suffix) && h.length > suffix.length;
  }

  return false;
}

function isAllowedIssuerUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }

  if (u.protocol !== 'https:') return false;
  if (!u.hostname) return false;

  const allow = diograndeConfig.aiaAllowedHosts ?? [];
  if (allow.length === 0) return true;

  return allow.some((p) => matchHost(p, u.hostname));
}

async function fetchCertPemFromUrl(url: string): Promise<string | null> {
  if (!isAllowedIssuerUrl(url)) return null;

  const { signal, clear } = createTimeoutSignal(diograndeConfig.aiaFetchTimeoutMs);

  try {
    const res = await undiciFetch(url, { method: 'GET', signal, redirect: 'error' });
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());

    try {
      const x509 = new X509Certificate(buf);
      return x509.toString();
    } catch {
      return derToPem(buf);
    }
  } catch {
    return null;
  } finally {
    clear();
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
    const raw = String(s || '').trim();
    const normalized = normalizePemChain(raw);

    if (!normalized) return '';
    if (!isValidPemChain(normalized)) {
      debugLog('Cache PEM inválido, ignorando', { cachePath: abs });
      return '';
    }

    return normalized;
  } catch {
    return '';
  }
}

async function writeCachePem(cachePath: string, pem: string) {
  const abs = path.isAbsolute(cachePath) ? cachePath : path.join(process.cwd(), cachePath);
  await ensureDirForFile(abs);
  await fs.writeFile(abs, normalizePemChain(pem), 'utf8');
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
    debugLog('Auto-discover CA (rejectUnauthorized=false)', {
      host: diograndeConfig.host,
      port: diograndeConfig.port,
      cachePath: diograndeConfig.caCachePath,
    });

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

            const urls = extractCaIssuersUrls(leaf.infoAccess ?? '').filter(isAllowedIssuerUrl);
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

    socket.setTimeout(diograndeConfig.discoverTimeoutMs, () => {
      socket.destroy(
        new Error(`Timeout conectando em ${diograndeConfig.host}:${diograndeConfig.port}`),
      );
    });

    socket.on('error', (e) => reject(e));
  });
}

export async function createDiograndeDispatcher(): Promise<Agent | undefined> {
  if (diograndeConfig.allowInsecureTls) {
    debugLog('Criando dispatcher com TLS inseguro (rejectUnauthorized=false)');
    return new Agent({
      connect: {
        rejectUnauthorized: false,
        servername: diograndeConfig.host,
      },
    });
  }

  const baseCAs = getBaseCAs();

  if (diograndeConfig.pinnedCaPem) {
    const pinned = normalizePemChain(diograndeConfig.pinnedCaPem);
    if (!pinned || !isValidPemChain(pinned)) {
      debugLog('DIOGRANDE_CA_PEM inválido, ignorando');
      return undefined;
    }

    debugLog('Criando dispatcher com CA pinada (DIOGRANDE_CA_PEM)');
    return new Agent({
      connect: {
        ca: [...baseCAs, pinned],
        servername: diograndeConfig.host,
      },
    });
  }

  const cached = await readCachePem(diograndeConfig.caCachePath);
  if (cached) {
    debugLog('Criando dispatcher com CA do cache', { cachePath: diograndeConfig.caCachePath });
    return new Agent({
      connect: {
        ca: [...baseCAs, cached],
        servername: diograndeConfig.host,
      },
    });
  }

  if (diograndeConfig.autoDiscoverCa) {
    const discovered = (await discoverDiograndeChainPem()).trim();
    const normalized = normalizePemChain(discovered);

    if (normalized && isValidPemChain(normalized)) {
      if (diograndeConfig.cacheDiscoveredCa) {
        await writeCachePem(diograndeConfig.caCachePath, normalized);
        debugLog('CA auto-descoberta salva em cache', { cachePath: diograndeConfig.caCachePath });
      } else {
        debugLog('CA auto-descoberta usada sem persistir (cacheDiscoveredCa=false)');
      }

      debugLog('Criando dispatcher com CA auto-descoberta');
      return new Agent({
        connect: {
          ca: [...baseCAs, normalized],
          servername: diograndeConfig.host,
        },
      });
    }

    debugLog('Auto-discover não retornou PEM válido');
  }

  return undefined;
}
