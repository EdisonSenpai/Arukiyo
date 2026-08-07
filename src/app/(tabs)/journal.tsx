import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { ScreenHeader } from "@/components/ScreenHeader";
import { COLORS, RADII, SPACING } from "@/constants/theme";
import { useLandmarkJournal } from "@/hooks/useLandmarkJournal";
import type {
  UnlockedLandmarkSummary,
} from "@/lib/landmark-db";

type JournalSection =
  | "landmarks"
  | "stamps"
  | "collections";

export default function JournalScreen() {
  const { i18n, t } = useTranslation();
  const {
    error,
    isLoading,
    landmarks,
  } = useLandmarkJournal();
  const [section, setSection] =
    useState<JournalSection>("landmarks");

  const locale = i18n.resolvedLanguage ?? "en";
  const iconicCount = useMemo(
    () =>
      landmarks.filter(
        (landmark) =>
          landmark.importanceTier === "iconic",
      ).length,
    [landmarks],
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow={t("journal.eyebrow")}
          subtitle={t("landmark.journal.subtitle")}
          title={t("journal.title")}
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              color={COLORS.white}
              name="book"
              size={24}
            />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryEyebrow}>
              {t("landmark.journal.collectionEyebrow")}
            </Text>
            <Text style={styles.summaryTitle}>
              {t("landmark.journal.discoveredCount", {
                count: landmarks.length,
              })}
            </Text>
            <Text style={styles.summaryText}>
              {t("landmark.journal.iconicCount", {
                count: iconicCount,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.segmented}>
          <SegmentButton
            active={section === "landmarks"}
            icon="location-outline"
            label={t("landmark.journal.landmarks")}
            onPress={() => setSection("landmarks")}
          />
          <SegmentButton
            active={section === "stamps"}
            icon="ribbon-outline"
            label={t("landmark.journal.stamps")}
            onPress={() => setSection("stamps")}
          />
          <SegmentButton
            active={section === "collections"}
            icon="albums-outline"
            label={t("landmark.journal.collections")}
            onPress={() => setSection("collections")}
          />
        </View>

        {section === "landmarks" ? (
          <LandmarksSection
            error={error}
            isLoading={isLoading}
            landmarks={landmarks}
            locale={locale}
          />
        ) : section === "stamps" ? (
          <PlaceholderSection
            copy={t("landmark.journal.stampsCopy")}
            icon="ribbon-outline"
            title={t("landmark.journal.stamps")}
          />
        ) : (
          <PlaceholderSection
            copy={t(
              "landmark.journal.collectionsCopy",
            )}
            icon="albums-outline"
            title={t(
              "landmark.journal.collections",
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LandmarksSection({
  error,
  isLoading,
  landmarks,
  locale,
}: {
  error: string | null;
  isLoading: boolean;
  landmarks: UnlockedLandmarkSummary[];
  locale: string;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.stateCard}>
        <ActivityIndicator
          color={COLORS.vermilion}
        />
        <Text style={styles.stateText}>
          {t("landmark.journal.loading")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateCard}>
        <Ionicons
          color={COLORS.vermilion}
          name="alert-circle-outline"
          size={24}
        />
        <Text style={styles.stateText}>
          {t("landmark.journal.error")}
        </Text>
      </View>
    );
  }

  if (landmarks.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons
            color={COLORS.gold}
            name="compass-outline"
            size={31}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {t("landmark.journal.emptyTitle")}
        </Text>
        <Text style={styles.emptyCopy}>
          {t("landmark.journal.emptyCopy")}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.landmarkList}>
      {landmarks.map((landmark) => (
        <LandmarkJournalCard
          key={landmark.id}
          landmark={landmark}
          locale={locale}
        />
      ))}
    </View>
  );
}

function LandmarkJournalCard({
  landmark,
  locale,
}: {
  landmark: UnlockedLandmarkSummary;
  locale: string;
}) {
  const { t } = useTranslation();
  const discoveredAt =
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(
      new Date(landmark.discovery.unlockedAt),
    );

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/landmark-detail",
          params: {
            id: landmark.id,
          },
        })
      }
      style={({ pressed }) => [
        styles.landmarkCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.landmarkSeal}>
        <Ionicons
          color={COLORS.white}
          name={categoryIcon(landmark.category)}
          size={23}
        />
      </View>

      <View style={styles.landmarkBody}>
        <View style={styles.landmarkMetaRow}>
          <Text style={styles.landmarkTier}>
            {t(
              `landmark.tier.${landmark.importanceTier}`,
            )}
          </Text>
          <Text style={styles.landmarkCategory}>
            {t(
              `landmark.category.${landmark.category}`,
            )}
          </Text>
        </View>

        <Text
          numberOfLines={2}
          style={styles.landmarkName}
        >
          {landmark.name}
        </Text>

        <View style={styles.discoveryRow}>
          <Ionicons
            color={COLORS.matcha}
            name="checkmark-circle"
            size={14}
          />
          <Text style={styles.discoveryText}>
            {t("landmark.journal.discoveredOn", {
              date: discoveredAt,
            })}
          </Text>
        </View>
      </View>

      <Ionicons
        color={COLORS.muted}
        name="chevron-forward"
        size={20}
      />
    </Pressable>
  );
}

function SegmentButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segmentButton,
        active && styles.segmentButtonActive,
      ]}
    >
      <Ionicons
        color={
          active ? COLORS.white : COLORS.muted
        }
        name={icon}
        size={17}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.segmentText,
          active && styles.segmentTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PlaceholderSection({
  copy,
  icon,
  title,
}: {
  copy: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
}) {
  return (
    <View style={styles.placeholderCard}>
      <Ionicons
        color={COLORS.gold}
        name={icon}
        size={33}
      />
      <Text style={styles.placeholderTitle}>
        {title}
      </Text>
      <Text style={styles.placeholderCopy}>
        {copy}
      </Text>
    </View>
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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.paper,
    flex: 1,
  },
  content: {
    gap: SPACING.large,
    paddingBottom: 36,
    paddingHorizontal: SPACING.medium,
    paddingTop: 12,
  },
  summaryCard: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.large,
    flexDirection: "row",
    gap: 13,
    padding: 17,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderRadius: 18,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryEyebrow: {
    color: COLORS.sakuraSoft,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  summaryTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 3,
  },
  summaryText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    marginTop: 3,
  },
  segmented: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 3,
    padding: 4,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: RADII.pill,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 7,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.vermilion,
  },
  segmentText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: COLORS.white,
  },
  landmarkList: {
    gap: 10,
  },
  landmarkCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 13,
  },
  landmarkSeal: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  landmarkBody: {
    flex: 1,
    minWidth: 0,
  },
  landmarkMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  landmarkTier: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  landmarkCategory: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "800",
  },
  landmarkName: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4,
  },
  discoveryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
  discoveryText: {
    color: COLORS.matcha,
    fontSize: 9,
    fontWeight: "800",
  },
  stateCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  stateText: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.large,
    borderWidth: 1,
    padding: 28,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: COLORS.paperStrong,
    borderRadius: 24,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  emptyTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 13,
  },
  emptyCopy: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    textAlign: "center",
  },
  placeholderCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.large,
    borderWidth: 1,
    padding: 28,
  },
  placeholderTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 10,
  },
  placeholderCopy: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
});
