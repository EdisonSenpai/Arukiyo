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
import { useTranslation } from "react-i18next";

import { ScreenHeader } from "@/components/ScreenHeader";
import { COLORS, RADII, SPACING } from "@/constants/theme";
import { usePlayerProgress } from "@/hooks/usePlayerProgress";
import { formatDistance } from "@/lib/session-tracking";

export default function ProfileScreen() {
  const { i18n, t } = useTranslation();
  const { isLoading, progress } = usePlayerProgress();
  const locale = i18n.resolvedLanguage ?? "en";
  const rank = t(
    `progression.ranks.${progress.rankKey}`,
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow={t("profile.eyebrow")}
          subtitle={t("profile.subtitle")}
          title="Eduard"
          trailing={
            <Pressable
              accessibilityLabel={t(
                "profile.settingsLabel",
              )}
              onPress={() => router.push("/settings")}
              style={styles.settingsButton}
            >
              <Ionicons
                color={COLORS.ink}
                name="settings-outline"
                size={22}
              />
            </Pressable>
          }
        />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons
              color={COLORS.white}
              name="person"
              size={34}
            />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.rank}>
              {rank} ·{" "}
              {t("progression.level", {
                level: progress.level,
              })}
            </Text>
            <Text style={styles.profileTagline}>
              {t("progression.homeIntro")}
            </Text>
          </View>
          <View style={styles.level}>
            {isLoading ? (
              <ActivityIndicator
                color={COLORS.sakuraSoft}
                size="small"
              />
            ) : (
              <Text style={styles.levelValue}>
                {progress.level}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.xpEyebrow}>
                {t("progression.profile.totalXp")}
              </Text>
              <Text style={styles.xpValue}>
                {progress.totalXp} XP
              </Text>
            </View>
            <View style={styles.wallet}>
              <Ionicons
                color={COLORS.gold}
                name="leaf"
                size={16}
              />
              <Text style={styles.walletText}>
                {progress.coins}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(
                    2,
                    progress.progressRatio * 100,
                  )}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              {progress.currentLevelXp} XP
            </Text>
            <Text style={styles.progressText}>
              {t("progression.profile.nextLevel")} ·{" "}
              {progress.xpForNextLevel} XP
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          {t("progression.profile.journeyStats")}
        </Text>

        <View style={styles.stats}>
          <ProfileStat
            label={t("profile.distance")}
            value={formatDistance(
              progress.totalDistanceMeters,
              locale,
            )}
          />
          <ProfileStat
            label={t("progression.areas")}
            value={String(progress.discoveredCells)}
          />
          <ProfileStat
            label={t("progression.sessions")}
            value={String(progress.rewardedSessions)}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {t("profile.equippedBadges")}
        </Text>
        <View style={styles.badges}>
          {[0, 1, 2].map((badge) => (
            <View key={badge} style={styles.badgeSlot}>
              <Ionicons
                color={COLORS.line}
                name="ribbon-outline"
                size={29}
              />
              <Text style={styles.badgeText}>
                {t("profile.emptySlot")}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.push("/shop")}
          style={({ pressed }) => [
            styles.shopCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.shopIcon}>
            <Ionicons
              color={COLORS.vermilion}
              name="bag-handle"
              size={26}
            />
          </View>
          <View style={styles.shopCopy}>
            <Text style={styles.shopTitle}>
              {t("profile.shopTitle")}
            </Text>
            <Text style={styles.shopDescription}>
              {t("profile.shopDescription")}
            </Text>
          </View>
          <View style={styles.shopWallet}>
            <Ionicons
              color={COLORS.gold}
              name="leaf"
              size={14}
            />
            <Text style={styles.shopWalletText}>
              {progress.coins}
            </Text>
          </View>
          <Ionicons
            color={COLORS.muted}
            name="chevron-forward"
            size={21}
          />
        </Pressable>

        <View style={styles.menu}>
          <MenuItem
            icon="language-outline"
            label={t("settings.language")}
            onPress={() => router.push("/language")}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label={t("common.privacy")}
          />
          <MenuItem
            icon="accessibility-outline"
            label={t("common.accessibility")}
          />
          <MenuItem
            icon="help-circle-outline"
            label={t("common.help")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={styles.statValue}
      >
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        color={COLORS.inkSoft}
        name={icon}
        size={21}
      />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons
        color={COLORS.muted}
        name="chevron-forward"
        size={19}
      />
    </Pressable>
  );
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
  settingsButton: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 15,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.large,
    flexDirection: "row",
    gap: 13,
    padding: 18,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 31,
    borderWidth: 3,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  profileCopy: {
    flex: 1,
  },
  rank: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },
  profileTagline: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  level: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  levelValue: {
    color: COLORS.sakuraSoft,
    fontSize: 18,
    fontWeight: "900",
  },
  xpCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    padding: 15,
  },
  xpHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpEyebrow: {
    color: COLORS.matcha,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  xpValue: {
    color: COLORS.ink,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 3,
  },
  wallet: {
    alignItems: "center",
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  walletText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  progressTrack: {
    backgroundColor: COLORS.mist,
    borderRadius: RADII.pill,
    height: 8,
    marginTop: 14,
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
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  stats: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    padding: 14,
  },
  statValue: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 4,
    textAlign: "center",
  },
  badges: {
    flexDirection: "row",
    gap: 10,
  },
  badgeSlot: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderStyle: "dashed",
    borderWidth: 1,
    flex: 1,
    minHeight: 100,
    justifyContent: "center",
    padding: 9,
  },
  badgeText: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 7,
    textAlign: "center",
  },
  shopCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    padding: 14,
  },
  shopIcon: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 15,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  shopCopy: {
    flex: 1,
  },
  shopTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  shopDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  shopWallet: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  shopWalletText: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "900",
  },
  menu: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    alignItems: "center",
    borderBottomColor: COLORS.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 55,
    paddingHorizontal: 14,
  },
  menuLabel: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});
