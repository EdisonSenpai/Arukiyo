import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

import { SectionTitle } from "@/components/SectionTitle";
import { COLORS, RADII, SPACING } from "@/constants/theme";

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brand}>ARUKIYO</Text>
            <Text style={styles.tagline}>歩いて、世界をひらく</Text>
          </View>

          <View style={styles.coinPill}>
            <Ionicons color={COLORS.gold} name="leaf" size={17} />
            <Text style={styles.coinText}>0</Text>
          </View>
        </View>

        <LinearGradient
          colors={[COLORS.ink, "#314B40"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroEyebrow}>
                {t("home.level")}
              </Text>
              <Text style={styles.heroTitle}>
                {t("home.rank")}
              </Text>
            </View>
            <View style={styles.levelMedallion}>
              <Text style={styles.levelText}>1</Text>
            </View>
          </View>

          <Text style={styles.heroCopy}>{t("home.intro")}</Text>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>0 XP</Text>
            <Text style={styles.progressText}>500 XP</Text>
          </View>

          <View style={styles.heroStats}>
            <HeroStat label={t("home.distance")} value="0.0 km" />
            <HeroStat label={t("home.areas")} value="0" />
            <HeroStat label={t("home.landmarks")} value="0" />
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
          action={t("home.completed", { done: 0, total: 3 })}
          title={t("home.todayMissions")}
        />

        <View style={styles.questCard}>
          <View style={styles.questIcon}>
            <Ionicons
              color={COLORS.vermilion}
              name="footsteps"
              size={24}
            />
          </View>
          <View style={styles.questBody}>
            <Text style={styles.questTitle}>
              {t("home.firstSteps")}
            </Text>
            <Text style={styles.questDescription}>
              {t("home.firstStepsDescription")}
            </Text>
            <View style={styles.questProgressTrack}>
              <View style={styles.questProgressFill} />
            </View>
            <Text style={styles.questMeta}>
              {t("home.stepsProgress")}
            </Text>
          </View>
          <View style={styles.rewardPill}>
            <Text style={styles.rewardText}>+50 XP</Text>
          </View>
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

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value}</Text>
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
        <Ionicons color={COLORS.ink} name={icon} size={24} />
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

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.paper, flex: 1 },
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
  tagline: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  coinPill: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  coinText: { color: COLORS.ink, fontSize: 15, fontWeight: "900" },
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
  levelText: { color: COLORS.white, fontSize: 23, fontWeight: "900" },
  heroCopy: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
    maxWidth: 280,
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
    width: "4%",
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
  heroStat: { alignItems: "center", flex: 1 },
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
  quickGrid: { gap: 12 },
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
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  questCard: {
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  questIcon: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 15,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  questBody: { flex: 1 },
  questTitle: { color: COLORS.ink, fontSize: 15, fontWeight: "900" },
  questDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  questProgressTrack: {
    backgroundColor: COLORS.mist,
    borderRadius: RADII.pill,
    height: 6,
    marginTop: 12,
    overflow: "hidden",
  },
  questProgressFill: {
    backgroundColor: COLORS.vermilion,
    height: "100%",
    width: "2%",
  },
  questMeta: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 6,
  },
  rewardPill: {
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADII.pill,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  rewardText: { color: COLORS.inkSoft, fontSize: 10, fontWeight: "900" },
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
  discoveryBody: { padding: 17 },
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
});
