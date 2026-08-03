import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { ScreenHeader } from "@/components/ScreenHeader";
import { COLORS, RADII, SPACING } from "@/constants/theme";

export default function QuestsScreen() {
  const { t } = useTranslation();

  const quests = [
    {
      icon: "footsteps" as const,
      title: t("quests.firstSteps"),
      description: t("quests.firstStepsDescription"),
      reward: "+50 XP",
      accent: COLORS.sakuraSoft,
    },
    {
      icon: "map" as const,
      title: t("quests.beginnerCartographer"),
      description: t("quests.beginnerCartographerDescription"),
      reward: t("quests.coinsReward"),
      accent: COLORS.matchaSoft,
    },
    {
      icon: "book" as const,
      title: t("quests.newStory"),
      description: t("quests.newStoryDescription"),
      reward: t("quests.stampReward"),
      accent: COLORS.paperStrong,
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow={t("quests.eyebrow")}
          subtitle={t("quests.subtitle")}
          title={t("quests.title")}
        />

        <View style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <Ionicons
              color={COLORS.vermilion}
              name="flame"
              size={28}
            />
          </View>
          <View style={styles.streakCopy}>
            <Text style={styles.streakTitle}>
              {t("quests.streakTitle")}
            </Text>
            <Text style={styles.streakValue}>
              {t("quests.streakValue")}
            </Text>
          </View>
          <Text style={styles.streakHint}>
            {t("quests.streakHint")}
          </Text>
        </View>

        <View style={styles.segment}>
          <View style={styles.segmentActive}>
            <Text style={styles.segmentActiveText}>
              {t("quests.daily")}
            </Text>
          </View>
          <Text style={styles.segmentText}>{t("quests.weekly")}</Text>
          <Text style={styles.segmentText}>{t("quests.monthly")}</Text>
        </View>

        <View style={styles.questList}>
          {quests.map((quest) => (
            <View key={quest.title} style={styles.questCard}>
              <View
                style={[
                  styles.questIcon,
                  { backgroundColor: quest.accent },
                ]}
              >
                <Ionicons
                  color={COLORS.ink}
                  name={quest.icon}
                  size={23}
                />
              </View>
              <View style={styles.questBody}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questDescription}>
                  {quest.description}
                </Text>
                <View style={styles.track}>
                  <View style={styles.fill} />
                </View>
              </View>
              <Text style={styles.reward}>{quest.reward}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chestCard}>
          <Ionicons color={COLORS.gold} name="gift" size={34} />
          <View style={styles.chestCopy}>
            <Text style={styles.chestTitle}>
              {t("quests.dailyChest")}
            </Text>
            <Text style={styles.chestDescription}>
              {t("quests.dailyChestDescription")}
            </Text>
          </View>
          <Text style={styles.chestProgress}>0/3</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  streakCard: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.large,
    flexDirection: "row",
    gap: 12,
    padding: 17,
  },
  streakIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 17,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  streakCopy: { flex: 1 },
  streakTitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "700",
  },
  streakValue: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  streakHint: {
    color: COLORS.sakuraSoft,
    fontSize: 10,
    fontWeight: "800",
    maxWidth: 90,
    textAlign: "right",
  },
  segment: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  segmentActive: {
    backgroundColor: COLORS.vermilion,
    borderRadius: RADII.pill,
    flex: 1,
    paddingVertical: 10,
  },
  segmentActiveText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  segmentText: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  questList: { gap: 12 },
  questCard: {
    alignItems: "center",
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
    borderRadius: 15,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  questBody: { flex: 1 },
  questTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "900" },
  questDescription: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  track: {
    backgroundColor: COLORS.mist,
    borderRadius: RADII.pill,
    height: 6,
    marginTop: 10,
    overflow: "hidden",
  },
  fill: { backgroundColor: COLORS.vermilion, height: "100%", width: "2%" },
  reward: {
    color: COLORS.vermilion,
    fontSize: 10,
    fontWeight: "900",
    maxWidth: 64,
    textAlign: "right",
  },
  chestCard: {
    alignItems: "center",
    backgroundColor: COLORS.paperStrong,
    borderColor: "#DECDAF",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    padding: 16,
  },
  chestCopy: { flex: 1 },
  chestTitle: { color: COLORS.ink, fontSize: 15, fontWeight: "900" },
  chestDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  chestProgress: { color: COLORS.gold, fontSize: 16, fontWeight: "900" },
});
