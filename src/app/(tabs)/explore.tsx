import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { COLORS, RADII, SPACING } from "@/constants/theme";

const HOME_KEY = "arukiyo.home-location.v1";

type HomeLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  createdAt: string;
};

function distanceMeters(from: HomeLocation, latitude: number, longitude: number) {
  const radius = 6_371_000;
  const radians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = radians(latitude - from.latitude);
  const longitudeDelta = radians(longitude - from.longitude);
  const fromLatitude = radians(from.latitude);
  const toLatitude = radians(latitude);

  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * radius * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function formatDistance(value: number | null) {
  if (value === null) return "—";
  return value < 1000 ? `${Math.round(value)} m` : `${(value / 1000).toFixed(2)} km`;
}

export default function ExploreScreen() {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [current, setCurrent] = useState<Location.LocationObject | null>(null);
  const [home, setHome] = useState<HomeLocation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await SecureStore.getItemAsync(HOME_KEY);
        if (raw) setHome(JSON.parse(raw) as HomeLocation);
      } catch {
        setError("Zona Home salvată nu a putut fi citită.");
      }
    })();
  }, []);

  const distanceFromHome = useMemo(() => {
    if (!home || !current) return null;
    return distanceMeters(
      home,
      current.coords.latitude,
      current.coords.longitude,
    );
  }, [current, home]);

  const refreshLocation = async () => {
    setBusy(true);
    setError(null);

    try {
      if (!(await Location.hasServicesEnabledAsync())) {
        setError("GPS-ul este oprit. Activează serviciile de localizare.");
        return;
      }

      let activePermission = permission;
      if (!activePermission?.granted) {
        activePermission = await requestPermission();
      }

      if (!activePermission.granted) {
        setError(
          activePermission.canAskAgain
            ? "Arukiyo are nevoie de permisiunea de locație."
            : "Permisiunea este blocată. Activeaz-o din setările aplicației.",
        );
        return;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });
      setCurrent(result);
    } catch (reason) {
      setError(
        reason instanceof Error ? `Eroare GPS: ${reason.message}` : "Poziția nu a putut fi citită.",
      );
    } finally {
      setBusy(false);
    }
  };

  const saveHome = async () => {
    if (!current) return;

    setBusy(true);
    setError(null);

    try {
      const nextHome: HomeLocation = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy,
        createdAt: new Date().toISOString(),
      };

      await SecureStore.setItemAsync(HOME_KEY, JSON.stringify(nextHome));
      setHome(nextHome);
    } catch {
      setError("Zona Home nu a putut fi salvată securizat.");
    } finally {
      setBusy(false);
    }
  };

  const deleteHome = async () => {
    setBusy(true);
    try {
      await SecureStore.deleteItemAsync(HOME_KEY);
      setHome(null);
    } catch {
      setError("Zona Home nu a putut fi ștearsă.");
    } finally {
      setBusy(false);
    }
  };

  const confirmHome = () =>
    Alert.alert(
      home ? "Actualizezi zona Home?" : "Setezi zona Home?",
      "Coordonatele exacte vor fi salvate criptat numai pe telefon.",
      [
        { text: "Renunță", style: "cancel" },
        { text: home ? "Actualizează" : "Setează Home", onPress: () => void saveHome() },
      ],
    );

  const confirmDelete = () =>
    Alert.alert("Ștergi zona Home?", "Punctul privat de pornire va fi eliminat.", [
      { text: "Păstrează", style: "cancel" },
      { text: "Șterge", style: "destructive", onPress: () => void deleteHome() },
    ]);

  const granted = permission?.granted === true;
  const accuracy = current?.coords.accuracy;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="Stage 2A"
          title="Explorează"
          subtitle="Poziția reală și punctul tău privat de pornire."
          trailing={
            <View style={[styles.gpsPill, granted && styles.gpsPillActive]}>
              <View style={[styles.gpsDot, granted && styles.gpsDotActive]} />
              <Text style={styles.gpsText}>{granted ? "GPS permis" : "GPS inactiv"}</Text>
            </View>
          }
        />

        <LinearGradient colors={[COLORS.matchaSoft, "#F0E7D7"]} style={styles.map}>
          <View style={[styles.fog, styles.fogOne]} />
          <View style={[styles.fog, styles.fogTwo]} />
          <View style={[styles.path, styles.pathOne]} />
          <View style={[styles.path, styles.pathTwo]} />

          {home ? (
            <View style={styles.homeMarker}>
              <Ionicons color={COLORS.white} name="home" size={23} />
            </View>
          ) : null}

          {current ? (
            <>
              <View style={styles.currentPulse} />
              <View style={styles.currentMarker}>
                <Ionicons color={COLORS.white} name="navigate" size={20} />
              </View>
            </>
          ) : null}

          <View style={styles.mapBadge}>
            <Ionicons color={COLORS.matcha} name="shield-checkmark-outline" size={18} />
            <Text style={styles.mapBadgeText}>Coordonate mascate</Text>
          </View>

          <View style={styles.mapStatus}>
            <Text style={styles.mapStatusEyebrow}>POZIȚIA CURENTĂ</Text>
            <Text style={styles.mapStatusTitle}>
              {current
                ? `${current.coords.latitude.toFixed(3)} · ${current.coords.longitude.toFixed(3)}`
                : "Încă necunoscută"}
            </Text>
            <Text style={styles.mapStatusCopy}>
              {current
                ? `Precizie raportată: ${accuracy == null ? "necunoscută" : `±${Math.round(accuracy)} m`}`
                : "Apasă butonul de mai jos pentru prima citire GPS."}
            </Text>
          </View>
        </LinearGradient>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons color={COLORS.vermilion} name="alert-circle" size={22} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          disabled={busy}
          onPress={() => void refreshLocation()}
          style={({ pressed }) => [styles.primaryButton, (pressed || busy) && styles.pressed]}
        >
          {busy ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Ionicons color={COLORS.white} name={granted ? "locate" : "location"} size={21} />
          )}
          <Text style={styles.primaryButtonText}>
            {current ? "Actualizează poziția" : granted ? "Citește poziția" : "Permite locația și continuă"}
          </Text>
        </Pressable>

        {!granted && permission?.canAskAgain === false ? (
          <Pressable onPress={() => void Linking.openSettings()} style={styles.secondaryButton}>
            <Ionicons color={COLORS.ink} name="settings-outline" size={20} />
            <Text style={styles.secondaryButtonText}>Deschide setările aplicației</Text>
          </Pressable>
        ) : null}

        <View style={styles.homeCard}>
          <View style={styles.homeIcon}>
            <Ionicons color={COLORS.vermilion} name={home ? "home" : "home-outline"} size={25} />
          </View>
          <View style={styles.homeCopy}>
            <Text style={styles.homeTitle}>
              {home ? "Zona Home este configurată" : "Zona Home nu este configurată"}
            </Text>
            <Text style={styles.homeDescription}>
              {home
                ? `Zonă aproximativă: ${home.latitude.toFixed(3)} · ${home.longitude.toFixed(3)}`
                : "Citește poziția, apoi setează punctul privat din care începe explorarea."}
            </Text>
            {home ? <Text style={styles.homeMeta}>Distanță curentă: {formatDistance(distanceFromHome)}</Text> : null}
          </View>
        </View>

        {current ? (
          <Pressable disabled={busy} onPress={confirmHome} style={styles.homeButton}>
            <Ionicons color={COLORS.ink} name={home ? "refresh" : "flag"} size={20} />
            <Text style={styles.homeButtonText}>
              {home ? "Mută Home la poziția actuală" : "Setează poziția actuală ca Home"}
            </Text>
          </Pressable>
        ) : null}

        {home ? (
          <Pressable disabled={busy} onPress={confirmDelete} style={styles.removeButton}>
            <Ionicons color={COLORS.vermilion} name="trash-outline" size={19} />
            <Text style={styles.removeButtonText}>Șterge zona Home de pe telefon</Text>
          </Pressable>
        ) : null}

        <View style={styles.statsRow}>
          <Stat label="Permisiune" value={granted ? "Activă" : "Inactivă"} />
          <Stat label="Precizie" value={accuracy == null ? "—" : `±${Math.round(accuracy)} m`} />
          <Stat label="Față de Home" value={formatDistance(distanceFromHome)} />
        </View>

        <View style={styles.privacyCard}>
          <Ionicons color={COLORS.matcha} name="lock-closed" size={24} />
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>Home rămâne privat</Text>
            <Text style={styles.privacyDescription}>
              Coordonatele exacte sunt criptate în Secure Store. Nu sunt trimise unui server în acest stage.
            </Text>
          </View>
        </View>

        <Text style={styles.notice}>
          În Stage 2B adăugăm harta reală, celulele explorabile și prima zonă fog of war.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text numberOfLines={1} style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.paper, flex: 1 },
  content: { gap: SPACING.large, paddingBottom: 36, paddingHorizontal: SPACING.medium, paddingTop: 12 },
  gpsPill: { alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.line, borderRadius: RADII.pill, borderWidth: 1, flexDirection: "row", gap: 7, paddingHorizontal: 10, paddingVertical: 8 },
  gpsPillActive: { backgroundColor: COLORS.matchaSoft, borderColor: "#BFD1C0" },
  gpsDot: { backgroundColor: COLORS.muted, borderRadius: 4, height: 8, width: 8 },
  gpsDotActive: { backgroundColor: COLORS.success },
  gpsText: { color: COLORS.inkSoft, fontSize: 10, fontWeight: "900" },
  map: { borderColor: COLORS.line, borderRadius: RADII.large, borderWidth: 1, height: 390, overflow: "hidden", position: "relative" },
  fog: { backgroundColor: "rgba(255,255,255,0.72)", borderRadius: 180, position: "absolute" },
  fogOne: { height: 260, left: -70, top: -55, width: 260 },
  fogTwo: { bottom: -80, height: 280, right: -65, width: 280 },
  path: { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: RADII.pill, position: "absolute" },
  pathOne: { height: 24, left: 45, top: 170, transform: [{ rotate: "18deg" }], width: 310 },
  pathTwo: { height: 20, left: 150, top: 105, transform: [{ rotate: "102deg" }], width: 245 },
  homeMarker: { alignItems: "center", backgroundColor: COLORS.vermilion, borderColor: COLORS.white, borderRadius: 29, borderWidth: 4, height: 58, justifyContent: "center", left: 58, position: "absolute", top: 116, width: 58 },
  currentPulse: { backgroundColor: "rgba(60,134,99,0.18)", borderRadius: 52, height: 104, position: "absolute", right: 72, top: 116, width: 104 },
  currentMarker: { alignItems: "center", backgroundColor: COLORS.success, borderColor: COLORS.white, borderRadius: 25, borderWidth: 4, height: 50, justifyContent: "center", position: "absolute", right: 99, top: 143, width: 50 },
  mapBadge: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.94)", borderRadius: RADII.pill, flexDirection: "row", gap: 7, left: 14, paddingHorizontal: 11, paddingVertical: 8, position: "absolute", top: 14 },
  mapBadgeText: { color: COLORS.inkSoft, fontSize: 10, fontWeight: "800" },
  mapStatus: { backgroundColor: "rgba(23,35,31,0.92)", borderRadius: RADII.medium, bottom: 15, left: 15, padding: 14, position: "absolute", right: 15 },
  mapStatusEyebrow: { color: COLORS.sakuraSoft, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  mapStatusTitle: { color: COLORS.white, fontSize: 20, fontWeight: "900", marginTop: 4 },
  mapStatusCopy: { color: "rgba(255,255,255,0.64)", fontSize: 11, marginTop: 4 },
  errorCard: { alignItems: "flex-start", backgroundColor: "#FBE9E6", borderColor: "#EDC0B9", borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: 10, padding: 14 },
  errorText: { color: COLORS.inkSoft, flex: 1, fontSize: 12, lineHeight: 18 },
  primaryButton: { alignItems: "center", backgroundColor: COLORS.ink, borderRadius: RADII.medium, flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 54, paddingHorizontal: 16 },
  primaryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: "900" },
  secondaryButton: { alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.line, borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: 9, justifyContent: "center", padding: 14 },
  secondaryButtonText: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  homeCard: { alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.line, borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: 12, padding: 15 },
  homeIcon: { alignItems: "center", backgroundColor: COLORS.sakuraSoft, borderRadius: 15, height: 50, justifyContent: "center", width: 50 },
  homeCopy: { flex: 1 },
  homeTitle: { color: COLORS.ink, fontSize: 15, fontWeight: "900" },
  homeDescription: { color: COLORS.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  homeMeta: { color: COLORS.success, fontSize: 11, fontWeight: "900", marginTop: 5 },
  homeButton: { alignItems: "center", backgroundColor: COLORS.sakuraSoft, borderColor: "#E7B9C5", borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: 9, justifyContent: "center", padding: 14 },
  homeButtonText: { color: COLORS.ink, fontSize: 13, fontWeight: "900" },
  removeButton: { alignItems: "center", backgroundColor: COLORS.white, borderColor: "#EDC0B9", borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", padding: 13 },
  removeButtonText: { color: COLORS.vermilion, fontSize: 12, fontWeight: "900" },
  statsRow: { flexDirection: "row", gap: 9 },
  stat: { alignItems: "center", backgroundColor: COLORS.white, borderColor: COLORS.line, borderRadius: RADII.medium, borderWidth: 1, flex: 1, paddingHorizontal: 5, paddingVertical: 14 },
  statValue: { color: COLORS.ink, fontSize: 13, fontWeight: "900" },
  statLabel: { color: COLORS.muted, fontSize: 9, marginTop: 5, textAlign: "center" },
  privacyCard: { alignItems: "flex-start", backgroundColor: COLORS.matchaSoft, borderColor: "#BFD1C0", borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: 12, padding: 15 },
  privacyCopy: { flex: 1 },
  privacyTitle: { color: COLORS.ink, fontSize: 14, fontWeight: "900" },
  privacyDescription: { color: COLORS.inkSoft, fontSize: 11, lineHeight: 17, marginTop: 4 },
  pressed: { opacity: 0.72 },
  notice: { color: COLORS.muted, fontSize: 11, lineHeight: 17, textAlign: "center" },
});
