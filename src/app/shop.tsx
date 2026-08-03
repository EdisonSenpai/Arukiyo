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

import { COLORS, RADII, SPACING } from "@/constants/theme";

const ITEMS = [
  {
    title: "Sakura Trail",
    category: "Efect de traseu",
    price: 250,
    icon: "flower" as const,
    accent: COLORS.sakuraSoft,
  },
  {
    title: "Kitsune Frame",
    category: "Ramă de profil",
    price: 400,
    icon: "sparkles" as const,
    accent: COLORS.paperStrong,
  },
  {
    title: "Matcha Map",
    category: "Temă de hartă",
    price: 320,
    icon: "map" as const,
    accent: COLORS.matchaSoft,
  },
];

export default function ShopScreen() {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={COLORS.ink} name="arrow-back" size={23} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>PERSONALIZARE</Text>
            <Text style={styles.title}>Arukiyo Shop</Text>
          </View>
          <View style={styles.wallet}>
            <Ionicons color={COLORS.gold} name="leaf" size={17} />
            <Text style={styles.walletText}>0</Text>
          </View>
        </View>

        <View style={styles.banner}>
          <View>
            <Text style={styles.bannerEyebrow}>COLECȚIA DE START</Text>
            <Text style={styles.bannerTitle}>Sakura Journey</Text>
            <Text style={styles.bannerCopy}>
              Primele cosmetice vor fi cumpărate cu monede câștigate prin
              explorare.
            </Text>
          </View>
          <Ionicons color={COLORS.sakura} name="flower" size={62} />
        </View>

        <View style={styles.filters}>
          <View style={styles.filterActive}>
            <Text style={styles.filterActiveText}>Recomandate</Text>
          </View>
          <Text style={styles.filterText}>Teme</Text>
          <Text style={styles.filterText}>Profil</Text>
        </View>

        <View style={styles.items}>
          {ITEMS.map((item) => (
            <View key={item.title} style={styles.item}>
              <View style={[styles.itemArt, { backgroundColor: item.accent }]}>
                <Ionicons color={COLORS.ink} name={item.icon} size={38} />
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

        <Text style={styles.notice}>
          Shop-ul este momentan un prototip vizual. Economia reală și
          inventarul se conectează ulterior la backend.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.paper,
    flex: 1,
  },
  content: {
    gap: SPACING.large,
    paddingBottom: 30,
    paddingHorizontal: SPACING.medium,
    paddingTop: 12,
  },
  header: {
    alignItems: "center",
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
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.vermilion,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: COLORS.ink,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },
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
  walletText: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  banner: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.large,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
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
    maxWidth: 235,
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
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
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
  itemTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 3,
  },
  priceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
  },
  price: {
    color: COLORS.inkSoft,
    fontSize: 13,
    fontWeight: "900",
  },
  notice: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
});
