import { Ionicons } from "@expo/vector-icons";
import {
  useEffect,
  useMemo,
} from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { COLORS, RADII } from "@/constants/theme";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { triggerDiscoveryFeedback } from "@/lib/feedback";

type DiscoveryCelebrationProps = {
  cellId: string | null;
  onDismiss: () => void;
  rewarded: boolean;
};

const PETAL_CONFIG = [
  { delay: 0, drift: -92, rotation: -140 },
  { delay: 80, drift: -58, rotation: -90 },
  { delay: 130, drift: -24, rotation: -45 },
  { delay: 45, drift: 34, rotation: 55 },
  { delay: 110, drift: 68, rotation: 100 },
  { delay: 170, drift: 98, rotation: 145 },
] as const;

export function DiscoveryCelebration({
  cellId,
  onDismiss,
  rewarded,
}: DiscoveryCelebrationProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.86);
  const translateY = useSharedValue(-8);

  useEffect(() => {
    if (!cellId) {
      opacity.value = 0;
      return;
    }

    void triggerDiscoveryFeedback();

    if (reducedMotion) {
      opacity.value = 1;
      scale.value = 1;
      translateY.value = 0;
    } else {
      opacity.value = withSequence(
        withTiming(1, {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        }),
        withDelay(
          1_650,
          withTiming(0, {
            duration: 280,
            easing: Easing.in(Easing.cubic),
          }),
        ),
      );
      scale.value = withSequence(
        withSpring(1.05, {
          damping: 11,
          stiffness: 210,
        }),
        withSpring(1, {
          damping: 14,
          stiffness: 180,
        }),
      );
      translateY.value = withSpring(0, {
        damping: 16,
        stiffness: 160,
      });
    }

    const timeout = setTimeout(
      onDismiss,
      reducedMotion ? 1_450 : 2_100,
    );

    return () => clearTimeout(timeout);
  }, [
    cellId,
    onDismiss,
    opacity,
    reducedMotion,
    scale,
    translateY,
  ]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const shortCellId = useMemo(
    () => cellId?.slice(-8).toUpperCase() ?? "",
    [cellId],
  );

  if (!cellId) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={styles.overlay}
    >
      {PETAL_CONFIG.map((petal, index) => (
        <SakuraPetal
          delay={petal.delay}
          drift={petal.drift}
          key={`${cellId}-${index}`}
          reducedMotion={reducedMotion}
          rotation={petal.rotation}
        />
      ))}

      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.seal}>
          <Ionicons
            color={COLORS.white}
            name="sparkles"
            size={23}
          />
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>
            {t("feedback.discovery.eyebrow")}
          </Text>
          <Text style={styles.title}>
            {t("feedback.discovery.title")}
          </Text>
          <Text numberOfLines={1} style={styles.cell}>
            {t("feedback.discovery.cell", {
              id: shortCellId,
            })}
          </Text>
        </View>

        <View style={styles.reward}>
          {rewarded ? (
            <>
              <Text style={styles.rewardXp}>+10 XP</Text>
              <View style={styles.rewardCoinRow}>
                <Ionicons
                  color={COLORS.gold}
                  name="leaf"
                  size={11}
                />
                <Text style={styles.rewardCoins}>+2</Text>
              </View>
            </>
          ) : (
            <Text style={styles.savedText}>
              {t("feedback.discovery.savedLocally")}
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function SakuraPetal({
  delay,
  drift,
  reducedMotion,
  rotation,
}: {
  delay: number;
  drift: number;
  reducedMotion: boolean;
  rotation: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 0;
      return;
    }

    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: 1_250,
        easing: Easing.out(Easing.quad),
      }),
    );
  }, [delay, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion
      ? 0
      : interpolate(
          progress.value,
          [0, 0.2, 0.78, 1],
          [0, 0.9, 0.7, 0],
        ),
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [0, drift],
        ),
      },
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [0, 92],
        ),
      },
      {
        rotate: `${interpolate(
          progress.value,
          [0, 1],
          [0, rotation],
        )}deg`,
      },
      {
        scale: interpolate(
          progress.value,
          [0, 0.25, 1],
          [0.6, 1, 0.8],
        ),
      },
    ],
  }));

  return (
    <Animated.View
      style={[styles.petal, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    left: 12,
    position: "absolute",
    right: 12,
    top: 16,
    zIndex: 20,
  },
  card: {
    alignItems: "center",
    backgroundColor: "rgba(23,35,31,0.96)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: RADII.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    width: "100%",
  },
  seal: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 21,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: COLORS.sakuraSoft,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  cell: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 8,
    marginTop: 3,
  },
  reward: {
    alignItems: "flex-end",
  },
  rewardXp: {
    color: COLORS.sakuraSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  rewardCoinRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    marginTop: 4,
  },
  rewardCoins: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
  savedText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 8,
    fontWeight: "900",
    maxWidth: 72,
    textAlign: "right",
  },
  petal: {
    backgroundColor: COLORS.sakura,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 13,
    position: "absolute",
    top: 36,
    width: 9,
    zIndex: 25,
  },
});
