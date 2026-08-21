import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { COLORS, RADII } from "@/constants/theme";

type WalletProps = {
  coins: number;
  isLoading?: boolean;
  sakuraShards: number;
};

export function WalletPills({
  coins,
  isLoading = false,
  sakuraShards,
}: WalletProps) {
  return (
    <View style={styles.pills}>
      <CurrencyPill
        currency="coins"
        isLoading={isLoading}
        value={coins}
      />
      <CurrencyPill
        currency="sakuraShards"
        isLoading={isLoading}
        value={sakuraShards}
      />
    </View>
  );
}

export function ExplorerWalletCard({
  coins,
  isLoading = false,
  sakuraShards,
  showGuide = false,
}: WalletProps & {
  showGuide?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardMark}>
          <Ionicons
            color={COLORS.vermilion}
            name="wallet-outline"
            size={21}
          />
        </View>
        <View style={styles.cardHeading}>
          <Text style={styles.cardEyebrow}>
            {t("progression.wallet.eyebrow")}
          </Text>
          <Text style={styles.cardTitle}>
            {t("progression.wallet.title")}
          </Text>
          <Text style={styles.cardSubtitle}>
            {t("progression.wallet.subtitle")}
          </Text>
        </View>
      </View>

      <View style={styles.balanceGrid}>
        <BalanceTile
          copy={t("progression.wallet.coinsCopy")}
          currency="coins"
          isLoading={isLoading}
          label={t("progression.wallet.coinsTitle")}
          value={coins}
        />
        <BalanceTile
          copy={t("progression.wallet.shardsCopy")}
          currency="sakuraShards"
          isLoading={isLoading}
          label={t("progression.wallet.shardsTitle")}
          value={sakuraShards}
        />
      </View>

      {showGuide ? (
        <View style={styles.guide}>
          <View style={styles.guideTitleRow}>
            <Ionicons
              color={COLORS.sakura}
              name="flower-outline"
              size={17}
            />
            <Text style={styles.guideTitle}>
              {t("progression.wallet.howToEarn")}
            </Text>
          </View>
          <Text style={styles.guideNow}>
            {t("progression.wallet.earnNow")}
          </Text>
          <Text style={styles.guideLater}>
            {t("progression.wallet.earnLater")}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function CurrencyPill({
  currency,
  isLoading,
  value,
}: {
  currency: "coins" | "sakuraShards";
  isLoading: boolean;
  value: number;
}) {
  const { t } = useTranslation();
  const isShard = currency === "sakuraShards";
  const color = isShard ? COLORS.sakura : COLORS.gold;
  const label = t(
    isShard
      ? "progression.sakuraShards"
      : "progression.coins",
  );

  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      style={[
        styles.pill,
        isShard && styles.shardPill,
      ]}
    >
      <Ionicons
        color={color}
        name={isShard ? "flower" : "leaf"}
        size={16}
      />
      {isLoading ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <Text style={styles.pillValue}>{value}</Text>
      )}
    </View>
  );
}

function BalanceTile({
  copy,
  currency,
  isLoading,
  label,
  value,
}: {
  copy: string;
  currency: "coins" | "sakuraShards";
  isLoading: boolean;
  label: string;
  value: number;
}) {
  const isShard = currency === "sakuraShards";
  const color = isShard ? COLORS.sakura : COLORS.gold;

  return (
    <View
      style={[
        styles.balanceTile,
        isShard && styles.shardTile,
      ]}
    >
      <View style={styles.balanceTop}>
        <View
          style={[
            styles.balanceIcon,
            isShard && styles.shardIcon,
          ]}
        >
          <Ionicons
            color={color}
            name={isShard ? "flower" : "leaf"}
            size={20}
          />
        </View>
        {isLoading ? (
          <ActivityIndicator color={color} size="small" />
        ) : (
          <Text style={styles.balanceValue}>{value}</Text>
        )}
      </View>
      <Text style={styles.balanceLabel}>{label}</Text>
      <Text style={styles.balanceCopy}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pills: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    minWidth: 52,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  shardPill: {
    backgroundColor: "#FFF5F8",
    borderColor: "#F0CCD8",
  },
  pillValue: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.large,
    borderWidth: 1,
    gap: 14,
    padding: 15,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  cardMark: {
    alignItems: "center",
    backgroundColor: COLORS.sakuraSoft,
    borderRadius: 15,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  cardHeading: {
    flex: 1,
  },
  cardEyebrow: {
    color: COLORS.vermilion,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  cardTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 2,
  },
  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  balanceGrid: {
    flexDirection: "row",
    gap: 10,
  },
  balanceTile: {
    backgroundColor: COLORS.paperStrong,
    borderRadius: RADII.medium,
    flex: 1,
    minWidth: 0,
    padding: 12,
  },
  shardTile: {
    backgroundColor: "#FFF1F5",
  },
  balanceTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceIcon: {
    alignItems: "center",
    backgroundColor: "#FFF8E8",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  shardIcon: {
    backgroundColor: COLORS.sakuraSoft,
  },
  balanceValue: {
    color: COLORS.ink,
    fontSize: 23,
    fontWeight: "900",
  },
  balanceLabel: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 10,
  },
  balanceCopy: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 4,
  },
  guide: {
    borderTopColor: COLORS.line,
    borderTopWidth: 1,
    paddingTop: 13,
  },
  guideTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  guideTitle: {
    color: COLORS.ink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  guideNow: {
    color: COLORS.inkSoft,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 8,
  },
  guideLater: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
  },
});
