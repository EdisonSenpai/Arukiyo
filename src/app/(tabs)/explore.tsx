import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ExplorationMap } from "@/components/ExplorationMap";
import { ScreenHeader } from "@/components/ScreenHeader";
import { COLORS, RADII, SPACING } from "@/constants/theme";
import { useExplorationSession } from "@/hooks/useExplorationSession";
import { formatApproximateCoordinate } from "@/lib/home-location";

export default function ExploreScreen() {
  const { i18n, t } = useTranslation();
  const exploration = useExplorationSession();
  const [recenterToken, setRecenterToken] = useState(0);

  const permissionGranted =
    exploration.permission?.granted === true;
  const permissionBlocked =
    exploration.permission?.canAskAgain === false &&
    !permissionGranted;

  const completionText = useMemo(
    () =>
      new Intl.NumberFormat(i18n.resolvedLanguage ?? "en", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      }).format(exploration.homeZoneCompletion),
    [exploration.homeZoneCompletion, i18n.resolvedLanguage],
  );

  const confirmSaveHome = () => {
    Alert.alert(
      exploration.homeLocation
        ? t("explore.confirmMoveHomeTitle")
        : t("explore.confirmHomeTitle"),
      t("explore.confirmHomeCopy"),
      [
        { style: "cancel", text: t("explore.cancel") },
        {
          onPress: () => {
            void exploration.saveCurrentAsHome();
          },
          text: exploration.homeLocation
            ? t("explore.moveHome")
            : t("explore.setHome"),
        },
      ],
    );
  };

  const confirmRemoveHome = () => {
    Alert.alert(
      t("explore.confirmDeleteHomeTitle"),
      t("explore.confirmDeleteHomeCopy"),
      [
        { style: "cancel", text: t("explore.keep") },
        {
          onPress: () => {
            void exploration.removeHome();
          },
          style: "destructive",
          text: t("explore.deleteHome"),
        },
      ],
    );
  };

  const confirmClearExploration = () => {
    Alert.alert(
      t("explore.confirmResetTitle"),
      t("explore.confirmResetCopy"),
      [
        { style: "cancel", text: t("explore.cancel") },
        {
          onPress: () => {
            void exploration.clearExploration();
          },
          style: "destructive",
          text: t("explore.reset"),
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.header}>
          <ScreenHeader
            eyebrow={t("explore.eyebrow")}
            subtitle={t("explore.subtitle")}
            title={t("explore.title")}
            trailing={
              <View
                style={[
                  styles.gpsPill,
                  exploration.isSessionActive &&
                    styles.gpsPillActive,
                ]}
              >
                <View
                  style={[
                    styles.gpsDot,
                    exploration.isSessionActive &&
                      styles.gpsDotActive,
                  ]}
                />
                <Text style={styles.gpsText}>
                  {exploration.isSessionActive
                    ? t("explore.sessionActive")
                    : permissionGranted
                      ? t("explore.gpsReady")
                      : t("explore.gpsInactive")}
                </Text>
              </View>
            }
          />
        </View>

        <View style={styles.mapArea}>
          <ExplorationMap
            cellFeatures={exploration.cellFeatures}
            currentLocation={exploration.currentLocation}
            homeLocation={exploration.homeLocation}
            recenterToken={recenterToken}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.panelContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={styles.panel}
        >
          {exploration.error ? (
            <View style={styles.errorCard}>
              <Ionicons
                color={COLORS.vermilion}
                name="alert-circle"
                size={21}
              />
              <Text style={styles.errorText}>
                {exploration.error}
              </Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable
              disabled={
                exploration.isBusy ||
                exploration.isHydrating
              }
              onPress={() => {
                void exploration.startSession();
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                exploration.isSessionActive &&
                  styles.stopButton,
                (pressed || exploration.isBusy) &&
                  styles.pressed,
              ]}
            >
              {exploration.isBusy ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Ionicons
                  color={COLORS.white}
                  name={
                    exploration.isSessionActive
                      ? "stop"
                      : "navigate"
                  }
                  size={20}
                />
              )}
              <Text style={styles.primaryButtonText}>
                {exploration.isSessionActive
                  ? t("explore.stopSession")
                  : t("explore.startSession")}
              </Text>
            </Pressable>

            <Pressable
              disabled={exploration.isBusy}
              onPress={() => {
                void exploration.refreshLocation();
                setRecenterToken((value) => value + 1);
              }}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons color={COLORS.ink} name="locate" size={22} />
            </Pressable>
          </View>

          {permissionBlocked ? (
            <Pressable
              onPress={() => {
                void Linking.openSettings();
              }}
              style={styles.settingsButton}
            >
              <Ionicons
                color={COLORS.ink}
                name="settings-outline"
                size={19}
              />
              <Text style={styles.settingsButtonText}>
                {t("explore.openSettings")}
              </Text>
            </Pressable>
          ) : null}

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressHeaderCopy}>
                <Text style={styles.cardEyebrow}>
                  {t("explore.localHomeArea")}
                </Text>
                <Text style={styles.progressTitle}>
                  {exploration.homeLocation
                    ? t("explore.homeProgress")
                    : t("explore.currentAreaProgress")}
                </Text>
              </View>
              <Text style={styles.percent}>
                {completionText}%
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(
                      2,
                      exploration.homeZoneCompletion,
                    )}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.progressMeta}>
              <Text style={styles.metaText}>
                {t("explore.hexagons", {
                  explored: exploration.homeZoneExploredCount,
                  total: exploration.homeZoneTotalCount || 0,
                })}
              </Text>
              <Text style={styles.metaText}>
                {t("explore.totalDiscovered", {
                  count: exploration.exploredCellCount,
                })}
              </Text>
            </View>
          </View>

          {exploration.lastDiscoveredCell ? (
            <View style={styles.discoveryCard}>
              <View style={styles.discoveryIcon}>
                <Ionicons
                  color={COLORS.vermilion}
                  name="sparkles"
                  size={22}
                />
              </View>
              <View style={styles.discoveryCopy}>
                <Text style={styles.discoveryTitle}>
                  {t("explore.newHexagon")}
                </Text>
                <Text
                  numberOfLines={1}
                  style={styles.discoveryCode}
                >
                  {exploration.lastDiscoveredCell}
                </Text>
              </View>
              <Text style={styles.reward}>+10 XP</Text>
            </View>
          ) : null}

          <View style={styles.homeCard}>
            <View style={styles.homeIcon}>
              <Ionicons
                color={COLORS.vermilion}
                name={
                  exploration.homeLocation
                    ? "home"
                    : "home-outline"
                }
                size={23}
              />
            </View>

            <View style={styles.homeCopy}>
              <Text style={styles.homeTitle}>
                {exploration.homeLocation
                  ? t("explore.zoneConfigured")
                  : t("explore.zoneMissing")}
              </Text>
              <Text style={styles.homeDescription}>
                {exploration.homeLocation
                  ? `${formatApproximateCoordinate(
                      exploration.homeLocation.latitude,
                    )} · ${formatApproximateCoordinate(
                      exploration.homeLocation.longitude,
                    )}`
                  : t("explore.zoneMissingCopy")}
              </Text>
            </View>

            {exploration.currentLocation ? (
              <Pressable
                disabled={exploration.isBusy}
                onPress={confirmSaveHome}
                style={styles.smallAction}
              >
                <Text style={styles.smallActionText}>
                  {exploration.homeLocation
                    ? t("explore.move")
                    : t("explore.set")}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.statsRow}>
            <Stat
              label={t("explore.currentCell")}
              value={
                exploration.currentCell
                  ? exploration.currentCell.slice(-6)
                  : "—"
              }
            />
            <Stat
              label={t("explore.gpsAccuracy")}
              value={
                exploration.currentLocation?.coords.accuracy == null
                  ? "—"
                  : `±${Math.round(
                      exploration.currentLocation.coords.accuracy,
                    )} m`
              }
            />
            <Stat
              label={t("explore.mode")}
              value={
                exploration.isSessionActive
                  ? t("explore.live")
                  : t("explore.paused")
              }
            />
          </View>

          <View style={styles.utilityRow}>
            {exploration.homeLocation ? (
              <Pressable
                onPress={confirmRemoveHome}
                style={styles.utilityButton}
              >
                <Ionicons
                  color={COLORS.vermilion}
                  name="home-outline"
                  size={18}
                />
                <Text style={styles.dangerText}>
                  {t("explore.deleteHome")}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={confirmClearExploration}
              style={styles.utilityButton}
            >
              <Ionicons
                color={COLORS.vermilion}
                name="refresh-outline"
                size={18}
              />
              <Text style={styles.dangerText}>
                {t("explore.resetFog")}
              </Text>
            </Pressable>
          </View>

          <View style={styles.noticeCard}>
            <Ionicons
              color={COLORS.matcha}
              name="information-circle-outline"
              size={22}
            />
            <Text style={styles.noticeText}>
              {t("explore.foregroundNotice")}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Text numberOfLines={1} style={styles.statValue}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.paper, flex: 1 },
  page: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.medium,
    paddingTop: 10,
  },
  mapArea: {
    flex: 1,
    minHeight: 330,
    paddingHorizontal: SPACING.medium,
    paddingTop: 14,
  },
  panel: { flexGrow: 0, maxHeight: 310 },
  panelContent: {
    gap: 12,
    paddingBottom: 28,
    paddingHorizontal: SPACING.medium,
    paddingTop: 14,
  },
  gpsPill: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    maxWidth: 118,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  gpsPillActive: {
    backgroundColor: COLORS.matchaSoft,
    borderColor: "#BFD1C0",
  },
  gpsDot: {
    backgroundColor: COLORS.muted,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  gpsDotActive: { backgroundColor: COLORS.success },
  gpsText: {
    color: COLORS.inkSoft,
    flexShrink: 1,
    fontSize: 9,
    fontWeight: "900",
  },
  errorCard: {
    alignItems: "flex-start",
    backgroundColor: "#FBE9E6",
    borderColor: "#EDC0B9",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 12,
  },
  errorText: {
    color: COLORS.inkSoft,
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },
  actionRow: { flexDirection: "row", gap: 10 },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.medium,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 14,
  },
  stopButton: { backgroundColor: COLORS.vermilion },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    height: 50,
    justifyContent: "center",
    width: 52,
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    padding: 12,
  },
  settingsButtonText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    padding: 14,
  },
  progressHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressHeaderCopy: { flex: 1, paddingRight: 8 },
  cardEyebrow: {
    color: COLORS.matcha,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  progressTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },
  percent: {
    color: COLORS.vermilion,
    fontSize: 20,
    fontWeight: "900",
  },
  progressTrack: {
    backgroundColor: COLORS.mist,
    borderRadius: RADII.pill,
    height: 8,
    marginTop: 13,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: COLORS.sakura,
    borderRadius: RADII.pill,
    height: "100%",
  },
  progressMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaText: { color: COLORS.muted, fontSize: 10, fontWeight: "700" },
  discoveryCard: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderColor: "#E7B9C5",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  discoveryIcon: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  discoveryCopy: { flex: 1 },
  discoveryTitle: { color: COLORS.ink, fontSize: 13, fontWeight: "900" },
  discoveryCode: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
  reward: { color: COLORS.vermilion, fontSize: 11, fontWeight: "900" },
  homeCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  homeIcon: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  homeCopy: { flex: 1 },
  homeTitle: { color: COLORS.ink, fontSize: 13, fontWeight: "900" },
  homeDescription: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  smallAction: {
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADII.pill,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  smallActionText: { color: COLORS.ink, fontSize: 10, fontWeight: "900" },
  statsRow: { flexDirection: "row", gap: 8 },
  stat: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 11,
  },
  statValue: { color: COLORS.ink, fontSize: 12, fontWeight: "900" },
  statLabel: {
    color: COLORS.muted,
    fontSize: 8,
    marginTop: 4,
    textAlign: "center",
  },
  utilityRow: { flexDirection: "row", gap: 8 },
  utilityButton: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: "#EDC0B9",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    padding: 11,
  },
  dangerText: {
    color: COLORS.vermilion,
    fontSize: 10,
    fontWeight: "900",
  },
  noticeCard: {
    alignItems: "flex-start",
    backgroundColor: COLORS.matchaSoft,
    borderColor: "#BFD1C0",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 12,
  },
  noticeText: {
    color: COLORS.inkSoft,
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
