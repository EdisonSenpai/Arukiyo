import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useEffect,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { COLORS, RADII } from "@/constants/theme";
import type {
  LandmarkUnlockResult,
} from "@/lib/landmark-db";

export function LandmarkDiscoveryCelebration({
  onDismiss,
  unlock,
}: {
  onDismiss: () => void;
  unlock: LandmarkUnlockResult | null;
}) {
  const { t } = useTranslation();
  const [opacity] = useState(
    () => new Animated.Value(0),
  );
  const [translateY] = useState(
    () => new Animated.Value(22),
  );

  useEffect(() => {
    if (!unlock) {
      return;
    }

    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    );

    opacity.setValue(0);
    translateY.setValue(22);

    Animated.parallel([
      Animated.timing(opacity, {
        duration: 260,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        damping: 15,
        stiffness: 190,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, unlock]);

  if (!unlock) {
    return null;
  }

  const landmark = unlock.landmark;

  return (
    <View
      pointerEvents="box-none"
      style={styles.overlay}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.icon}>
            <Ionicons
              color={COLORS.white}
              name="sparkles"
              size={22}
            />
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>
              {t("landmark.discovery.eyebrow")}
            </Text>
            <Text
              numberOfLines={2}
              style={styles.title}
            >
              {landmark.name}
            </Text>
            <Text style={styles.meta}>
              {t(
                `landmark.category.${landmark.category}`,
              )}{" "}
              ·{" "}
              {t(
                `landmark.tier.${landmark.importanceTier}`,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.rewards}>
          <Reward
            icon="sparkles-outline"
            label={`+${unlock.reward.xp} XP`}
          />
          <Reward
            icon="leaf-outline"
            label={`+${unlock.reward.coins}`}
          />
          <Reward
            icon="flower-outline"
            label={`+${unlock.reward.sakuraShards}`}
          />
        </View>

        <Text style={styles.description}>
          {t("landmark.discovery.saved")}
        </Text>

        <Pressable
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {t("landmark.discovery.continue")}
          </Text>
          <Ionicons
            color={COLORS.white}
            name="arrow-forward"
            size={16}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

function Reward({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  return (
    <View style={styles.reward}>
      <Ionicons
        color={COLORS.gold}
        name={icon}
        size={15}
      />
      <Text style={styles.rewardText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    bottom: 12,
    left: 12,
    position: "absolute",
    right: 12,
    zIndex: 20,
  },
  card: {
    backgroundColor: COLORS.ink,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: RADII.large,
    borderWidth: 1,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  icon: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderRadius: 18,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.sakuraSoft,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  meta: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 9,
    marginTop: 4,
  },
  rewards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 13,
  },
  reward: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  rewardText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "900",
  },
  description: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 11,
  },
  button: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: COLORS.vermilion,
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
