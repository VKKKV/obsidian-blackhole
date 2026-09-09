import type { BlackHoleSettings } from './config';

type Metric = BlackHoleSettings['tokenMetric'];
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const WORD = /[\p{L}\p{N}_]/u;
const MARK = /\p{M}/u;

/** Count CJK characters and non-CJK words without allocating a full match array. */
export function countWords(text: string): number {
  let count = 0;
  let inWord = false;
  for (const char of text) {
    if (CJK.test(char)) {
      count++;
      inWord = false;
    } else if (WORD.test(char)) {
      if (!inWord) count++;
      inWord = true;
    } else if (!(inWord && (MARK.test(char) || char === "'" || char === '’'))) {
      inWord = false;
    }
  }
  return count;
}

export interface MetricSource {
  currentText(): string | null;
  markdownFileCount(): number;
  markdownTabCount(): number;
}

/** Event-invalidated raw counts; idle polls never read the editor or vault again. */
export class MetricCache {
  private values = new Map<Metric, number>();
  private dirty = new Set<Metric>();
  private lastRead = new Map<Metric, number>();

  constructor(private source: MetricSource, private throttleMs = 1000) {}

  invalidate(...metrics: Metric[]) {
    for (const metric of metrics) this.dirty.add(metric);
  }

  clear() {
    this.values.clear();
    this.dirty.clear();
    this.lastRead.clear();
  }

  level(settings: BlackHoleSettings, now: number): number {
    if (settings.sizeMode !== 1) return -1;
    const metric = settings.tokenMetric;
    if (!this.values.has(metric) || (this.dirty.has(metric)
        && now - (this.lastRead.get(metric) ?? -Infinity) >= this.throttleMs)) {
      let count: number;
      switch (metric) {
        case 'word-count': {
          const text = this.source.currentText();
          count = text === null ? -1 : countWords(text);
          break;
        }
        // Kept as an explicitly labelled estimate, not a vault-wide text scan.
        case 'global-word-count': count = this.source.markdownFileCount() * 500; break;
        case 'file-count': count = this.source.markdownFileCount(); break;
        case 'tab-count': count = this.source.markdownTabCount(); break;
      }
      this.values.set(metric, count);
      this.lastRead.set(metric, now);
      this.dirty.delete(metric);
    }
    const count = this.values.get(metric)!;
    if (count < 0) return -1;
    const max = metric === 'file-count' ? 1000 : metric === 'tab-count' ? 20 : settings.maxWordCount;
    return Math.min(count / max, 1);
  }
}
