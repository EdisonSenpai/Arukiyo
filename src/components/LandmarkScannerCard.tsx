import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { COLORS, RADII } from "@/constants/theme";
import type {
  NearbyLandmarksState,
} from "@/hooks/useNearbyLandmarks";
import type { NearbyLandmark } from "@/lib/landmarks";

export function LandmarkScannerCard({
  hasLocation,
  state: landmarks,
}: {
  hasLocation: boolean;
  state: NearbyLandmarksState;
}) {
  const { i18n, t } = useTranslation();

  const locale = i18n.resolvedLanguage ?? "en";
  const nearest = landmarks.eligibleLandmarks[0];

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>
            {t("landmark.engine.eyebrow")}
          </Text>
          <Text style={styles.title}>
            {t("landmark.engine.title")}
          </Text>
        </View>

        <View style={styles.radar}>
          {landmarks.status === "loading" ? (
            <ActivityIndicator
              color={COLORS.vermilion}
              size="small"
            />
          ) : (
            <Ionicons
              color={COLORS.vermilion}
              name="compass-outline"
              size={22}
            />
          )}
        </View>
      </View>

      <Text style={styles.subtitle}>
        {t("landmark.engine.subtitle")}
      </Text>

      {!hasLocation ? (
        <View style={styles.notice}>
          <Ionicons
            color={COLORS.gold}
            name="location-outline"
            size={18}
          />
          <Text style={styles.noticeText}>
            {t("landmark.engine.noLocation")}
          </Text>
        </View>
      ) : landmarks.status === "loading" ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {t("landmark.engine.scanning")}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {t("landmark.engine.summary", {
                cached:
                  landmarks.cachedCandidateCount,
                eligible:
                  landmarks.eligibleLandmarks.length,
                raw: landmarks.rawCandidateCount,
              })}
            </Text>
            {landmarks.source ? (
              <View style={styles.sourcePill}>
                <Text style={styles.sourceText}>
                  {landmarks.source === "network"
                    ? t("landmark.engine.network")
                    : t("landmark.engine.cache")}
                </Text>
              </View>
            ) : null}
          </View>

          {landmarks.error &&
          landmarks.landmarks.length > 0 ? (
            <Text style={styles.warningText}>
              {t(
                "landmark.engine.networkFallback",
              )}
            </Text>
          ) : null}

          {nearest ? (
            <LandmarkPreview
              landmark={nearest}
              locale={locale}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                color={COLORS.muted}
                name="map-outline"
                size={20}
              />
              <Text style={styles.emptyText}>
                {t("landmark.engine.none")}
              </Text>
            </View>
          )}
        </>
      )}

      {landmarks.status === "error" &&
      landmarks.landmarks.length === 0 ? (
        <View style={styles.errorState}>
          <Ionicons
            color={COLORS.vermilion}
            name="cloud-offline-outline"
            size={19}
          />
          <Text style={styles.errorText}>
            {landmarks.error}
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footnote}>
          {t("landmark.engine.footnote")}
        </Text>

        <Pressable
          disabled={
            !hasLocation ||
            landmarks.status === "loading"
          }
          onPress={() => {
            void landmarks.scan(true);
          }}
          style={({ pressed }) => [
            styles.refreshButton,
            (!hasLocation ||
              landmarks.status === "loading") &&
              styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            color={COLORS.ink}
            name="refresh"
            size={15}
          />
          <Text style={styles.refreshText}>
            {t("landmark.engine.refresh")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function LandmarkPreview({
  landmark,
  locale,
}: {
  landmark: NearbyLandmark;
  locale: string;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.landmark}>
      <View style={styles.landmarkIcon}>
        <Ionicons
          color={COLORS.white}
          name={iconForCategory(landmark.category)}
          size={21}
        />
      </View>

      <View style={styles.landmarkCopy}>
        <Text style={styles.nearestLabel}>
          {t("landmark.engine.nearest")}
        </Text>
        <Text
          numberOfLines={2}
          style={styles.landmarkName}
        >
          {landmark.name}
        </Text>
        <Text style={styles.landmarkMeta}>
          {t(
            `landmark.category.${landmark.category}`,
          )}{" "}
          ·{" "}
          {t(
            `landmark.tier.${landmark.importanceTier}`,
          )}{" "}
          ·{" "}
          {t("landmark.engine.score", {
            score: landmark.importanceScore,
          })}
        </Text>
      </View>

      <Text style={styles.distance}>
        {t("landmark.engine.distance", {
          distance: formatDistance(
            landmark.distanceMeters,
            locale,
          ),
        })}
      </Text>
    </View>
  );
}

function iconForCategory(
  category: NearbyLandmark["category"],
): React.ComponentProps<typeof Ionicons>["name"] {
  switch (category) {
    case "museum":
      return "business-outline";
    case "historic":
      return "library-outline";
    case "culture":
      return "color-palette-outline";
    case "civic":
      return "business-outline";
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

function formatDistance(
  meters: number,
  locale: string,
): string {
  if (meters < 1_000) {
    return `${Math.round(meters)} m`;
  }

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  }).format(meters / 1_000)} km`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.large,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  headingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headingCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: COLORS.vermilion,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  radar: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 17,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
  },
  notice: {
    alignItems: "center",
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADII.medium,
    flexDirection: "row",
    gap: 8,
    padding: 11,
  },
  noticeText: {
    color: COLORS.inkSoft,
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  summaryText: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 9,
    fontWeight: "800",
  },
  sourcePill: {
    backgroundColor: COLORS.matchaSoft,
    borderRadius: RADII.pill,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  sourceText: {
    color: COLORS.matcha,
    fontSize: 8,
    fontWeight: "900",
  },
  warningText: {
    color: COLORS.gold,
    fontSize: 9,
    lineHeight: 14,
  },
  landmark: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.medium,
    flexDirection: "row",
    gap: 11,
    padding: 13,
  },
  landmarkIcon: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderRadius: 15,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  landmarkCopy: {
    flex: 1,
    minWidth: 0,
  },
  nearestLabel: {
    color: COLORS.sakuraSoft,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  landmarkName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  landmarkMeta: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 8,
    marginTop: 4,
  },
  distance: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "900",
    maxWidth: 70,
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: COLORS.paper,
    borderRadius: RADII.medium,
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  emptyText: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  errorState: {
    alignItems: "flex-start",
    backgroundColor: "#FBE9E6",
    borderRadius: RADII.medium,
    flexDirection: "row",
    gap: 8,
    padding: 11,
  },
  errorText: {
    color: COLORS.inkSoft,
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  footer: {
    alignItems: "center",
    borderTopColor: COLORS.line,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingTop: 11,
  },
  footnote: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 8,
    lineHeight: 13,
  },
  refreshButton: {
    alignItems: "center",
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  refreshText: {
    color: COLORS.ink,
    fontSize: 9,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
