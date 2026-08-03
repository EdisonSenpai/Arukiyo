import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drum nedescoperit</Text>
      <Text style={styles.copy}>Această pagină nu există încă în Arukiyo.</Text>
      <Link href="/" style={styles.link}>
        Înapoi acasă
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: COLORS.paper,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: COLORS.ink,
    fontSize: 24,
    fontWeight: "900",
  },
  copy: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  link: {
    color: COLORS.vermilion,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 20,
  },
});
