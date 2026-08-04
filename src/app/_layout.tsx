import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

import { COLORS } from "@/constants/theme";
import { migrateExplorationDatabase } from "@/lib/exploration-db";
import { LanguageProvider } from "@/providers/LanguageProvider";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName="arukiyo-exploration.db"
      onInit={migrateExplorationDatabase}
    >
      <LanguageProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            animation: "slide_from_right",
            contentStyle: { backgroundColor: COLORS.paper },
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="shop" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="language" />
          <Stack.Screen name="session-summary" />
          <Stack.Screen name="session-history" />
        </Stack>
      </LanguageProvider>
    </SQLiteProvider>
  );
}
