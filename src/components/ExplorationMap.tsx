import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
} from "@maplibre/maplibre-react-native";
import { Ionicons } from "@expo/vector-icons";
import type * as Location from "expo-location";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  BUCHAREST_CENTER,
  MAP_STYLE_URL,
} from "@/constants/exploration";
import { COLORS, RADII } from "@/constants/theme";
import {
  CellFeatureCollection,
  createPointFeatureCollection,
  LngLat,
} from "@/lib/exploration-grid";
import type { HomeLocation } from "@/lib/home-location";

type ExplorationMapProps = {
  cellFeatures: CellFeatureCollection;
  currentLocation: Location.LocationObject | null;
  homeLocation: HomeLocation | null;
  recenterToken: number;
};

export function ExplorationMap({
  cellFeatures,
  currentLocation,
  homeLocation,
  recenterToken,
}: ExplorationMapProps) {
  const cameraRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  const target = useMemo<LngLat>(() => {
    if (currentLocation) {
      return [
        currentLocation.coords.longitude,
        currentLocation.coords.latitude,
      ];
    }

    if (homeLocation) {
      return [
        homeLocation.longitude,
        homeLocation.latitude,
      ];
    }

    return BUCHAREST_CENTER;
  }, [currentLocation, homeLocation]);

  const currentPoint = useMemo(
    () =>
      currentLocation
        ? createPointFeatureCollection(
            currentLocation.coords.longitude,
            currentLocation.coords.latitude,
            { kind: "current" },
          )
        : null,
    [currentLocation],
  );

  const homePoint = useMemo(
    () =>
      homeLocation
        ? createPointFeatureCollection(
            homeLocation.longitude,
            homeLocation.latitude,
            { kind: "home" },
          )
        : null,
    [homeLocation],
  );

  useEffect(() => {
    if (!isMapReady) {
      return;
    }

    cameraRef.current?.easeTo({
      center: target,
      duration: 850,
      zoom: currentLocation || homeLocation ? 16.3 : 12,
    });
  }, [
    currentLocation,
    homeLocation,
    isMapReady,
    recenterToken,
    target,
  ]);

  return (
    <View style={styles.container}>
      <Map
        androidView="texture"
        attribution
        attributionPosition={{ bottom: 8, left: 8 }}
        compass
        compassPosition={{ top: 12, right: 12 }}
        logo={false}
        mapStyle={MAP_STYLE_URL}
        onDidFailLoadingMap={() => {
          setMapFailed(true);
        }}
        onDidFinishLoadingMap={() => {
          setIsMapReady(true);
          setMapFailed(false);
        }}
        preferredFramesPerSecond={60}
        scaleBar={false}
        style={styles.map}
      >
        <Camera
          initialViewState={{
            center: target,
            zoom: currentLocation || homeLocation ? 16.3 : 12,
          }}
          maxZoom={19}
          minZoom={4}
          ref={cameraRef}
        />

        {cellFeatures.features.length > 0 ? (
          <GeoJSONSource
            data={cellFeatures as never}
            id="arukiyo-exploration-grid"
          >
            <Layer
              id="arukiyo-cell-fill"
              paint={
                {
                  "fill-color": [
                    "match",
                    ["get", "state"],
                    "explored",
                    COLORS.sakura,
                    "current",
                    COLORS.gold,
                    COLORS.ink,
                  ],
                  "fill-opacity": [
                    "match",
                    ["get", "state"],
                    "explored",
                    0.12,
                    "current",
                    0.34,
                    0.64,
                  ],
                } as never
              }
              source="arukiyo-exploration-grid"
              type="fill"
            />

            <Layer
              id="arukiyo-cell-outline"
              paint={
                {
                  "line-color": [
                    "match",
                    ["get", "state"],
                    "explored",
                    COLORS.sakura,
                    "current",
                    COLORS.gold,
                    "rgba(255,255,255,0.42)",
                  ],
                  "line-opacity": 0.95,
                  "line-width": [
                    "match",
                    ["get", "state"],
                    "current",
                    3,
                    1.25,
                  ],
                } as never
              }
              source="arukiyo-exploration-grid"
              type="line"
            />
          </GeoJSONSource>
        ) : null}

        {homePoint ? (
          <GeoJSONSource
            data={homePoint as never}
            id="arukiyo-home-point"
          >
            <Layer
              id="arukiyo-home-halo"
              paint={
                {
                  "circle-color": COLORS.vermilion,
                  "circle-opacity": 0.2,
                  "circle-radius": 18,
                } as never
              }
              source="arukiyo-home-point"
              type="circle"
            />
            <Layer
              id="arukiyo-home-dot"
              paint={
                {
                  "circle-color": COLORS.vermilion,
                  "circle-radius": 7,
                  "circle-stroke-color": COLORS.white,
                  "circle-stroke-width": 3,
                } as never
              }
              source="arukiyo-home-point"
              type="circle"
            />
          </GeoJSONSource>
        ) : null}

        {currentPoint ? (
          <GeoJSONSource
            data={currentPoint as never}
            id="arukiyo-current-point"
          >
            <Layer
              id="arukiyo-current-halo"
              paint={
                {
                  "circle-color": COLORS.success,
                  "circle-opacity": 0.2,
                  "circle-radius": 22,
                } as never
              }
              source="arukiyo-current-point"
              type="circle"
            />
            <Layer
              id="arukiyo-current-dot"
              paint={
                {
                  "circle-color": COLORS.success,
                  "circle-radius": 8,
                  "circle-stroke-color": COLORS.white,
                  "circle-stroke-width": 3,
                } as never
              }
              source="arukiyo-current-point"
              type="circle"
            />
          </GeoJSONSource>
        ) : null}
      </Map>

      {!isMapReady && !mapFailed ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={COLORS.vermilion} />
          <Text style={styles.loadingText}>
            Se încarcă lumea Arukiyo…
          </Text>
        </View>
      ) : null}

      {mapFailed ? (
        <View style={styles.loadingOverlay}>
          <Ionicons
            color={COLORS.vermilion}
            name="cloud-offline-outline"
            size={30}
          />
          <Text style={styles.failureTitle}>
            Harta nu s-a încărcat
          </Text>
          <Text style={styles.failureText}>
            Verifică internetul. În Stage 2B folosim tile-urile demo
            MapLibre.
          </Text>
        </View>
      ) : null}

      <View style={styles.legend}>
        <LegendDot color={COLORS.ink} label="Ceață" />
        <LegendDot color={COLORS.sakura} label="Descoperit" />
        <LegendDot color={COLORS.gold} label="Curent" />
      </View>

      <Pressable
        accessibilityLabel="Recentrează harta"
        onPress={() => {
          cameraRef.current?.easeTo({
            center: target,
            duration: 700,
            zoom: 16.3,
          });
        }}
        style={({ pressed }) => [
          styles.recenterButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons color={COLORS.ink} name="locate" size={23} />
      </Pressable>
    </View>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.mist,
    borderColor: COLORS.line,
    borderRadius: RADII.large,
    borderWidth: 1,
    flex: 1,
    minHeight: 330,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(247,241,231,0.94)",
    bottom: 0,
    gap: 9,
    justifyContent: "center",
    left: 0,
    paddingHorizontal: 32,
    position: "absolute",
    right: 0,
    top: 0,
  },
  loadingText: {
    color: COLORS.inkSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  failureTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  failureText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  legend: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: "absolute",
    top: 10,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  legendDot: {
    borderRadius: 5,
    height: 9,
    width: 9,
  },
  legendText: {
    color: COLORS.inkSoft,
    fontSize: 9,
    fontWeight: "800",
  },
  recenterButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: COLORS.line,
    borderRadius: 24,
    borderWidth: 1,
    bottom: 18,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    right: 14,
    width: 48,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});
