import routingRulesRaw from "../data/routing-rules.json";
import { search } from "../search/searchEngine";

interface RoutingRules {
  groups: Record<string, string>;
  sahe_tag_to_group: Record<string, string>;
  default_group: string;
}

const routingRules = routingRulesRaw as unknown as RoutingRules;

function firstTagFor(text: string): string | undefined {
  const result = search(text);
  return result.incentives[0]?.sahe_tags[0] ?? result.programItems[0]?.sahe_tags[0];
}

// Investors can freely edit the auto-filled field text (e.g. append words to
// a matched clause title), which can make the combined phrase fuzzy-match
// nothing even though individual words still would. Try the full text first,
// then fall back to searching word by word.
export function resolveRoutingGroup(fieldText: string): string {
  const tag =
    firstTagFor(fieldText) ??
    fieldText
      .split(/\s+/)
      .filter((word) => word.length >= 3)
      .map(firstTagFor)
      .find((t): t is string => Boolean(t));

  if (tag && routingRules.sahe_tag_to_group[tag]) {
    return routingRules.sahe_tag_to_group[tag];
  }
  return routingRules.default_group;
}
