import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
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

export default function ProfileScreen() {
  const { t } = useTranslation();

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
              accessibilityLabel={t("profile.settingsLabel")}
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
            <Ionicons color={COLORS.white} name="person" size={34} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.rank}>{t("profile.rank")}</Text>
            <Text style={styles.profileTagline}>
              {t("profile.tagline")}
            </Text>
          </View>
          <View style={styles.level}>
            <Text style={styles.levelValue}>1</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <ProfileStat label={t("profile.distance")} value="0 km" />
          <ProfileStat label={t("profile.landmarks")} value="0" />
          <ProfileStat label={t("profile.badges")} value="0" />
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
      <Text style={styles.statValue}>{value}</Text>
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
      <Ionicons color={COLORS.inkSoft} name={icon} size={21} />
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
  safeArea: { backgroundColor: COLORS.paper, flex: 1 },
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
  profileCopy: { flex: 1 },
  rank: { color: COLORS.white, fontSize: 16, fontWeight: "900" },
  profileTagline: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
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
  levelValue: { color: COLORS.sakuraSoft, fontSize: 18, fontWeight: "900" },
  stats: { flexDirection: "row", gap: 10 },
  stat: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statValue: { color: COLORS.ink, fontSize: 17, fontWeight: "900" },
  statLabel: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  sectionTitle: { color: COLORS.ink, fontSize: 19, fontWeight: "900" },
  badges: { flexDirection: "row", gap: 10 },
  badgeSlot: {
    alignItems: "center",
    aspectRatio: 0.9,
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderStyle: "dashed",
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
  },
  badgeText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 7,
  },
  shopCard: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderColor: "#E9BEC9",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 15,
  },
  shopIcon: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 15,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  shopCopy: { flex: 1 },
  shopTitle: { color: COLORS.ink, fontSize: 15, fontWeight: "900" },
  shopDescription: {
    color: COLORS.inkSoft,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  pressed: { opacity: 0.75 },
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
    gap: 12,
    padding: 15,
  },
  menuLabel: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
});
