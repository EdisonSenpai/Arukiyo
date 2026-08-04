import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { useTranslation } from "react-i18next";

import { SectionTitle } from "@/components/SectionTitle";
import { COLORS, RADII, SPACING } from "@/constants/theme";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { formatDistance } from "@/lib/session-tracking";

export default function HomeScreen() {
  const { i18n, t } = useTranslation();
  const { error, isLoading, progress } =
    usePlayerProgress();
  const locale = i18n.resolvedLanguage ?? "en";

  const rank = t(
    `progression.ranks.${progress.rankKey}`,
  );
  const xpPercent = `${Math.max(
    2,
    progress.progressRatio * 100,
  )}%` as `${number}%`;
  const kilometerProgress = Math.min(
    1,
    progress.todayLongestSessionMeters / 1_000,
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brand}>ARUKIYO</Text>
            <Text style={styles.tagline}>
              歩いて、世界をひらく
            </Text>
          </View>

          <View style={styles.coinPill}>
            <Ionicons
              color={COLORS.gold}
              name="leaf"
              size={17}
            />
            {isLoading ? (
              <ActivityIndicator
                color={COLORS.gold}
                size="small"
              />
            ) : (
              <Text style={styles.coinText}>
                {progress.coins}
              </Text>
            )}
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons
              color={COLORS.vermilion}
              name="alert-circle-outline"
              size={20}
            />
            <Text style={styles.errorText}>
              {t("progression.errors.load")}
            </Text>
          </View>
        ) : null}

        <LinearGradient
          colors={[COLORS.ink, "#314B40"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroHeading}>
              <Text style={styles.heroEyebrow}>
                {t("progression.level", {
                  level: progress.level,
                })}
              </Text>
              <Text style={styles.heroTitle}>
                {rank}
              </Text>
            </View>
            <View style={styles.levelMedallion}>
              <Text style={styles.levelText}>
                {progress.level}
              </Text>
            </View>
          </View>

          <Text style={styles.heroCopy}>
            {t("progression.homeIntro")}
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: xpPercent },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              {progress.currentLevelXp} XP
            </Text>
            <Text style={styles.progressText}>
              {progress.xpForNextLevel} XP
            </Text>
          </View>

          <View style={styles.heroStats}>
            <HeroStat
              label={t("home.distance")}
              value={formatDistance(
                progress.totalDistanceMeters,
                locale,
              )}
            />
            <HeroStat
              label={t("progression.areas")}
              value={String(progress.discoveredCells)}
            />
            <HeroStat
              label={t("progression.sessions")}
              value={String(progress.rewardedSessions)}
            />
          </View>
        </LinearGradient>

        <View style={styles.quickGrid}>
          <QuickAction
            icon="map-outline"
            label={t("home.startExploring")}
            onPress={() => router.push("/explore")}
          />
          <QuickAction
            icon="bag-handle-outline"
            label={t("home.openShop")}
            onPress={() => router.push("/shop")}
          />
        </View>

        <SectionTitle
          action={formatDistance(
            progress.todayDistanceMeters,
            locale,
          )}
          title={t("progression.daily.title")}
        />

        <View style={styles.dailyCard}>
          <Text style={styles.dailyEyebrow}>
            {t("progression.daily.eyebrow")}
          </Text>

          <View style={styles.dailyStats}>
            <DailyStat
              icon="walk-outline"
              label={t("progression.daily.distance")}
              value={formatDistance(
                progress.todayDistanceMeters,
                locale,
              )}
            />
            <DailyStat
              icon="time-outline"
              label={t("progression.daily.sessions")}
              value={String(progress.todaySessions)}
            />
            <DailyStat
              icon="grid-outline"
              label={t("progression.daily.cells")}
              value={String(progress.todayNewCells)}
            />
          </View>

          <DailyBonus
            claimed={progress.firstSessionBonusClaimed}
            copy={t(
              "progression.daily.firstJourneyCopy",
            )}
            icon="sunny-outline"
            reward="+25 XP · +5"
            title={t(
              "progression.daily.firstJourney",
            )}
          />

          <DailyBonus
            claimed={progress.oneKilometerBonusClaimed}
            copy={t(
              "progression.daily.oneKilometerCopy",
            )}
            icon="trail-sign-outline"
            progress={kilometerProgress}
            progressText={t(
              "progression.daily.progress",
              {
                current: formatDistance(
                  progress.todayLongestSessionMeters,
                  locale,
                ),
                target: "1 km",
              },
            )}
            reward="+50 XP · +10"
            title={t(
              "progression.daily.oneKilometer",
            )}
          />
        </View>

        <SectionTitle
          action={t("home.viewMap")}
          title={t("home.nearbyDiscovery")}
        />

        <Pressable
          onPress={() => router.push("/explore")}
          style={({ pressed }) => [
            styles.discoveryCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.discoveryMap}>
            <View style={styles.mapRingLarge} />
            <View style={styles.mapRingSmall} />
            <View style={styles.pin}>
              <Ionicons
                color={COLORS.white}
                name="location"
                size={20}
              />
            </View>
          </View>
          <View style={styles.discoveryBody}>
            <Text style={styles.discoveryEyebrow}>
              {t("home.fogActive")}
            </Text>
            <Text style={styles.discoveryTitle}>
              {t("home.discoveryTitle")}
            </Text>
            <Text style={styles.discoveryCopy}>
              {t("home.discoveryCopy")}
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.heroStat}>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={styles.heroStatValue}
      >
        {value}
      </Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
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
        styles.quickAction,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.quickIcon}>
        <Ionicons
          color={COLORS.ink}
          name={icon}
          size={24}
        />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Ionicons
        color={COLORS.vermilion}
        name="arrow-forward"
        size={19}
      />
    </Pressable>
  );
}

