import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
} from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { COLORS, RADII, SPACING } from "@/constants/theme";
import {
  type ExplorationSessionSummary,
  listExplorationSessions,
} from "@/lib/exploration-db";
import {
  formatDistance,
  formatDuration,
} from "@/lib/session-tracking";
import { useExplorationSession } from "@/providers/ExplorationSessionProvider";

export default function SessionHistoryScreen() {
  const database = useSQLiteContext();
  const exploration = useExplorationSession();
  const { i18n, t } = useTranslation();
  const [sessions, setSessions] = useState<
    ExplorationSessionSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  const locale = i18n.resolvedLanguage ?? "en";
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadHistory() {
        setIsLoading(true);
        setError(null);

        try {
          const values =
            await listExplorationSessions(database);

          if (active) {
            setSessions(values);
          }
        } catch {
          if (active) {
            setError(
              t("session.errors.loadHistory"),
            );
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      void loadHistory();

      return () => {
        active = false;
      };
    }, [database, t]),
  );

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={styles.safeArea}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            color={COLORS.ink}
            name="arrow-back"
            size={23}
          />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>
            {t("session.historyEyebrow")}
          </Text>
          <Text style={styles.title}>
            {t("session.historyTitle")}
          </Text>
          <Text style={styles.subtitle}>
            {t("session.historySubtitle")}
          </Text>
        </View>
      </View>

      {exploration.isSessionActive ? (
        <ActiveSessionCard
          acceptedPoints={
            exploration.acceptedPointCount
          }
          distance={formatDistance(
            exploration.sessionDistanceMeters,
            locale,
          )}
          duration={formatDuration(
            exploration.sessionElapsedSeconds,
          )}
          newCells={exploration.sessionNewCellCount}
          onReturn={() =>
            router.replace("/explore")
          }
        />
      ) : null}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator
            color={COLORS.vermilion}
          />
          <Text style={styles.loadingText}>
            {t("session.loading")}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons
            color={COLORS.vermilion}
            name="alert-circle-outline"
            size={36}
          />
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <Ionicons
              color={COLORS.vermilion}
              name="footsteps-outline"
              size={38}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {t("session.emptyTitle")}
          </Text>
          <Text style={styles.emptyCopy}>
            {t("session.emptyCopy")}
          </Text>
          <Pressable
            onPress={() =>
              router.replace("/explore")
            }
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {t("session.backToExplore")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {sessions.map((session) => (
            <Pressable
              key={session.id}
              onPress={() =>
                router.push({
                  pathname: "/session-summary",
                  params: { id: session.id },
                })
              }
              style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Ionicons
                    color={COLORS.vermilion}
                    name="walk-outline"
                    size={25}
                  />
                </View>

                <View style={styles.cardCopy}>
                  <Text style={styles.cardDate}>
                    {dateFormatter.format(
                      new Date(session.startedAt),
                    )}
                  </Text>
                  <Text style={styles.cardStatus}>
                    {t(
                      `session.status.${session.status}`,
                    )}
                  </Text>
                </View>

                <Ionicons
                  color={COLORS.muted}
                  name="chevron-forward"
                  size={20}
                />
              </View>

              <View style={styles.metrics}>
                <HistoryMetric
                  label={t("session.distance")}
                  value={formatDistance(
                    session.distanceMeters,
                    locale,
                  )}
                />
                <HistoryMetric
                  label={t("session.duration")}
                  value={formatDuration(
                    session.durationSeconds,
                  )}
                />
                <HistoryMetric
                  label={t("session.newCells")}
                  value={String(
                    session.discoveredCells,
                  )}
                />
              </View>

              {session.status === "interrupted" ? (
                <View style={styles.interrupted}>
                  <Ionicons
                    color={COLORS.gold}
                    name="pause-circle-outline"
                    size={16}
                  />
                  <Text
                    style={styles.interruptedText}
                  >
                    {t(
                      "session.interruptedCopy",
                    )}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ActiveSessionCard({
  acceptedPoints,
  distance,
  duration,
  newCells,
  onReturn,
}: {
  acceptedPoints: number;
  distance: string;
  duration: string;
  newCells: number;
  onReturn: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.activeCard}>
      <View style={styles.activeHeader}>
        <View>
          <Text style={styles.activeEyebrow}>
            {t("session.liveSession")}
          </Text>
          <Text style={styles.activeMeta}>
            {t("session.acceptedRejected", {
              accepted: acceptedPoints,
              rejected: 0,
            })}
          </Text>
        </View>

        <View style={styles.activeDot} />
      </View>

      <View style={styles.activeMetrics}>
        <ActiveMetric
          label={t("session.distance")}
          value={distance}
        />
        <ActiveMetric
          label={t("session.duration")}
          value={duration}
        />
        <ActiveMetric
          label={t("session.newCells")}
          value={String(newCells)}
        />
      </View>

      <Pressable
        onPress={onReturn}
        style={({ pressed }) => [
          styles.returnButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          color={COLORS.ink}
          name="navigate-outline"
          size={18}
        />
        <Text style={styles.returnButtonText}>
          {t("session.backToExplore")}
        </Text>
      </Pressable>
    </View>
  );
}

function ActiveMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.activeMetric}>
      <Text style={styles.activeMetricValue}>
        {value}
      </Text>
      <Text style={styles.activeMetricLabel}>
        {label}
      </Text>
    </View>
  );
}

function HistoryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>
        {value}
      </Text>
      <Text style={styles.metricLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.paper,
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: SPACING.medium,
    paddingTop: 12,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 15,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.vermilion,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginTop: 2,
  },
  title: {
    color: COLORS.ink,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 3,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  activeCard: {
    backgroundColor: COLORS.ink,
    borderRadius: RADII.large,
    marginHorizontal: SPACING.medium,
    marginTop: SPACING.large,
    padding: 15,
  },
  activeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activeEyebrow: {
    color: COLORS.sakuraSoft,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  activeMeta: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 9,
    marginTop: 3,
  },
  activeDot: {
    backgroundColor: COLORS.success,
    borderColor: "rgba(255,255,255,0.55)",
    borderRadius: 7,
    borderWidth: 3,
    height: 14,
    width: 14,
  },
  activeMetrics: {
    flexDirection: "row",
    gap: 7,
    marginTop: 13,
  },
  activeMetric: {
    alignItems: "center",
    backgroundColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 13,
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 9,
  },
  activeMetricValue: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  activeMetricLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 8,
    marginTop: 3,
  },
  returnButton: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADII.medium,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 44,
  },
  returnButtonText: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "900",
  },
  centered: {
    alignItems: "center",
    flex: 1,
    gap: 13,
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  errorText: {
    color: COLORS.inkSoft,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 30,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  emptyTitle: {
    color: COLORS.ink,
    fontSize: 21,
    fontWeight: "900",
  },
  emptyCopy: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 290,
    textAlign: "center",
  },
  list: {
    gap: 12,
    paddingBottom: 30,
    paddingHorizontal: SPACING.medium,
    paddingTop: SPACING.large,
  },
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    padding: 14,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 15,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  cardCopy: {
    flex: 1,
  },
  cardDate: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  cardStatus: {
    color: COLORS.matcha,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  metrics: {
    borderTopColor: COLORS.line,
    borderTopWidth: 1,
    flexDirection: "row",
    marginTop: 13,
    paddingTop: 12,
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: 8,
    marginTop: 3,
  },
  interrupted: {
    alignItems: "flex-start",
    backgroundColor: COLORS.paperStrong,
    borderRadius: 12,
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
    padding: 9,
  },
  interruptedText: {
    color: COLORS.inkSoft,
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.medium,
    justifyContent: "center",
    marginTop: 6,
    minHeight: 50,
    paddingHorizontal: 22,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
});
