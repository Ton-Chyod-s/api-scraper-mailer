import tls, { TLSSocket } from 'node:tls';
import { X509Certificate } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const host = 'diogrande.campogrande.ms.gov.br';

type CertLike = {
  raw: Buffer;
  issuerCertificate?: unknown;
};

function isCertLike(v: unknown): v is CertLike {
  if (typeof v !== 'object' || v === null) return false;

  const raw = (v as { raw?: unknown }).raw;
  return Buffer.isBuffer(raw);
}

function getIssuer(v: CertLike): unknown {
  return (v as { issuerCertificate?: unknown }).issuerCertificate;
}

const outDir = path.resolve(process.cwd(), 'certs');
const outFile = path.join(outDir, 'diogrande-ca.pem');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, '');

tls
  .connect(
    { host, port: 443, servername: host, rejectUnauthorized: false },
    function (this: TLSSocket) {
      const peer: unknown = this.getPeerCertificate(true);

      const seen = new Set<string>();
      let cur: unknown = peer;

      for (let i = 0; i < 20; i++) {
        if (!isCertLike(cur)) break;

        const cert = new X509Certificate(cur.raw);
        const key = cert.fingerprint256;

        if (!seen.has(key)) {
          console.log(`${i + 1}) Subject: ${cert.subject}`);
          console.log(`   Issuer : ${cert.issuer}`);
          console.log(`   Valid  : ${cert.validFrom} -> ${cert.validTo}\n`);

          // pula o leaf (primeiro cert). queremos só cadeia (intermediárias/root)
          if (i > 0) {
            const pem = cert.toString(); // PEM
            fs.appendFileSync(outFile, pem);
            if (!pem.endsWith('\n')) fs.appendFileSync(outFile, '\n');
            fs.appendFileSync(outFile, '\n');
          }

          seen.add(key);
        }

        const next = getIssuer(cur);
        if (!next || next === cur) break;

        cur = next;
      }

      console.log(`PEM salvo em: ${outFile}`);
      this.end();
    },
  )
  .on('error', console.error);
