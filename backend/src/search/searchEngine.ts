import Fuse from "fuse.js";
import incentivesRaw from "../data/incentives.json";
import programItemsRaw from "../data/program-items.json";
import synonymsRaw from "../data/synonyms.json";
import { normalize } from "./normalize";

export interface Incentive {
  id: string;
  name: string;
  description: string;
  sahe_tags: string[];
  keywords: string[];
  related_items: string[];
}

export interface ProgramItem {
  id: string;
  bend_no: string;
  title: string;
  text: string;
  netice: string;
  executor: string;
  executor_code: string;
  other_executors: string[];
  other_executor_codes: string;
  muddet: string;
  sahe_tags: string[];
  keywords: string[];
}

const incentives = incentivesRaw as Incentive[];
const programItems = programItemsRaw as ProgramItem[];
const synonyms = synonymsRaw as Record<string, string[]>;

// Each synonym group (base term + its alternate spellings/related words) is
// attached to a record if ANY word in the group already appears in that
// record's own tags/keywords/title/description - not just an exact sahe_tag
// match, since synonym groups are often narrower than the broad sahe_tags
// (e.g. "quşçuluq" synonyms should still attach to items tagged only
// "heyvandarlıq" that already mention "qusculuq" in their keywords).
const synonymGroups: { words: string[]; normWords: string[] }[] = Object.entries(
  synonyms
).map(([base, extra]) => {
  const words = [base, ...extra];
  return { words, normWords: words.map(normalize) };
});

function expandedKeywords(sahe_tags: string[], keywords: string[], extraText: string): string {
  const ownBlob = normalize([...sahe_tags, ...keywords, extraText].join(" "));
  const matchedGroups = synonymGroups.filter((g) =>
    g.normWords.some((w) => ownBlob.includes(w))
  );
  const extra = matchedGroups.flatMap((g) => g.words);
  return normalize([...keywords, ...sahe_tags, ...extra].join(" "));
}

interface IndexedIncentive extends Incentive {
  _norm_name: string;
  _norm_desc: string;
  _norm_keywords: string;
}

interface IndexedProgramItem extends ProgramItem {
  _norm_title: string;
  _norm_keywords: string;
}

const indexedIncentives: IndexedIncentive[] = incentives.map((i) => ({
  ...i,
  _norm_name: normalize(i.name),
  _norm_desc: normalize(i.description),
  _norm_keywords: expandedKeywords(i.sahe_tags, i.keywords, `${i.name} ${i.description}`),
}));

const indexedProgramItems: IndexedProgramItem[] = programItems.map((p) => ({
  ...p,
  _norm_title: normalize(p.title),
  _norm_keywords: expandedKeywords(p.sahe_tags, p.keywords, `${p.title} ${p.netice}`),
}));

const incentiveFuse = new Fuse(indexedIncentives, {
  keys: [
    { name: "_norm_name", weight: 0.4 },
    { name: "_norm_keywords", weight: 0.4 },
    { name: "_norm_desc", weight: 0.2 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 3,
  includeScore: true,
});

const programItemFuse = new Fuse(indexedProgramItems, {
  keys: [
    { name: "_norm_keywords", weight: 0.5 },
    { name: "_norm_title", weight: 0.5 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 3,
  includeScore: true,
});

const MAX_RESULTS_PER_CATEGORY = 8;

export interface SearchResult {
  query: string;
  incentives: Incentive[];
  programItems: ProgramItem[];
}

export function search(rawQuery: string): SearchResult {
  const q = normalize(rawQuery);
  if (!q) {
    return { query: rawQuery, incentives: [], programItems: [] };
  }

  const incentiveHits = incentiveFuse
    .search(q)
    .slice(0, MAX_RESULTS_PER_CATEGORY)
    .map((r) => r.item);
  const programItemHits = programItemFuse
    .search(q)
    .slice(0, MAX_RESULTS_PER_CATEGORY)
    .map((r) => r.item);

  return {
    query: rawQuery,
    incentives: incentiveHits.map(stripIncentive),
    programItems: programItemHits.map(stripProgramItem),
  };
}

function stripIncentive(i: IndexedIncentive): Incentive {
  const { _norm_name, _norm_desc, _norm_keywords, ...rest } = i;
  return rest;
}

function stripProgramItem(p: IndexedProgramItem): ProgramItem {
  const { _norm_title, _norm_keywords, ...rest } = p;
  return rest;
}

export function listAllSaheTags(): string[] {
  const tags = new Set<string>();
  for (const i of incentives) i.sahe_tags.forEach((t) => tags.add(t));
  for (const p of programItems) p.sahe_tags.forEach((t) => tags.add(t));
  return Array.from(tags).sort();
}
