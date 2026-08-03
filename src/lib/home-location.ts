import * as SecureStore from "expo-secure-store";

const HOME_LOCATION_KEY = "arukiyo.home-location.v1";

export type HomeLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  createdAt: string;
};

export async function loadHomeLocation(): Promise<HomeLocation | null> {
  const raw = await SecureStore.getItemAsync(HOME_LOCATION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const value = JSON.parse(raw) as HomeLocation;

    if (
      typeof value.latitude !== "number" ||
      typeof value.longitude !== "number" ||
      typeof value.createdAt !== "string"
    ) {
      await SecureStore.deleteItemAsync(HOME_LOCATION_KEY);
      return null;
    }

    return value;
  } catch {
    await SecureStore.deleteItemAsync(HOME_LOCATION_KEY);
    return null;
  }
}

export async function saveHomeLocation(
  value: HomeLocation,
): Promise<void> {
  await SecureStore.setItemAsync(
    HOME_LOCATION_KEY,
    JSON.stringify(value),
  );
}

export async function deleteHomeLocation(): Promise<void> {
  await SecureStore.deleteItemAsync(HOME_LOCATION_KEY);
}

export function formatApproximateCoordinate(value: number): string {
  return value.toFixed(3);
}
