import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";

type SectionTitleProps = {
  title: string;
  action?: string;
};

export function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: "900",
  },
  action: {
    color: COLORS.vermilion,
    fontSize: 13,
    fontWeight: "800",
  },
});
