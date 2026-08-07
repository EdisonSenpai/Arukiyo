import type { SQLiteDatabase } from "expo-sqlite";

import {
  getLandmarkContentCache,
  saveLandmarkContentCache,
  type LandmarkContentCache,
  type UnlockedLandmarkSummary,
} from "@/lib/landmark-db";

const CONTENT_CACHE_TTL_MS =
  30 * 24 * 60 * 60 * 1_000;

type WikipediaSummaryResponse = {
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
  description?: string;
  extract?: string;
  thumbnail?: {
    source?: string;
  };
  title?: string;
};

type WikidataResponse = {
  entities?: Record<
    string,
    {
      descriptions?: Record<
        string,
        {
          value?: string;
        }
      >;
      sitelinks?: Record<
        string,
        {
          title?: string;
        }
      >;
    }
  >;
};

export type LandmarkContent = LandmarkContentCache & {
  fromCache: boolean;
};

export async function loadLandmarkContent(
  database: SQLiteDatabase,
  landmark: UnlockedLandmarkSummary,
  preferredLanguage: string,
  force = false,
): Promise<LandmarkContent> {
  const language = normalizeLanguage(preferredLanguage);
  const cached = await getLandmarkContentCache(
    database,
    landmark.id,
    language,
  );

  if (
    !force &&
    cached &&
    isFresh(cached.fetchedAt)
  ) {
    return {
      ...cached,
      fromCache: true,
    };
  }

  const resolved = await resolveWikipediaArticle(
    landmark,
    language,
  );

  let summary: WikipediaSummaryResponse | null = null;

  if (resolved) {
    summary = await fetchWikipediaSummary(
      resolved.language,
      resolved.title,
    ).catch(() => null);
  }

  const content: LandmarkContentCache = {
    fetchedAt: new Date().toISOString(),
    imageUrl: summary?.thumbnail?.source ?? null,
    language,
    landmarkId: landmark.id,
    sourceLanguage: resolved?.language ?? null,
    summary: cleanText(summary?.extract) ?? null,
    title: summary?.title ?? resolved?.title ?? null,
    wikipediaUrl:
      summary?.content_urls?.desktop?.page ??
      resolved?.url ??
      null,
    wikidataDescription:
      resolved?.wikidataDescription ??
      cleanText(summary?.description) ??
      null,
  };

  await saveLandmarkContentCache(database, content);

  return {
    ...content,
    fromCache: false,
  };
}

export function quickFactsForLandmark(
  landmark: UnlockedLandmarkSummary,
): {
  key: string;
  value: string;
}[] {
  const tags = landmark.tags;
  const candidates: [
    string,
    string | undefined,
  ][] = [
    ["historic", tags.historic],
    ["heritage", tags.heritage],
    ["startDate", tags.start_date],
    ["architect", tags.architect],
    ["religion", tags.religion],
    ["denomination", tags.denomination],
    ["tourism", tags.tourism],
    ["building", tags.building],
    ["operator", tags.operator],
  ];

  return candidates
    .filter(
      (entry): entry is [string, string] =>
        Boolean(entry[1]?.trim()),
    )
    .map(([key, value]) => ({
      key,
      value: humanizeTagValue(value),
    }))
    .slice(0, 7);
}

function normalizeLanguage(language: string): string {
  const value = language.toLowerCase().split("-")[0];

  return ["en", "ro", "ja"].includes(value)
    ? value
    : "en";
}

function isFresh(value: string): boolean {
  const timestamp = Date.parse(value);

  return (
    Number.isFinite(timestamp) &&
    Date.now() - timestamp < CONTENT_CACHE_TTL_MS
  );
}

async function resolveWikipediaArticle(
  landmark: UnlockedLandmarkSummary,
  preferredLanguage: string,
): Promise<{
  language: string;
  title: string;
  url: string;
  wikidataDescription: string | null;
} | null> {
  const direct = parseWikipediaTag(
    landmark.wikipediaTag,
  );

  if (direct) {
    return {
      ...direct,
      wikidataDescription: null,
    };
  }

  if (!landmark.wikidataId) {
    return null;
  }

  const languages = Array.from(
    new Set([
      preferredLanguage,
      "ro",
      "en",
      "ja",
    ]),
  );

  const sites = languages
    .map((language) => `${language}wiki`)
    .join("|");

  const url =
    "https://www.wikidata.org/w/api.php" +
    `?action=wbgetentities&format=json&origin=*` +
    `&ids=${encodeURIComponent(
      landmark.wikidataId,
    )}` +
    `&props=descriptions|sitelinks` +
    `&languages=${encodeURIComponent(
      languages.join("|"),
    )}` +
    `&sitefilter=${encodeURIComponent(sites)}`;

  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const data =
    (await response.json()) as WikidataResponse;
  const entity =
    data.entities?.[landmark.wikidataId];

  if (!entity) {
    return null;
  }

  const selectedLanguage = languages.find(
    (language) =>
      entity.sitelinks?.[`${language}wiki`]?.title,
  );

  if (!selectedLanguage) {
    return null;
  }

  const title =
    entity.sitelinks?.[
      `${selectedLanguage}wiki`
    ]?.title;

  if (!title) {
    return null;
  }

  const descriptionLanguage =
    languages.find(
      (language) =>
        entity.descriptions?.[language]?.value,
    ) ?? null;

  return {
    language: selectedLanguage,
    title,
    url: wikipediaPageUrl(
      selectedLanguage,
      title,
    ),
    wikidataDescription:
      descriptionLanguage
        ? entity.descriptions?.[
            descriptionLanguage
          ]?.value ?? null
        : null,
  };
}

function parseWikipediaTag(
  wikipediaTag: string | null,
): {
  language: string;
  title: string;
  url: string;
} | null {
  if (!wikipediaTag) {
    return null;
  }

  const separator = wikipediaTag.indexOf(":");

  if (separator <= 0) {
    return null;
  }

  const language = wikipediaTag
    .slice(0, separator)
    .trim()
    .toLowerCase();
  const title = wikipediaTag
    .slice(separator + 1)
    .trim();

  if (!language || !title) {
    return null;
  }

  return {
    language,
    title,
    url: wikipediaPageUrl(language, title),
  };
}

async function fetchWikipediaSummary(
  language: string,
  title: string,
): Promise<WikipediaSummaryResponse> {
  const url =
    `https://${language}.wikipedia.org` +
    `/api/rest_v1/page/summary/` +
    encodeURIComponent(
      title.replace(/ /g, "_"),
    );

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Wikipedia returned HTTP ${response.status}.`,
    );
  }

  return (await response.json()) as WikipediaSummaryResponse;
}

function wikipediaPageUrl(
  language: string,
  title: string,
): string {
  return (
    `https://${language}.wikipedia.org/wiki/` +
    encodeURIComponent(
      title.replace(/ /g, "_"),
    )
  );
}

function cleanText(
  value: string | undefined,
): string | null {
  const normalized = value
    ?.replace(/\s+/g, " ")
    .trim();

  return normalized ? normalized : null;
}

function humanizeTagValue(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}
