import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
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
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { COLORS, RADII, SPACING } from "@/constants/theme";
import {
  type ExplorationSessionDetails,
  getExplorationSessionDetails,
} from "@/lib/exploration-db";
import {
  awardSessionRewards,
  getSessionReward,
  type SessionRewardRecord,
} from "@/lib/progression-db";
import {
  formatDistance,
  formatDuration,
} from "@/lib/session-tracking";

export default function SessionSummaryScreen() {
  const database = useSQLiteContext();
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();
  const { i18n, t } = useTranslation();
  const [details, setDetails] =
    useState<ExplorationSessionDetails | null>(null);
  const [reward, setReward] =
    useState<SessionRewardRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;
  const locale = i18n.resolvedLanguage ?? "en";

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      if (!sessionId) {
        setError(t("session.errors.loadSummary"));
        setIsLoading(false);
        return;
      }

      try {
        const value =
          await getExplorationSessionDetails(
            database,
            sessionId,
          );

        if (!value) {
          throw new Error("Session not found");
        }

        let rewardValue = await getSessionReward(
          database,
          sessionId,
        );

        if (!rewardValue) {
          rewardValue = await awardSessionRewards(
            database,
            value,
          );
        }

        if (mounted) {
          setDetails(value);
          setReward(rewardValue);
        }
      } catch {
        if (mounted) {
          setError(t("session.errors.loadSummary"));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      mounted = false;
    };
  }, [database, sessionId, t]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={COLORS.vermilion} />
        <Text style={styles.loadingText}>
          {t("session.loading")}
        </Text>
      </SafeAreaView>
    );
  }

  if (!details || error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons
          color={COLORS.vermilion}
          name="alert-circle-outline"
          size={38}
        />
        <Text style={styles.errorText}>
          {error ?? t("session.errors.loadSummary")}
        </Text>
        <Pressable
          onPress={() => router.replace("/explore")}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>
            {t("session.backToExplore")}
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const endedAt = details.endedAt
    ? dateFormatter.format(new Date(details.endedAt))
    : "—";
  const startedAt = dateFormatter.format(
    new Date(details.startedAt),
  );
  const leveledUp =
    reward !== null &&
    reward.newLevel > reward.previousLevel;

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
              size={23}
            />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>
              {t("session.summaryEyebrow")}
            </Text>
            <Text style={styles.title}>
              {t("session.summaryTitle")}
            </Text>
            <Text style={styles.subtitle}>
              {t("session.summarySubtitle")}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons
                color={COLORS.white}
                name="walk"
                size={30}
              />
            </View>
            <View
              style={[
                styles.statusPill,
                details.status === "interrupted" &&
                  styles.statusInterrupted,
              ]}
            >
              <Text style={styles.statusText}>
                {t(`session.status.${details.status}`)}
              </Text>
            </View>
          </View>

          <Text style={styles.heroDistance}>
            {formatDistance(
              details.distanceMeters,
              locale,
            )}
          </Text>
          <Text style={styles.heroLabel}>
            {t("session.distance")}
          </Text>

          <View style={styles.heroMetrics}>
            <HeroMetric
              label={t("session.duration")}
              value={formatDuration(
                details.durationSeconds,
              )}
            />
            <HeroMetric
              label={t("session.newCells")}
              value={String(details.discoveredCells)}
            />
            <HeroMetric
              label={t("session.gpsPoints")}
              value={String(details.acceptedPoints)}
            />
          </View>
        </View>

        {leveledUp && reward ? (
          <View style={styles.levelUpCard}>
            <View style={styles.levelUpBurst}>
              <Ionicons
                color={COLORS.white}
                name="sparkles"
                size={29}
              />
            </View>
            <View style={styles.levelUpCopy}>
              <Text style={styles.levelUpTitle}>
                {t("progression.rewards.levelUp")}
              </Text>
              <Text style={styles.levelUpText}>
                {t("progression.rewards.levelUpCopy", {
                  level: reward.newLevel,
                  rank: t(
                    `progression.ranks.${reward.newRankKey}`,
                  ),
                })}
              </Text>
            </View>
            <Text style={styles.levelUpNumber}>
              {reward.newLevel}
            </Text>
          </View>
        ) : null}

        <RewardCard reward={reward} />

        {details.status === "interrupted" ? (
          <View style={styles.interruptedCard}>
            <Ionicons
              color={COLORS.gold}
              name="pause-circle-outline"
              size={23}
            />
            <Text style={styles.interruptedText}>
              {t("session.interruptedCopy")}
            </Text>
          </View>
        ) : null}

        <View style={styles.timelineCard}>
          <TimelineItem
            icon="play"
            label={t("session.started")}
            value={startedAt}
          />
          <View style={styles.timelineLine} />
          <TimelineItem
            icon="stop"
            label={t("session.ended")}
            value={endedAt}
          />
        </View>

        <View style={styles.qualityCard}>
          <View style={styles.qualityHeader}>
            <View style={styles.qualityIcon}>
              <Ionicons
                color={COLORS.matcha}
                name="shield-checkmark"
                size={24}
              />
            </View>
            <View style={styles.qualityCopy}>
              <Text style={styles.qualityTitle}>
                {t("session.gpsPoints")}
              </Text>
              <Text style={styles.qualityDescription}>
                {t("session.accuracyGuard")}
              </Text>
            </View>
          </View>

          <View style={styles.qualityMetrics}>
            <QualityMetric
              label={t("session.accepted")}
              value={String(details.acceptedPoints)}
            />
            <QualityMetric
              label={t("session.filtered")}
              value={String(details.rejectedPoints)}
            />
            <QualityMetric
              label={t("session.route")}
              value={String(details.points.length)}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.replace("/explore")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              color={COLORS.white}
              name="map-outline"
              size={20}
            />
            <Text style={styles.primaryButtonText}>
              {t("session.backToExplore")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.replace("/session-history")
            }
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              color={COLORS.ink}
              name="time-outline"
              size={20}
            />
            <Text style={styles.secondaryButtonText}>
              {t("session.viewHistory")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RewardCard({
  reward,
}: {
  reward: SessionRewardRecord | null;
}) {
  const { t } = useTranslation();

  if (!reward) {
    return null;
  }

  const rows = [
    {
      key: "distance",
      label: t("progression.rewards.distance"),
      xp: reward.distanceXp,
      coins: reward.distanceCoins,
    },
    {
      key: "discovery",
      label: t("progression.rewards.discovery"),
      xp: reward.discoveryXp,
      coins: reward.discoveryCoins,
    },
    {
      key: "completion",
      label: t("progression.rewards.completion"),
      xp: reward.completionXp,
      coins: reward.completionCoins,
    },
    {
      key: "first",
      label: t("progression.rewards.firstSession"),
      xp: reward.firstSessionXp,
      coins: reward.firstSessionCoins,
    },
    {
      key: "kilometer",
      label: t("progression.rewards.oneKilometer"),
      xp: reward.oneKilometerXp,
      coins: reward.oneKilometerCoins,
    },
  ].filter((row) => row.xp > 0 || row.coins > 0);

  return (
    <View style={styles.rewardCard}>
      <View style={styles.rewardHeader}>
        <View>
          <Text style={styles.rewardEyebrow}>
            {t("progression.rewards.eyebrow")}
          </Text>
          <Text style={styles.rewardTitle}>
            {t("progression.rewards.title")}
          </Text>
        </View>
        <View style={styles.rewardTotals}>
          <Text style={styles.rewardXp}>
            +{reward.totalXp} XP
          </Text>
          <View style={styles.rewardCoins}>
            <Ionicons
              color={COLORS.gold}
              name="leaf"
              size={14}
            />
            <Text style={styles.rewardCoinText}>
              +{reward.totalCoins}
            </Text>
          </View>
        </View>
      </View>

      {rows.length === 0 ? (
        <Text style={styles.noRewardText}>
          {t("progression.rewards.noReward")}
        </Text>
      ) : (
        <View style={styles.rewardRows}>
          {rows.map((row) => (
            <View key={row.key} style={styles.rewardRow}>
              <Text style={styles.rewardRowLabel}>
                {row.label}
              </Text>
              <View style={styles.rewardRowValues}>
                {row.xp > 0 ? (
                  <Text style={styles.rewardRowXp}>
                    +{row.xp} XP
                  </Text>
                ) : null}
                {row.coins > 0 ? (
                  <View style={styles.rewardRowCoins}>
                    <Ionicons
                      color={COLORS.gold}
                      name="leaf"
                      size={11}
                    />
                    <Text style={styles.rewardRowCoinText}>
                      +{row.coins}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.heroMetric}>
      <Text style={styles.heroMetricValue}>{value}</Text>
      <Text style={styles.heroMetricLabel}>{label}</Text>
    </View>
  );
}

function TimelineItem({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineIcon}>
        <Ionicons
          color={COLORS.vermilion}
          name={icon}
          size={18}
        />
      </View>
      <View style={styles.timelineCopy}>
        <Text style={styles.timelineLabel}>{label}</Text>
        <Text style={styles.timelineValue}>{value}</Text>
      </View>
    </View>
  );
}

function QualityMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.qualityMetric}>
      <Text style={styles.qualityMetricValue}>
        {value}
      </Text>
      <Text style={styles.qualityMetricLabel}>
        {label}
      </Text>
    </View>
  );
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
    gap: 14,
    justifyContent: "center",
    padding: 28,
  },
  content: {
    gap: SPACING.large,
    paddingBottom: 30,
    paddingHorizontal: SPACING.medium,
    paddingTop: 12,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  errorText: {
    color: COLORS.inkSoft,
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginTop: 2,
  },
  title: {
    color: COLORS.ink,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 3,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  hero: {
    backgroundColor: COLORS.ink,
    borderRadius: RADII.large,
    padding: 20,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderRadius: 21,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  statusPill: {
    backgroundColor: "rgba(60,134,99,0.22)",
    borderColor: COLORS.success,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statusInterrupted: {
    backgroundColor: "rgba(211,168,74,0.18)",
    borderColor: COLORS.gold,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
  heroDistance: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: "900",
    marginTop: 24,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  heroMetrics: {
    borderTopColor: "rgba(255,255,255,0.12)",
    borderTopWidth: 1,
    flexDirection: "row",
    marginTop: 22,
    paddingTop: 17,
  },
  heroMetric: {
    alignItems: "center",
    flex: 1,
  },
  heroMetricValue: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
  },
  heroMetricLabel: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 9,
    marginTop: 4,
  },
  levelUpCard: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderRadius: RADII.large,
    flexDirection: "row",
    gap: 12,
    overflow: "hidden",
    padding: 16,
  },
  levelUpBurst: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 21,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  levelUpCopy: {
    flex: 1,
  },
  levelUpTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
  },
  levelUpText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  levelUpNumber: {
    color: "rgba(255,255,255,0.22)",
    fontSize: 52,
    fontWeight: "900",
  },
  rewardCard: {
    backgroundColor: COLORS.white,
    borderColor: "#DECDAF",
    borderRadius: RADII.large,
    borderWidth: 1,
    padding: 16,
  },
  rewardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rewardEyebrow: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  rewardTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 3,
  },
  rewardTotals: {
    alignItems: "flex-end",
  },
  rewardXp: {
    color: COLORS.vermilion,
    fontSize: 16,
    fontWeight: "900",
  },
  rewardCoins: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 3,
  },
  rewardCoinText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  rewardRows: {
    borderTopColor: COLORS.line,
    borderTopWidth: 1,
    gap: 10,
    marginTop: 14,
    paddingTop: 13,
  },
  rewardRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rewardRowLabel: {
    color: COLORS.inkSoft,
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
  },
  rewardRowValues: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  rewardRowXp: {
    color: COLORS.vermilion,
    fontSize: 10,
    fontWeight: "900",
  },
  rewardRowCoins: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  rewardRowCoinText: {
    color: COLORS.ink,
    fontSize: 10,
    fontWeight: "900",
  },
  noRewardText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 13,
  },
  interruptedCard: {
    alignItems: "flex-start",
    backgroundColor: COLORS.paperStrong,
    borderColor: "#DECDAF",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  interruptedText: {
    color: COLORS.inkSoft,
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },
  timelineCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    padding: 15,
  },
  timelineItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  timelineIcon: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  timelineCopy: {
    flex: 1,
  },
  timelineLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  timelineValue: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3,
  },
  timelineLine: {
    backgroundColor: COLORS.line,
    height: 18,
    marginLeft: 20,
    width: 2,
  },
  qualityCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    padding: 15,
  },
  qualityHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 11,
  },
  qualityIcon: {
    alignItems: "center",
    backgroundColor: COLORS.matchaSoft,
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  qualityCopy: {
    flex: 1,
  },
  qualityTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  qualityDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  qualityMetrics: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  qualityMetric: {
    alignItems: "center",
    backgroundColor: COLORS.paper,
    borderRadius: 14,
    flex: 1,
    padding: 10,
  },
  qualityMetricValue: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  qualityMetricLabel: {
    color: COLORS.muted,
    fontSize: 8,
    marginTop: 3,
    textAlign: "center",
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.medium,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});
