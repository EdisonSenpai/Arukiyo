import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
} from "@maplibre/maplibre-react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { MAP_STYLE_URL } from "@/constants/exploration";
import { COLORS, RADII } from "@/constants/theme";
import type { LngLat } from "@/lib/exploration-grid";
import {
  createRouteFeatureCollection,
  type SessionPoint,
} from "@/lib/session-tracking";

type SessionRoutePreviewProps = {
  points: SessionPoint[];
};

export function SessionRoutePreview({
  points,
}: SessionRoutePreviewProps) {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const route = useMemo(
    () => createRouteFeatureCollection(points),
    [points],
  );
  const viewport = useMemo(
    () => calculateRouteViewport(points),
    [points],
  );

  if (points.length < 2 || !viewport) {
    return null;
  }

  const start = points[0];
  const end = points[points.length - 1];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            {t("feedback.summary.routeEyebrow")}
          </Text>
          <Text style={styles.title}>
            {t("feedback.summary.routeTitle")}
          </Text>
        </View>
        <View style={styles.pointPill}>
          <Ionicons
            color={COLORS.matcha}
            name="git-commit-outline"
            size={15}
          />
          <Text style={styles.pointText}>
            {t("feedback.summary.routePoints", {
              count: points.length,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.mapWrap}>
        <Map
          androidView="texture"
          attribution
          attributionPosition={{ bottom: 6, left: 6 }}
          compass={false}
          logo={false}
          mapStyle={MAP_STYLE_URL}
          onDidFailLoadingMap={() => setFailed(true)}
          onDidFinishLoadingMap={() => {
            setReady(true);
            setFailed(false);
          }}
          scaleBar={false}
          style={styles.map}
        >
          <Camera
            initialViewState={{
              center: viewport.center,
              zoom: viewport.zoom,
            }}
            maxZoom={18}
            minZoom={3}
          />

          <GeoJSONSource
            data={route as never}
            id="arukiyo-summary-route"
          >
            <Layer
              id="arukiyo-summary-route-shadow"
              layout={
                {
                  "line-cap": "round",
                  "line-join": "round",
                } as never
              }
              paint={
                {
                  "line-color": "rgba(23,35,31,0.34)",
                  "line-width": 8,
                } as never
              }
              source="arukiyo-summary-route"
              type="line"
            />
            <Layer
              id="arukiyo-summary-route-line"
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
              source="arukiyo-summary-route"
              type="line"
            />
          </GeoJSONSource>

          <Marker
            anchor="center"
            id="arukiyo-summary-start"
            lngLat={[start.longitude, start.latitude]}
          >
            <RouteMarker icon="play" tone="start" />
          </Marker>

          <Marker
            anchor="center"
            id="arukiyo-summary-end"
            lngLat={[end.longitude, end.latitude]}
          >
            <RouteMarker icon="flag" tone="end" />
          </Marker>
        </Map>

        {!ready && !failed ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={COLORS.vermilion} />
            <Text style={styles.overlayText}>
              {t("feedback.summary.loadingRoute")}
            </Text>
          </View>
        ) : null}

        {failed ? (
          <View style={styles.overlay}>
            <Ionicons
              color={COLORS.vermilion}
              name="cloud-offline-outline"
              size={24}
            />
            <Text style={styles.overlayText}>
              {t("feedback.summary.routeUnavailable")}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function RouteMarker({
  icon,
  tone,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tone: "start" | "end";
}) {
  return (
    <View
      style={[
        styles.marker,
        tone === "end" && styles.markerEnd,
      ]}
    >
      <Ionicons
        color={COLORS.white}
        name={icon}
        size={14}
      />
    </View>
  );
}

function calculateRouteViewport(
  points: SessionPoint[],
): {
  center: LngLat;
  zoom: number;
} | null {
  if (points.length === 0) {
    return null;
  }

  let minLatitude = points[0].latitude;
  let maxLatitude = points[0].latitude;
  let minLongitude = points[0].longitude;
  let maxLongitude = points[0].longitude;

  for (const point of points) {
    minLatitude = Math.min(minLatitude, point.latitude);
    maxLatitude = Math.max(maxLatitude, point.latitude);
    minLongitude = Math.min(
      minLongitude,
      point.longitude,
    );
    maxLongitude = Math.max(
      maxLongitude,
      point.longitude,
    );
  }

  const latitudeSpan = Math.max(
    0.0004,
    maxLatitude - minLatitude,
  );
  const longitudeSpan = Math.max(
    0.0004,
    maxLongitude - minLongitude,
  );
  const largestSpan = Math.max(
    latitudeSpan,
    longitudeSpan,
  );

  const zoom = Math.max(
    3,
    Math.min(
      17,
      Math.log2(360 / largestSpan) - 1.8,
    ),
  );

  return {
    center: [
      (minLongitude + maxLongitude) / 2,
      (minLatitude + maxLatitude) / 2,
    ],
    zoom,
  };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: RADII.large,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  eyebrow: {
    color: COLORS.matcha,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },
  pointPill: {
    alignItems: "center",
    backgroundColor: COLORS.matchaSoft,
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  pointText: {
    color: COLORS.inkSoft,
    fontSize: 8,
    fontWeight: "900",
  },
  mapWrap: {
    backgroundColor: COLORS.mist,
    height: 210,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(247,241,231,0.94)",
    bottom: 0,
    gap: 8,
    justifyContent: "center",
    left: 0,
    paddingHorizontal: 24,
    position: "absolute",
    right: 0,
    top: 0,
  },
  overlayText: {
    color: COLORS.inkSoft,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  marker: {
    alignItems: "center",
    backgroundColor: COLORS.success,
    borderColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 3,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  markerEnd: {
    backgroundColor: COLORS.vermilion,
  },
});
