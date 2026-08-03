import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { COLORS, RADII, SPACING } from "@/constants/theme";
import {
  LanguageMode,
  useLanguage,
} from "@/providers/LanguageProvider";

const OPTIONS: Array<{
  mode: LanguageMode;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  titleKey: string;
  descriptionKey: string;
}> = [
  {
    mode: "en",
    icon: "globe-outline",
    titleKey: "language.english",
    descriptionKey: "language.englishDescription",
  },
  {
    mode: "ro",
    icon: "chatbubble-ellipses-outline",
    titleKey: "language.romanian",
    descriptionKey: "language.romanianDescription",
  },
  {
    mode: "ja",
    icon: "flower-outline",
    titleKey: "language.japanese",
    descriptionKey: "language.japaneseDescription",
  },
  {
    mode: "device",
    icon: "phone-portrait-outline",
    titleKey: "language.device",
    descriptionKey: "language.deviceDescription",
  },
];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const {
    languageMode,
    resolvedLanguage,
    setLanguageMode,
  } = useLanguage();
  const [savingMode, setSavingMode] =
    useState<LanguageMode | null>(null);

  const resolvedName =
    resolvedLanguage === "ro"
      ? t("language.romanian")
      : resolvedLanguage === "ja"
        ? t("language.japanese")
        : t("language.english");

  const selectLanguage = async (mode: LanguageMode) => {
    setSavingMode(mode);

    try {
      await setLanguageMode(mode);
    } finally {
      setSavingMode(null);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
              {t("language.eyebrow")}
            </Text>
            <Text style={styles.title}>
              {t("language.title")}
            </Text>
            <Text style={styles.subtitle}>
              {t("language.subtitle")}
            </Text>
          </View>
        </View>

        <View style={styles.languageList}>
          {OPTIONS.map((option) => {
            const selected = languageMode === option.mode;
            const saving = savingMode === option.mode;

            return (
              <Pressable
                key={option.mode}
                disabled={savingMode !== null}
                onPress={() => {
                  void selectLanguage(option.mode);
                }}
                style={({ pressed }) => [
                  styles.languageCard,
                  selected && styles.languageCardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.languageIcon,
                    selected && styles.languageIconSelected,
                  ]}
                >
                  <Ionicons
                    color={selected ? COLORS.white : COLORS.ink}
                    name={option.icon}
                    size={24}
                  />
                </View>

                <View style={styles.languageCopy}>
                  <View style={styles.languageTitleRow}>
                    <Text style={styles.languageTitle}>
                      {t(option.titleKey)}
                    </Text>
                    {option.mode === "en" ? (
                      <View style={styles.defaultPill}>
                        <Text style={styles.defaultText}>
                          {t("common.default")}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.languageDescription}>
                    {t(option.descriptionKey)}
                  </Text>
                  {option.mode === "device" ? (
                    <Text style={styles.deviceResolved}>
                      {t("language.deviceResolved", {
                        language: resolvedName,
                      })}
                    </Text>
                  ) : null}
                </View>

                {saving ? (
                  <ActivityIndicator color={COLORS.vermilion} />
                ) : selected ? (
                  <View style={styles.check}>
                    <Ionicons
                      color={COLORS.white}
                      name="checkmark"
                      size={18}
                    />
                  </View>
                ) : (
                  <View style={styles.emptyCheck} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.note}>
          <Ionicons
            color={COLORS.matcha}
            name="information-circle-outline"
            size={22}
          />
          <Text style={styles.noteText}>
            {t("settings.languageDescription")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.paper, flex: 1 },
  content: {
    gap: SPACING.large,
    paddingBottom: 30,
    paddingHorizontal: SPACING.medium,
    paddingTop: 12,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
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
  headerCopy: { flex: 1 },
  eyebrow: {
    color: COLORS.vermilion,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginTop: 2,
  },
  title: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 3,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  languageList: { gap: 11 },
  languageCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 82,
    padding: 13,
  },
  languageCardSelected: {
    backgroundColor: COLORS.sakuraSoft,
    borderColor: "#E2AFC0",
  },
  languageIcon: {
    alignItems: "center",
    backgroundColor: COLORS.matchaSoft,
    borderRadius: 16,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  languageIconSelected: {
    backgroundColor: COLORS.vermilion,
  },
  languageCopy: { flex: 1 },
  languageTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  languageTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  languageDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  defaultPill: {
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADII.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  defaultText: {
    color: COLORS.inkSoft,
    fontSize: 8,
    fontWeight: "900",
  },
  deviceResolved: {
    color: COLORS.matcha,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 5,
  },
  check: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  emptyCheck: {
    borderColor: COLORS.line,
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    width: 28,
  },
  note: {
    alignItems: "flex-start",
    backgroundColor: COLORS.matchaSoft,
    borderColor: "#BFD1C0",
    borderRadius: RADII.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 13,
  },
  noteText: {
    color: COLORS.inkSoft,
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
