import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
} from "@maplibre/maplibre-react-native";
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
import { useTranslation } from "react-i18next";

import {
  BUCHAREST_CENTER,
  MAP_STYLE_FALLBACK_URL,
  MAP_STYLE_URL,
} from "@/constants/exploration";
import { COLORS, RADII } from "@/constants/theme";
import {
  applyHomeZoneState,
  type CellFeatureCollection,
  createFogMaskFeatureCollection,
  createPointFeatureCollection,
  locationToCell,
  type LngLat,
} from "@/lib/exploration-grid";
import type { HomeLocation } from "@/lib/home-location";
import {
  createRouteFeatureCollection,
  type SessionPoint,
} from "@/lib/session-tracking";

type ExplorationMapProps = {
  cellFeatures: CellFeatureCollection;
  currentLocation: Location.LocationObject | null;
  homeLocation: HomeLocation | null;
  recenterToken: number;
  routePoints: SessionPoint[];
};

export function ExplorationMap({
  cellFeatures,
  currentLocation,
  homeLocation,
  recenterToken,
  routePoints,
}: ExplorationMapProps) {
  const { t } = useTranslation();
  const cameraRef = useRef<any>(null);
  const [activeStyleUrl, setActiveStyleUrl] =
    useState(MAP_STYLE_URL);
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

  const homeCell = useMemo(
    () =>
      homeLocation
        ? locationToCell(
            homeLocation.latitude,
            homeLocation.longitude,
          )
        : null,
    [homeLocation],
  );

  const displayCellFeatures = useMemo(
    () => applyHomeZoneState(cellFeatures, homeCell),
    [cellFeatures, homeCell],
  );

  const routeFeatures = useMemo(
    () => createRouteFeatureCollection(routePoints),
    [routePoints],
  );

  const fogMaskFeatures = useMemo(
    () =>
      createFogMaskFeatureCollection(
        displayCellFeatures,
      ),
    [displayCellFeatures],
  );

  useEffect(() => {
    if (!isMapReady) {
      return;
    }

    cameraRef.current?.easeTo({
      center: target,
      duration: 850,
      zoom: currentLocation || homeLocation ? 16.6 : 12,
    });
  }, [
    currentLocation,
    homeLocation,
    isMapReady,
    recenterToken,
    target,
  ]);

  const handleMapFailure = () => {
    if (activeStyleUrl === MAP_STYLE_URL) {
      setIsMapReady(false);
      setMapFailed(false);
      setActiveStyleUrl(MAP_STYLE_FALLBACK_URL);
      return;
    }

    setMapFailed(true);
  };

  return (
    <View style={styles.container}>
      <Map
        key={activeStyleUrl}
        androidView="texture"
        attribution
        attributionPosition={{ bottom: 8, left: 8 }}
        compass
        compassPosition={{ top: 12, right: 12 }}
        logo={false}
        mapStyle={activeStyleUrl}
        onDidFailLoadingMap={handleMapFailure}
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
            zoom: currentLocation || homeLocation ? 16.6 : 12,
          }}
          maxZoom={20}
          minZoom={4}
          ref={cameraRef}
        />

        {displayCellFeatures.features.length > 0 ? (
          <GeoJSONSource
            data={fogMaskFeatures as never}
            id="arukiyo-global-fog-mask"
          >
            <Layer
              id="arukiyo-global-fog-fill"
              paint={
                {
                  "fill-color": COLORS.ink,
                  "fill-opacity": 1,
                } as never
              }
              source="arukiyo-global-fog-mask"
              type="fill"
            />
          </GeoJSONSource>
        ) : null}

        {displayCellFeatures.features.length > 0 ? (
          <GeoJSONSource
            data={displayCellFeatures as never}
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
                    "home",
                    COLORS.matcha,
                    "current",
                    COLORS.gold,
                    COLORS.ink,
                  ],
                  "fill-opacity": [
                    "match",
                    ["get", "state"],
                    "explored",
                    0.025,
                    "home",
                    0.16,
                    "current",
                    0.18,
                    0.1,
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
                    "home",
                    COLORS.matcha,
                    "current",
                    COLORS.gold,
                    "rgba(255,255,255,0.28)",
                  ],
                  "line-opacity": [
                    "match",
                    ["get", "state"],
                    "explored",
                    0.72,
                    "home",
                    0.78,
                    "current",
                    1,
                    0.24,
                  ],
                  "line-width": [
                    "match",
                    ["get", "state"],
                    "current",
                    2.8,
                    "explored",
                    1.1,
                    "home",
                    1,
                    0.65,
                  ],
                } as never
              }
              source="arukiyo-exploration-grid"
              type="line"
            />
          </GeoJSONSource>
        ) : null}

        {routeFeatures.features.length > 0 ? (
          <GeoJSONSource
            data={routeFeatures as never}
            id="arukiyo-session-route"
          >
            <Layer
              id="arukiyo-session-route-shadow"
              layout={
                {
                  "line-cap": "round",
                  "line-join": "round",
                } as never
              }
              paint={
                {
                  "line-color": "rgba(23,35,31,0.42)",
                  "line-width": 9,
                } as never
              }
              source="arukiyo-session-route"
              type="line"
            />
            <Layer
              id="arukiyo-session-route-line"
              layout={
                {
                  "line-cap": "round",
                  "line-join": "round",
                } as never
              }
              paint={
                {
                  "line-color": COLORS.vermilion,
                  "line-width": 5,
                } as never
              }
              source="arukiyo-session-route"
              type="line"
            />
          </GeoJSONSource>
        ) : null}

        {homeLocation ? (
          <Marker
            anchor="bottom"
            id="arukiyo-home-marker"
            lngLat={[
              homeLocation.longitude,
              homeLocation.latitude,
            ]}
          >
            <View style={styles.homeMarkerWrap}>
              <View style={styles.homeLabel}>
                <Text style={styles.homeLabelText}>
                  {t("map.home")}
                </Text>
              </View>
              <View style={styles.homeMarkerBubble}>
                <Ionicons
                  color={COLORS.white}
                  name="home"
                  size={22}
                />
              </View>
              <View style={styles.homeMarkerTip} />
            </View>
          </Marker>
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
            {t("map.loading")}
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
            {t("map.failureTitle")}
          </Text>
          <Text style={styles.failureText}>
            {t("map.failureCopy")}
          </Text>
          <Pressable
            onPress={() => {
              setMapFailed(false);
              setIsMapReady(false);
              setActiveStyleUrl(MAP_STYLE_URL);
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              color={COLORS.white}
              name="refresh"
              size={18}
            />
            <Text style={styles.retryText}>
              {t("explore.reset")}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.legend}>
        <LegendDot color={COLORS.ink} label={t("map.fog")} />
        {homeLocation ? (
          <LegendDot
            color={COLORS.matcha}
            label={t("explore.localHomeArea")}
          />
        ) : null}
        <LegendDot
          color={COLORS.sakura}
          label={t("map.discovered")}
        />
        <LegendDot
          color={COLORS.gold}
          label={t("map.current")}
        />
        {routePoints.length > 1 ? (
          <LegendDot
            color={COLORS.vermilion}
            label={t("session.route")}
          />
        ) : null}
      </View>

      <Pressable
        accessibilityLabel={t("map.recenter")}
        onPress={() => {
          cameraRef.current?.easeTo({
            center: target,
            duration: 700,
            zoom: 16.6,
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
  map: { flex: 1 },
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
  retryButton: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.medium,
    flexDirection: "row",
    gap: 7,
    marginTop: 5,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
  },
  legend: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: RADII.pill,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    left: 10,
    maxWidth: "78%",
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
  homeMarkerWrap: {
    alignItems: "center",
    minWidth: 60,
  },
  homeLabel: {
    backgroundColor: COLORS.ink,
    borderRadius: RADII.pill,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  homeLabelText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  homeMarkerBubble: {
    alignItems: "center",
    backgroundColor: COLORS.vermilion,
    borderColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 3,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  homeMarkerTip: {
    borderLeftColor: "transparent",
    borderLeftWidth: 7,
    borderRightColor: "transparent",
    borderRightWidth: 7,
    borderTopColor: COLORS.vermilion,
    borderTopWidth: 10,
    marginTop: -2,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});
