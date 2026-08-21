import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { COLORS, RADII, SPACING } from "@/constants/theme";
import {
  getUnlockedLandmark,
  type UnlockedLandmarkSummary,
} from "@/lib/landmark-db";
import {
  loadLandmarkContent,
  quickFactsForLandmark,
  type LandmarkContent,
} from "@/lib/landmark-content";

export default function LandmarkDetailScreen() {
  const database = useSQLiteContext();
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();
  const { i18n, t } = useTranslation();

  const [landmark, setLandmark] =
    useState<UnlockedLandmarkSummary | null>(null);
  const [content, setContent] =
    useState<LandmarkContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoading, setContentLoading] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const landmarkId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;
  const locale = i18n.resolvedLanguage ?? "en";

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!landmarkId) {
        setError(t("landmark.detail.notFound"));
        setIsLoading(false);
        return;
      }

      try {
        const value = await getUnlockedLandmark(
          database,
          landmarkId,
        );

        if (!value) {
          throw new Error("Landmark not found");
        }

        if (!mounted) {
          return;
        }

        setLandmark(value);
        setIsLoading(false);
        setContentLoading(true);

        const enriched = await loadLandmarkContent(
          database,
          value,
          locale,
        ).catch(() => null);

        if (mounted) {
          setContent(enriched);
        }
      } catch {
        if (mounted) {
          setError(t("landmark.detail.notFound"));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setContentLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [database, landmarkId, locale, t]);

  const facts = useMemo(
    () =>
      landmark
        ? quickFactsForLandmark(landmark)
        : [],
    [landmark],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator
          color={COLORS.vermilion}
        />
        <Text style={styles.loadingText}>
          {t("landmark.detail.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  if (!landmark || error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons
          color={COLORS.vermilion}
          name="alert-circle-outline"
          size={36}
        />
        <Text style={styles.errorText}>
          {error ?? t("landmark.detail.notFound")}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {t("common.back")}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const discoveredAt =
    new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: "short",
    }).format(
      new Date(landmark.discovery.unlockedAt),
    );

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel={t("common.back")}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              color={COLORS.ink}
              name="arrow-back"
              size={22}
            />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>
              {t("landmark.detail.eyebrow")}
            </Text>
            <Text style={styles.title}>
              {landmark.name}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          {content?.imageUrl ? (
            <Image
              resizeMode="cover"
              source={{
                uri: content.imageUrl,
              }}
              style={styles.heroImage}
            />
          ) : (
            <View style={styles.heroFallback}>
              <Ionicons
                color={COLORS.sakuraSoft}
                name={categoryIcon(
                  landmark.category,
                )}
                size={54}
              />
            </View>
          )}

          <View style={styles.heroOverlay}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>
                {t(
                  `landmark.tier.${landmark.importanceTier}`,
                )}
              </Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>
                {t(
                  `landmark.category.${landmark.category}`,
                )}
              </Text>
            </View>
          </View>
        </View>

        {content?.imageUrl ? (
          <Text style={styles.imageCredit}>
            {t("landmark.detail.imageCredit")}
          </Text>
        ) : null}

        <View style={styles.discoveryCard}>
          <View style={styles.discoverySeal}>
            <Ionicons
              color={COLORS.white}
              name="checkmark"
              size={23}
            />
          </View>
          <View style={styles.discoveryCopy}>
            <Text style={styles.discoveryEyebrow}>
              {t("landmark.detail.yourDiscovery")}
            </Text>
            <Text style={styles.discoveryDate}>
              {discoveredAt}
            </Text>
          </View>
        </View>

        <SectionTitle
          title={t("landmark.detail.about")}
        />

        <View style={styles.textCard}>
          {contentLoading ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator
                color={COLORS.vermilion}
                size="small"
              />
              <Text style={styles.bodyText}>
                {t(
                  "landmark.detail.loadingSources",
                )}
              </Text>
            </View>
          ) : content?.summary ? (
            <Text style={styles.bodyText}>
              {content.summary}
            </Text>
          ) : content?.wikidataDescription ? (
            <Text style={styles.bodyText}>
              {content.wikidataDescription}
            </Text>
          ) : (
            <Text style={styles.bodyMuted}>
              {t(
                "landmark.detail.noVerifiedHistory",
              )}
            </Text>
          )}
        </View>

        {facts.length > 0 ? (
          <>
            <SectionTitle
              title={t(
                "landmark.detail.quickFacts",
              )}
            />
            <View style={styles.factsCard}>
              {facts.map((fact) => (
                <View
                  key={fact.key}
                  style={styles.factRow}
                >
                  <Text style={styles.factLabel}>
                    {t(
                      `landmark.detail.fact.${fact.key}`,
                    )}
                  </Text>
                  <Text style={styles.factValue}>
                    {fact.value}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <SectionTitle
          title={t(
            "landmark.detail.discoveryDetails",
          )}
        />

        <View style={styles.metricsGrid}>
          <Metric
            icon="navigate-outline"
            label={t(
              "landmark.detail.unlockDistance",
            )}
            value={formatMeters(
              landmark.discovery
                .unlockDistanceMeters,
            )}
          />
          <Metric
            icon="locate-outline"
            label={t(
              "landmark.detail.gpsAccuracy",
            )}
            value={formatMeters(
              landmark.discovery
                .gpsAccuracyMeters,
            )}
          />
          <Metric
            icon="walk-outline"
            label={t(
              "landmark.detail.journeyDistance",
            )}
            value={formatJourneyDistance(
              landmark.discovery
                .sessionDistanceMeters,
              locale,
            )}
          />
          <Metric
            icon="time-outline"
            label={t(
              "landmark.detail.journeyDuration",
            )}
            value={formatDuration(
              landmark.discovery
                .sessionDurationSeconds,
            )}
          />
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.rewardEyebrow}>
            {t("landmark.detail.reward")}
          </Text>
          <View style={styles.rewardRow}>
            <Reward
              icon="sparkles-outline"
              value={`+${landmark.discovery.reward.xp} XP`}
            />
            <Reward
              icon="leaf-outline"
              value={`+${landmark.discovery.reward.coins}`}
            />
            <Reward
              icon="flower-outline"
              value={`+${landmark.discovery.reward.sakuraShards}`}
            />
          </View>
        </View>

        <SectionTitle
          title={t("landmark.detail.sources")}
        />

        <View style={styles.sources}>
          {landmark.officialUrl ? (
            <SourceButton
              icon="globe-outline"
              label={t(
                "landmark.detail.officialWebsite",
              )}
              onPress={() =>
                openUrl(landmark.officialUrl)
              }
            />
          ) : null}

          {content?.wikipediaUrl ? (
            <SourceButton
              icon="library-outline"
              label="Wikipedia"
              onPress={() =>
                openUrl(content.wikipediaUrl)
              }
            />
          ) : null}

          {landmark.wikidataId ? (
            <SourceButton
              icon="analytics-outline"
              label="Wikidata"
              onPress={() =>
                openUrl(
                  `https://www.wikidata.org/wiki/${encodeURIComponent(
                    landmark.wikidataId ?? "",
                  )}`,
                )
              }
            />
          ) : null}

          <SourceButton
            icon="map-outline"
            label="OpenStreetMap"
            onPress={() =>
              openUrl(landmark.sourceUrl)
            }
          />
        </View>

        <Text style={styles.sourceNote}>
          {t("landmark.detail.sourceNote")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Ionicons
        color={COLORS.matcha}
        name={icon}
        size={19}
      />
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={styles.metricValue}
      >
        {value}
      </Text>
      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

function Reward({
  icon,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
}) {
  return (
    <View style={styles.reward}>
      <Ionicons
        color={COLORS.gold}
        name={icon}
        size={16}
      />
      <Text style={styles.rewardText}>
        {value}
      </Text>
    </View>
  );
}

function SourceButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sourceButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        color={COLORS.inkSoft}
        name={icon}
        size={20}
      />
      <Text style={styles.sourceLabel}>
        {label}
      </Text>
      <Ionicons
        color={COLORS.muted}
        name="open-outline"
        size={17}
      />
    </Pressable>
  );
}

function categoryIcon(
  category: UnlockedLandmarkSummary["category"],
): React.ComponentProps<typeof Ionicons>["name"] {
  switch (category) {
    case "museum":
    case "civic":
      return "business-outline";
    case "historic":
      return "library-outline";
    case "culture":
      return "color-palette-outline";
    case "education":
      return "school-outline";
    case "religious":
      return "sparkles-outline";
    case "attraction":
      return "camera-outline";
    default:
      return "location-outline";
  }
}

function formatMeters(
  value: number | null,
): string {
  return value === null
    ? "—"
    : `${Math.round(value)} m`;
}

function formatJourneyDistance(
  meters: number | null,
  locale: string,
): string {
  if (meters === null) {
    return "—";
  }

  if (meters < 1_000) {
    return `${Math.round(meters)} m`;
  }

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).format(meters / 1_000)} km`;
}

function formatDuration(
  seconds: number | null,
): string {
  if (seconds === null) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  if (minutes < 60) {
    return `${minutes}:${remaining
      .toString()
      .padStart(2, "0")}`;
  }

  const hours = Math.floor(minutes / 60);
  const minuteRemainder = minutes % 60;

  return `${hours}h ${minuteRemainder}m`;
}

function openUrl(url: string | null): void {
  if (!url) {
    return;
  }

  void Linking.openURL(url);
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.paper,
    flex: 1,
  },
  centered: {
    alignItems: "center",
    backgroundColor: COLORS.paper,
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 28,
  },
  content: {
    gap: SPACING.large,
    paddingBottom: 34,
    paddingHorizontal: SPACING.medium,
    paddingTop: 12,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  errorText: {
    color: COLORS.inkSoft,
    fontSize: 13,
    textAlign: "center",
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 15,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.vermilion,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    color: COLORS.ink,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 30,
    marginTop: 3,
  },
  hero: {
    backgroundColor: COLORS.ink,
    borderRadius: RADII.large,
    height: 230,
    overflow: "hidden",
    position: "relative",
  },
  heroImage: {
    height: "100%",
    width: "100%",
  },
  heroFallback: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  heroOverlay: {
    bottom: 12,
    flexDirection: "row",
    gap: 7,
    left: 12,
    position: "absolute",
  },
  heroPill: {
    backgroundColor: "rgba(23,35,31,0.88)",
    borderRadius: RADII.pill,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  heroPillText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  imageCredit: {
    color: COLORS.muted,
    fontSize: 8,
    marginTop: -12,
    textAlign: "right",
  },
  discoveryCard: {
    alignItems: "center",
    backgroundColor: COLORS.matchaSoft,
    borderColor: "#BFD1C0",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    padding: 13,
  },
  discoverySeal: {
    alignItems: "center",
    backgroundColor: COLORS.success,
    borderRadius: 17,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  discoveryCopy: {
    flex: 1,
  },
  discoveryEyebrow: {
    color: COLORS.matcha,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  discoveryDate: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  textCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    padding: 15,
  },
  bodyText: {
    color: COLORS.inkSoft,
    fontSize: 12,
    lineHeight: 19,
  },
  bodyMuted: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
  },
  inlineLoading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  factsCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    overflow: "hidden",
  },
  factRow: {
    borderBottomColor: COLORS.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  factLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  factValue: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "right",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    padding: 12,
    width: "48%",
  },
  metricValue: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 6,
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: 8,
    marginTop: 3,
    textAlign: "center",
  },
  rewardCard: {
    backgroundColor: COLORS.ink,
    borderRadius: RADII.medium,
    padding: 14,
  },
  rewardEyebrow: {
    color: COLORS.sakuraSoft,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  rewardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  reward: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  rewardText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "900",
  },
  sources: {
    gap: 8,
  },
  sourceButton: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 13,
  },
  sourceLabel: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 11,
    fontWeight: "900",
  },
  sourceNote: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 15,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADII.medium,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
});
