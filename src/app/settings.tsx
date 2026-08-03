import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { COLORS, RADII, SPACING } from "@/constants/theme";
import { useLanguage } from "@/providers/LanguageProvider";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { languageMode, resolvedLanguage } = useLanguage();

  const languageLabel =
    languageMode === "device"
      ? `${t("language.device")} · ${languageName(
          resolvedLanguage,
          t,
        )}`
      : languageName(languageMode, t);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header
          eyebrow={t("settings.eyebrow")}
          subtitle={t("settings.subtitle")}
          title={t("settings.title")}
        />

        <SettingsGroup title={t("settings.experience")}>
          <SettingsRow
            description={t("settings.languageDescription")}
            icon="language-outline"
            onPress={() => router.push("/language")}
            title={t("settings.language")}
            value={languageLabel}
          />
          <SettingsRow
            description={t("settings.privacyDescription")}
            icon="shield-checkmark-outline"
            title={t("common.privacy")}
            value={t("common.comingSoon")}
          />
          <SettingsRow
            description={t("settings.accessibilityDescription")}
            icon="accessibility-outline"
            title={t("common.accessibility")}
            value={t("common.comingSoon")}
          />
        </SettingsGroup>

        <SettingsGroup title={t("settings.support")}>
          <SettingsRow
            description={t("settings.helpDescription")}
            icon="help-circle-outline"
            title={t("common.help")}
            value={t("common.comingSoon")}
          />
          <SettingsRow
            description={t("settings.aboutDescription")}
            icon="information-circle-outline"
            title={t("common.about")}
            value="v1.0.0-dev"
          />
        </SettingsGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

function languageName(
  language: "en" | "ro" | "ja",
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (language === "ro") return t("language.romanian");
  if (language === "ja") return t("language.japanese");
  return t("language.english");
}

function Header({
  eyebrow,
  subtitle,
  title,
}: {
  eyebrow: string;
  subtitle: string;
  title: string;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel={t("common.back")}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons color={COLORS.ink} name="arrow-back" size={23} />
      </Pressable>
      <View style={styles.headerCopy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function SettingsGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.groupWrap}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function SettingsRow({
  description,
  icon,
  onPress,
  title,
  value,
}: {
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  title: string;
  value: string;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rowIcon}>
        <Ionicons color={COLORS.ink} name={icon} size={22} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <View style={styles.rowValueWrap}>
        <Text numberOfLines={2} style={styles.rowValue}>
          {value}
        </Text>
        {onPress ? (
          <Ionicons
            color={COLORS.muted}
            name="chevron-forward"
            size={18}
          />
        ) : null}
      </View>
    </Pressable>
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
  groupWrap: { gap: 8 },
  groupTitle: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    paddingLeft: 4,
  },
  group: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomColor: COLORS.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 76,
    padding: 13,
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: COLORS.matchaSoft,
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  rowCopy: { flex: 1 },
  rowTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "900" },
  rowDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  rowValueWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    maxWidth: 120,
  },
  rowValue: {
    color: COLORS.vermilion,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "right",
  },
  pressed: { opacity: 0.72 },
});
