export interface SearchableGig {
  title: string;
  description: string;
  category: string;
  tags?: string[];
}

const intentTerms: Record<string, string[]> = {
  Electrical: ["electric", "electrical", "electrician", "wire", "wires", "wiring", "socket", "switch", "breaker", "fuse", "power", "light", "lights", "fan", "short circuit", "sparking"],
  Plumbing: ["plumb", "plumber", "plumbing", "pipe", "pipes", "tap", "faucet", "leak", "leaking", "drain", "toilet", "sink", "water", "sewer", "geyser"],
  Cleaning: ["clean", "cleaner", "cleaning", "wash", "washing", "dust", "dusting", "mop", "stain", "dirty", "sofa", "carpet", "kitchen cleanup"],
  Painting: ["paint", "painter", "painting", "repaint", "wall color", "colour", "wallpaper", "polish"],
  Carpentry: ["carpenter", "carpentry", "wood", "wooden", "furniture", "cabinet", "door", "wardrobe", "shelf", "table", "chair"],
  Construction: ["construct", "construction", "build", "builder", "renovate", "renovation", "masonry", "brick", "cement", "roof", "ceiling", "tiles", "floor"],
  Security: ["security", "secure", "guard", "camera", "cctv", "alarm", "lock", "surveillance"],
};

const stopWords = new Set(["i", "a", "an", "the", "my", "our", "me", "we", "want", "need", "please", "to", "for", "in", "at", "on", "of", "some", "someone", "who", "can", "help", "with", "get", "make", "do", "fix", "repair", "service", "house", "home"]);

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function inferSearchIntent(query: string) {
  const normalized = normalize(query);
  let best: { category: string; score: number } | null = null;
  for (const [category, terms] of Object.entries(intentTerms)) {
    const score = terms.reduce((total, term) => total + (normalized.includes(term) ? Math.max(2, term.split(" ").length * 3) : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { category, score };
  }
  return best?.category ?? null;
}

export function rankGigsByIntent<T extends SearchableGig>(gigs: T[], query: string, selectedCategory = "") {
  const normalizedQuery = normalize(query);
  const inferredCategory = inferSearchIntent(query);
  const tokens = normalizedQuery.split(" ").filter((token) => token.length > 1 && !stopWords.has(token));
  const ranked = gigs.map((gig) => {
    const title = normalize(gig.title);
    const description = normalize(gig.description);
    const category = normalize(gig.category);
    const tags = normalize((gig.tags ?? []).join(" "));
    if (selectedCategory && category !== normalize(selectedCategory)) return { gig, score: -1 };
    let score = 0;
    if (normalizedQuery && title.includes(normalizedQuery)) score += 20;
    if (inferredCategory && category === normalize(inferredCategory)) score += 14;
    for (const token of tokens) {
      if (title.includes(token)) score += 6;
      if (tags.includes(token)) score += 4;
      if (category.includes(token)) score += 5;
      if (description.includes(token)) score += 2;
    }
    if (!normalizedQuery && selectedCategory) score = 1;
    return { gig, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
  return { gigs: ranked.map(({ gig }) => gig), inferredCategory };
}
