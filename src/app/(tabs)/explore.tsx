import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { COLORS, RADII, SPACING } from "@/constants/theme";

export default function ExploreScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          eyebrow="Harta ta"
          subtitle="Fiecare drum nou va risipi o parte din ceață."
          title="Explorează"
        />

        <LinearGradient
          colors={[COLORS.matchaSoft, "#F0E7D7"]}
          style={styles.map}
        >
          <View style={[styles.fog, styles.fogOne]} />
          <View style={[styles.fog, styles.fogTwo]} />
          <View style={[styles.path, styles.pathOne]} />
          <View style={[styles.path, styles.pathTwo]} />
          <View style={styles.homeMarker}>
            <Ionicons color={COLORS.white} name="home" size={24} />
          </View>
          <View style={styles.landmarkMarker}>
            <Ionicons color={COLORS.gold} name="star" size={20} />
          </View>

          <View style={styles.mapBadge}>
            <Ionicons color={COLORS.matcha} name="cloud-outline" size={18} />
            <Text style={styles.mapBadgeText}>Fog of war activ</Text>
          </View>
        </LinearGradient>

        <View style={styles.homeCard}>
          <View style={styles.homeIcon}>
            <Ionicons color={COLORS.vermilion} name="home-outline" size={24} />
          </View>
          <View style={styles.homeCopy}>
            <Text style={styles.homeTitle}>Alege zona Home</Text>
            <Text style={styles.homeDescription}>
              Arukiyo va folosi o zonă aproximativă, nu adresa ta exactă, ca
              punct inițial al progresului.
            </Text>
          </View>
          <Ionicons color={COLORS.muted} name="chevron-forward" size={21} />
        </View>

        <View style={styles.statsRow}>
          <MapStat label="Zona Home" value="0%" />
          <MapStat label="Cartier" value="0%" />
          <MapStat label="București" value="0%" />
        </View>

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Ionicons color={COLORS.white} name="navigate" size={20} />
          <Text style={styles.buttonText}>Configurează prima explorare</Text>
        </Pressable>

        <Text style={styles.notice}>
          În Stage 2 conectăm GPS-ul real, harta și primele celule de explorare.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MapStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    paddingBottom: 36,
    paddingHorizontal: SPACING.medium,
    paddingTop: 12,
  },
  map: {
    borderColor: COLORS.line,
    borderRadius: RADII.large,
    borderWidth: 1,
    height: 360,
    overflow: "hidden",
    position: "relative",
  },
  fog: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 180,
    position: "absolute",
  },
  fogOne: {
    height: 260,
    left: -70,
    top: -55,
    width: 260,
  },
  fogTwo: {
    bottom: -80,
    height: 280,
    right: -65,
    width: 280,
  },
  path: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: RADII.pill,
    position: "absolute",
  },
  pathOne: {
    height: 24,
    left: 45,
    top: 170,
    transform: [{ rotate: "18deg" }],
    width: 310,
  },
  pathTwo: {
    height: 20,
    left: 150,
    top: 105,
    transform: [{ rotate: "102deg" }],
    width: 245,
  },
  homeMarker: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderColor: COLORS.white,
    borderRadius: 30,
    borderWidth: 4,
    height: 58,
    justifyContent: "center",
    left: "42%",
    position: "absolute",
    top: "43%",
    width: 58,
  },
  landmarkMarker: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 3,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 48,
    top: 84,
    width: 44,
  },
  mapBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: 7,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: "absolute",
    top: 16,
  },
  mapBadgeText: {
    color: COLORS.inkSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  homeCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 15,
  },
  homeIcon: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 15,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  homeCopy: {
    flex: 1,
  },
  homeTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  homeDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  statsRow: {
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
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  statValue: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.medium,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    padding: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.76,
  },
  notice: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