function DailyStat({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.dailyStat}>
      <Ionicons
        color={COLORS.matcha}
        name={icon}
        size={19}
      />
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={styles.dailyStatValue}
      >
        {value}
      </Text>
      <Text
        numberOfLines={2}
        style={styles.dailyStatLabel}
      >
        {label}
      </Text>
    </View>
  );
}

function DailyBonus({
  claimed,
  copy,
  icon,
  progress,
  progressText,
  reward,
  title,
}: {
  claimed: boolean;
  copy: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  progress?: number;
  progressText?: string;
  reward: string;
  title: string;
}) {
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.bonusRow,
        claimed && styles.bonusRowClaimed,
      ]}
    >
      <View
        style={[
          styles.bonusIcon,
          claimed && styles.bonusIconClaimed,
        ]}
      >
        <Ionicons
          color={
            claimed ? COLORS.white : COLORS.vermilion
          }
          name={claimed ? "checkmark" : icon}
          size={22}
        />
      </View>

      <View style={styles.bonusCopy}>
        <View style={styles.bonusTitleRow}>
          <Text style={styles.bonusTitle}>{title}</Text>
          <View
            style={[
              styles.statusPill,
              claimed && styles.statusPillClaimed,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                claimed && styles.statusTextClaimed,
              ]}
            >
              {claimed
                ? t("progression.daily.claimed")
                : t("progression.daily.available")}
            </Text>
          </View>
        </View>

        <Text style={styles.bonusDescription}>
          {copy}
        </Text>

        {typeof progress === "number" ? (
          <>
            <View style={styles.bonusProgressTrack}>
              <View
                style={[
                  styles.bonusProgressFill,
                  {
                    width: `${Math.max(
                      2,
                      progress * 100,
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.bonusProgressText}>
              {progressText}
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.rewardPill}>
        <Ionicons
          color={COLORS.gold}
          name="leaf"
          size={12}
        />
        <Text style={styles.rewardText}>{reward}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.paper,
    flex: 1,
  },
  content: {
    gap: SPACING.large,
    paddingBottom: 34,
    paddingHorizontal: SPACING.medium,
    paddingTop: 10,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brand: {
    color: COLORS.ink,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 3,
  },
  tagline: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  coinPill: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minWidth: 66,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  coinText: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  errorCard: {
    alignItems: "center",
    backgroundColor: "#FBE9E6",
    borderColor: "#EDC0B9",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  errorText: {
    color: COLORS.inkSoft,
    flex: 1,
    fontSize: 11,
  },
  hero: {
    borderRadius: RADII.large,
    overflow: "hidden",
    padding: SPACING.large,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroHeading: {
    flex: 1,
    paddingRight: 12,
  },
  heroEyebrow: {
    color: COLORS.sakuraSoft,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 2,
  },
  levelMedallion: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 28,
    borderWidth: 3,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  levelText: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900",
  },
  heroCopy: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
    maxWidth: 300,
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: RADII.pill,
    height: 8,
    marginTop: 20,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: COLORS.sakura,
    borderRadius: RADII.pill,
    height: "100%",
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },
  progressText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "700",
  },
  heroStats: {
    borderTopColor: "rgba(255,255,255,0.14)",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 18,
  },
  heroStat: {
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  heroStatValue: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  quickGrid: {
    gap: 12,
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  quickIcon: {
    alignItems: "center",
    backgroundColor: COLORS.matchaSoft,
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  quickLabel: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  dailyCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.large,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  dailyEyebrow: {
    color: COLORS.matcha,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  dailyStats: {
    flexDirection: "row",
    gap: 8,
  },
  dailyStat: {
    alignItems: "center",
    backgroundColor: COLORS.paper,
    borderRadius: 14,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 5,
    paddingVertical: 11,
  },
  dailyStatValue: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 5,
  },
  dailyStatLabel: {
    color: COLORS.muted,
    fontSize: 8,
    lineHeight: 11,
    marginTop: 3,
    textAlign: "center",
  },
  bonusRow: {
    alignItems: "flex-start",
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  bonusRowClaimed: {
    backgroundColor: COLORS.matchaSoft,
    borderColor: "#BFD1C0",
  },
  bonusIcon: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  bonusIconClaimed: {
    backgroundColor: COLORS.success,
  },
  bonusCopy: {
    flex: 1,
    minWidth: 0,
  },
  bonusTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  bonusTitle: {
    color: COLORS.ink,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "900",
  },
  bonusDescription: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  statusPill: {
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADII.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusPillClaimed: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    color: COLORS.inkSoft,
    fontSize: 7,
    fontWeight: "900",
  },
  statusTextClaimed: {
    color: COLORS.white,
  },
  rewardPill: {
    alignItems: "center",
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  rewardText: {
    color: COLORS.inkSoft,
    fontSize: 8,
    fontWeight: "900",
  },
  bonusProgressTrack: {
    backgroundColor: COLORS.mist,
    borderRadius: RADII.pill,
    height: 5,
    marginTop: 8,
    overflow: "hidden",
  },
  bonusProgressFill: {
    backgroundColor: COLORS.vermilion,
    borderRadius: RADII.pill,
    height: "100%",
  },
  bonusProgressText: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "800",
    marginTop: 4,
  },
  discoveryCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.large,
    borderWidth: 1,
    overflow: "hidden",
  },
  discoveryMap: {
    alignItems: "center",
    backgroundColor: COLORS.matchaSoft,
    height: 150,
    justifyContent: "center",
    overflow: "hidden",
  },
  mapRingLarge: {
    borderColor: "rgba(111,143,114,0.34)",
    borderRadius: 110,
    borderWidth: 26,
    height: 220,
    position: "absolute",
    width: 220,
  },
  mapRingSmall: {
    borderColor: "rgba(255,255,255,0.72)",
    borderRadius: 55,
    borderWidth: 15,
    height: 110,
    position: "absolute",
    width: 110,
  },
  pin: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 4,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  discoveryBody: {
    padding: 17,
  },
  discoveryEyebrow: {
    color: COLORS.matcha,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  discoveryTitle: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },
  discoveryCopy: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});
