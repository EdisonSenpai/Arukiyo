import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { COLORS } from "@/constants/theme";

export default function RootLayout() {
  return (
    <>
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
      </Stack>
    </>
  );
}
