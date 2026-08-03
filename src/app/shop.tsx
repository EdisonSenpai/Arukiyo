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

export default function ShopScreen() {
  const { t } = useTranslation();

  const items = [
    {
      title: t("shop.sakuraTrail"),
      category: t("shop.trailEffect"),
      price: 250,
      icon: "flower" as const,
      accent: COLORS.sakuraSoft,
    },
    {
      title: t("shop.kitsuneFrame"),
      category: t("shop.profileFrame"),
      price: 400,
      icon: "sparkles" as const,
      accent: COLORS.paperStrong,
    },
    {
      title: t("shop.matchaMap"),
      category: t("shop.mapTheme"),
      price: 320,
      icon: "map" as const,
      accent: COLORS.matchaSoft,
    },
  ];

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
            <Ionicons color={COLORS.ink} name="arrow-back" size={23} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t("shop.eyebrow")}</Text>
            <Text style={styles.title}>{t("shop.title")}</Text>
          </View>
          <View style={styles.wallet}>
            <Ionicons color={COLORS.gold} name="leaf" size={17} />
            <Text style={styles.walletText}>0</Text>
          </View>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerCopyWrap}>
            <Text style={styles.bannerEyebrow}>
              {t("shop.starterCollection")}
            </Text>
            <Text style={styles.bannerTitle}>
              {t("shop.collectionTitle")}
            </Text>
            <Text style={styles.bannerCopy}>
              {t("shop.collectionCopy")}
            </Text>
          </View>
          <Ionicons color={COLORS.sakura} name="flower" size={62} />
        </View>

        <View style={styles.filters}>
          <View style={styles.filterActive}>
            <Text style={styles.filterActiveText}>
              {t("shop.recommended")}
            </Text>
          </View>
          <Text style={styles.filterText}>{t("shop.themes")}</Text>
          <Text style={styles.filterText}>{t("shop.profile")}</Text>
        </View>

        <View style={styles.items}>
          {items.map((item) => (
            <View key={item.title} style={styles.item}>
              <View
                style={[
                  styles.itemArt,
                  { backgroundColor: item.accent },
                ]}
              >
                <Ionicons
                  color={COLORS.ink}
                  name={item.icon}
                  size={38}
                />
              </View>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.priceRow}>
                <Ionicons color={COLORS.gold} name="leaf" size={15} />
                <Text style={styles.price}>{item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.notice}>{t("shop.notice")}</Text>
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
  header: { alignItems: "center", flexDirection: "row", gap: 12 },
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
  },
  title: { color: COLORS.ink, fontSize: 24, fontWeight: "900", marginTop: 2 },
  wallet: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  walletText: { color: COLORS.ink, fontSize: 14, fontWeight: "900" },
  banner: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.large,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  bannerCopyWrap: { flex: 1, paddingRight: 10 },
  bannerEyebrow: {
    color: COLORS.sakuraSoft,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 5,
  },
  bannerCopy: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    maxWidth: 240,
  },
  filters: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  filterActive: {
    backgroundColor: COLORS.vermilion,
    borderRadius: RADII.pill,
    flex: 1.2,
    paddingVertical: 10,
  },
  filterActiveText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  filterText: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  items: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.medium,
    borderWidth: 1,
    padding: 12,
    width: "48%",
  },
  itemArt: {
    alignItems: "center",
    borderRadius: 15,
    height: 112,
    justifyContent: "center",
  },
  itemCategory: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 11,
    textTransform: "uppercase",
  },
  itemTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "900", marginTop: 3 },
  priceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
  },
  price: { color: COLORS.inkSoft, fontSize: 13, fontWeight: "900" },
  notice: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
});
