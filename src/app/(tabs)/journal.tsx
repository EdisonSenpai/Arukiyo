import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { COLORS, RADII, SPACING } from "@/constants/theme";

export default function JournalScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Tabi no techō"
          subtitle="Jurnalul tău de călătorie și colecția de ștampile."
          title="Jurnal"
        />

        <View style={styles.book}>
          <View style={styles.binding} />
          <Text style={styles.bookEyebrow}>PRIMA PAGINĂ</Text>
          <Text style={styles.bookTitle}>București</Text>
          <Text style={styles.bookCopy}>
            Descoperă primul landmark pentru a începe albumul orașului.
          </Text>

          <View style={styles.stamps}>
            {[0, 1, 2, 3].map((stamp) => (
              <View key={stamp} style={styles.stamp}>
                <Ionicons
                  color={COLORS.line}
                  name="location-outline"
                  size={26}
                />
                <Text style={styles.stampText}>Nedescoperit</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.collectionCard}>
          <View style={styles.collectionIcon}>
            <Ionicons color={COLORS.gold} name="trophy-outline" size={25} />
          </View>
          <View style={styles.collectionBody}>
            <Text style={styles.collectionTitle}>
              Monumentele Bucureștiului
            </Text>
            <Text style={styles.collectionDescription}>
              0 din 12 landmark-uri descoperite
            </Text>
            <View style={styles.track}>
              <View style={styles.fill} />
            </View>
          </View>
          <Text style={styles.percent}>0%</Text>
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
  book: {
    backgroundColor: "#FFFDF7",
    borderColor: "#DDCEB8",
    borderRadius: RADII.medium,
    borderWidth: 1,
    minHeight: 430,
    overflow: "hidden",
    padding: 24,
    paddingLeft: 34,
    position: "relative",
  },
  binding: {
    backgroundColor: COLORS.vermilion,
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 10,
  },
  bookEyebrow: {
    color: COLORS.vermilion,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  bookTitle: {
    color: COLORS.ink,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 5,
  },
  bookCopy: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  stamps: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 28,
  },
  stamp: {
    alignItems: "center",
    borderColor: COLORS.line,
    borderRadius: 58,
    borderStyle: "dashed",
    borderWidth: 2,
    height: 116,
    justifyContent: "center",
    width: "46%",
  },
  stampText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 7,
  },
  collectionCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 15,
  },
  collectionIcon: {
    alignItems: "center",
    backgroundColor: COLORS.paperStrong,
    borderRadius: 15,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  collectionBody: {
    flex: 1,
  },
  collectionTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  collectionDescription: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  track: {
    backgroundColor: COLORS.mist,
    borderRadius: RADII.pill,
    height: 6,
    marginTop: 9,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: COLORS.gold,
    height: "100%",
    width: "2%",
  },
  percent: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: "900",
  },
});
