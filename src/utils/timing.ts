export type TimingSnapshot = Record<string, number>;

export type TimingOptions = {
  debug?: boolean | { envVar: string };
  round?: boolean;
};

function nowMs(): number {
  return Number(process.hrtime.bigint()) / 1_000_000;
}

function isDebugEnabled(debug?: TimingOptions['debug']): boolean {
  if (!debug) return false;
  if (typeof debug === 'boolean') return debug;

  const v = process.env[debug.envVar];
  return v === 'true';
}

function maybeRound(n: number, round?: boolean): number {
  return round ? Math.round(n) : n;
}

export function createTiming(label: string, options?: TimingOptions) {
  const startedAt = nowMs();
  const marks: Array<{ name: string; t: number }> = [{ name: 'start', t: startedAt }];

  function mark(name: string) {
    marks.push({ name, t: nowMs() });
  }

  function snapshot(): TimingSnapshot {
    const out: TimingSnapshot = {};
    for (let i = 1; i < marks.length; i++) {
      const prev = marks[i - 1];
      const cur = marks[i];
      out[cur.name] = maybeRound(cur.t - prev.t, options?.round);
    }

    const last = marks[marks.length - 1];
    out.total = maybeRound(last.t - startedAt, options?.round);

    return out;
  }

  function end(extra?: Record<string, unknown>) {
    const snap = snapshot();

    if (isDebugEnabled(options?.debug)) {
      if (extra) console.log(`[timing] ${label}`, { ...snap, ...extra });
      else console.log(`[timing] ${label}`, snap);
    }

    return snap;
  }

  return {
    mark,
    snapshot,
    end,
  };
}
