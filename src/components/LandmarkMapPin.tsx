import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { COLORS, RADII } from "@/constants/theme";
import type { NearbyLandmark } from "@/lib/landmarks";

export function LandmarkMapPin({
  landmark,
  primary,
  unlocked,
}: {
  landmark: NearbyLandmark;
  primary: boolean;
  unlocked: boolean;
}) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityLabel={
        unlocked
          ? t("landmark.discovery.unlockedPin")
          : t("landmark.discovery.undiscoveredPin")
      }
      style={styles.wrap}
    >
      <View
        style={[
          styles.bubble,
          !primary && styles.bubbleSecondary,
          unlocked
            ? styles.bubbleUnlocked
            : styles.bubbleLocked,
        ]}
      >
        <Ionicons
          color={COLORS.white}
          name={
            unlocked
              ? "checkmark"
              : iconForCategory(landmark.category)
          }
          size={18}
        />
      </View>

      <View
        style={[
          styles.tip,
          unlocked
            ? styles.tipUnlocked
            : styles.tipLocked,
        ]}
      />

      {primary ? (
        <View style={styles.distancePill}>
          <Text style={styles.distanceText}>
            {formatPinDistance(landmark.distanceMeters)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function iconForCategory(
  category: NearbyLandmark["category"],
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

function formatPinDistance(meters: number): string {
  if (meters < 1_000) {
    return `${Math.max(0, Math.round(meters))} m`;
  }

  return `${(meters / 1_000).toFixed(1)} km`;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    minWidth: 44,
  },
  bubble: {
    alignItems: "center",
    borderColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 3,
    height: 40,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    width: 40,
  },
  bubbleSecondary: {
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    width: 32,
  },
  bubbleLocked: {
    backgroundColor: COLORS.gold,
  },
  bubbleUnlocked: {
    backgroundColor: COLORS.vermilion,
  },
  tip: {
    borderLeftColor: "transparent",
    borderLeftWidth: 6,
    borderRightColor: "transparent",
    borderRightWidth: 6,
    borderTopWidth: 9,
    height: 0,
    marginTop: -2,
    width: 0,
  },
  tipLocked: {
    borderTopColor: COLORS.gold,
  },
  tipUnlocked: {
    borderTopColor: COLORS.vermilion,
  },
  distancePill: {
    backgroundColor: "rgba(23,35,31,0.92)",
    borderRadius: RADII.pill,
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  distanceText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: "900",
  },
});
