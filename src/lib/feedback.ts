import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

async function runFeedback(
  callback: () => Promise<void>,
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await callback();
  } catch {
    // Haptics are enhancement-only and must never block exploration.
  }
}

export function triggerDiscoveryFeedback(): Promise<void> {
  return runFeedback(() =>
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Medium,
    ),
  );
}

export function triggerSessionCompleteFeedback(
  leveledUp: boolean,
): Promise<void> {
  if (leveledUp) {
    return runFeedback(async () => {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
      await new Promise((resolve) =>
        setTimeout(resolve, 120),
      );
      await Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Heavy,
      );
    });
  }

  return runFeedback(() =>
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ),
  );
}
