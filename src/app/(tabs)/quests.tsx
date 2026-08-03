import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { COLORS, RADII, SPACING } from "@/constants/theme";

const QUESTS = [
  {
    icon: "footsteps" as const,
    title: "Primii pași",
    description: "Parcurge 1.500 de pași.",
    reward: "+50 XP",
    accent: COLORS.sakuraSoft,
  },
  {
    icon: "map" as const,
    title: "Cartograf începător",
    description: "Descoperă 3 celule noi.",
    reward: "+20 monede",
    accent: COLORS.matchaSoft,
  },
  {
    icon: "book" as const,
    title: "O poveste nouă",
    description: "Citește istoria unui landmark.",
    reward: "+1 ștampilă",
    accent: COLORS.paperStrong,
  },
];

export default function QuestsScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Provocări"
          subtitle="Misiuni mici, călătorii mari."
          title="Misiuni"
        />

        <View style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <Ionicons color={COLORS.vermilion} name="flame" size={28} />
          </View>
          <View style={styles.streakCopy}>
            <Text style={styles.streakTitle}>Streak de explorare</Text>
            <Text style={styles.streakValue}>0 zile</Text>
          </View>
          <Text style={styles.streakHint}>Ieși azi pentru a începe</Text>
        </View>

        <View style={styles.segment}>
          <View style={styles.segmentActive}>
            <Text style={styles.segmentActiveText}>Zilnice</Text>
          </View>
          <Text style={styles.segmentText}>Săptămânale</Text>
          <Text style={styles.segmentText}>Lunare</Text>
        </View>

        <View style={styles.questList}>
          {QUESTS.map((quest) => (
            <View key={quest.title} style={styles.questCard}>
              <View style={[styles.questIcon, { backgroundColor: quest.accent }]}>
                <Ionicons color={COLORS.ink} name={quest.icon} size={23} />
              </View>
              <View style={styles.questBody}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questDescription}>{quest.description}</Text>
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
            <Text style={styles.chestTitle}>Cufărul zilei</Text>
            <Text style={styles.chestDescription}>
              Completează toate cele 3 misiuni pentru o recompensă bonus.
            </Text>
          </View>
          <Text style={styles.chestProgress}>0/3</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  streakCopy: {
    flex: 1,
  },
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
    maxWidth: 72,
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
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  questList: {
    gap: 12,
  },
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
  questBody: {
    flex: 1,
  },
  questTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  questDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  track: {
    backgroundColor: COLORS.mist,
    borderRadius: RADII.pill,
    height: 6,
    marginTop: 10,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: COLORS.vermilion,
    height: "100%",
    width: "2%",
  },
  reward: {
    color: COLORS.vermilion,
    fontSize: 10,
    fontWeight: "900",
    maxWidth: 58,
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
  chestCopy: {
    flex: 1,
  },
  chestTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  chestDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  chestProgress: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: "900",
  },
});
