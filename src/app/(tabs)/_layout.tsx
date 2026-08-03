import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Platform, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { COLORS } from "@/constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<
  string,
  {
    active: IconName;
    inactive: IconName;
  }
> = {
  index: { active: "home", inactive: "home-outline" },
  explore: { active: "map", inactive: "map-outline" },
  quests: { active: "flash", inactive: "flash-outline" },
  journal: { active: "book", inactive: "book-outline" },
  profile: { active: "person", inactive: "person-outline" },
};

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const icon = ICONS[route.name] ?? ICONS.index;

        return {
          headerShown: false,
          tabBarActiveTintColor: COLORS.vermilion,
          tabBarInactiveTintColor: COLORS.muted,
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              color={color}
              name={focused ? icon.active : icon.inactive}
              size={size}
            />
          ),
          tabBarLabelStyle: styles.label,
          tabBarStyle: styles.tabBar,
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tabs.home") }} />
      <Tabs.Screen name="explore" options={{ title: t("tabs.explore") }} />
      <Tabs.Screen name="quests" options={{ title: t("tabs.quests") }} />
      <Tabs.Screen name="journal" options={{ title: t("tabs.journal") }} />
      <Tabs.Screen name="profile" options={{ title: t("tabs.profile") }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.line,
    height: Platform.OS === "android" ? 76 : 88,
    paddingBottom: Platform.OS === "android" ? 12 : 24,
    paddingTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
  },
});
