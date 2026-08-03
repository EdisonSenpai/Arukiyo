import { getLocales } from "expo-localization";
import { useSQLiteContext } from "expo-sqlite";
import {
  AppState,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nextProvider } from "react-i18next";

import { COLORS } from "@/constants/theme";
import {
  i18n,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from "@/i18n";
import {
  getAppSetting,
  setAppSetting,
} from "@/lib/exploration-db";

const LANGUAGE_SETTING_KEY = "language_mode";

export type LanguageMode = SupportedLanguage | "device";

type LanguageContextValue = {
  isReady: boolean;
  languageMode: LanguageMode;
  resolvedLanguage: SupportedLanguage;
  setLanguageMode: (mode: LanguageMode) => Promise<void>;
};

const LanguageContext =
  createContext<LanguageContextValue | null>(null);

function isSupportedLanguage(
  value: string | null | undefined,
): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(
    value as SupportedLanguage,
  );
}

function isLanguageMode(
  value: string | null | undefined,
): value is LanguageMode {
  return value === "device" || isSupportedLanguage(value);
}

function resolveDeviceLanguage(): SupportedLanguage {
  const languageCode =
    getLocales()[0]?.languageCode?.toLowerCase();

  return isSupportedLanguage(languageCode)
    ? languageCode
    : "en";
}

function resolveLanguage(
  mode: LanguageMode,
): SupportedLanguage {
  return mode === "device"
    ? resolveDeviceLanguage()
    : mode;
}

export function LanguageProvider({
  children,
}: PropsWithChildren) {
  const database = useSQLiteContext();
  const [languageMode, setLanguageModeState] =
    useState<LanguageMode>("en");
  const [resolvedLanguage, setResolvedLanguage] =
    useState<SupportedLanguage>("en");
  const [isReady, setIsReady] = useState(false);

  const applyLanguage = useCallback(
    async (mode: LanguageMode) => {
      const nextLanguage = resolveLanguage(mode);
      await i18n.changeLanguage(nextLanguage);
      setResolvedLanguage(nextLanguage);
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    async function hydrateLanguage() {
      const storedMode = await getAppSetting(
        database,
        LANGUAGE_SETTING_KEY,
      );
      const nextMode: LanguageMode = isLanguageMode(storedMode)
        ? storedMode
        : "en";

      if (!mounted) {
        return;
      }

      setLanguageModeState(nextMode);
      await applyLanguage(nextMode);

      if (mounted) {
        setIsReady(true);
      }
    }

    void hydrateLanguage();

    return () => {
      mounted = false;
    };
  }, [applyLanguage, database]);

  useEffect(() => {
    if (languageMode !== "device") {
      return;
    }

    const subscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          void applyLanguage("device");
        }
      },
    );

    return () => subscription.remove();
  }, [applyLanguage, languageMode]);

  const setLanguageMode = useCallback(
    async (mode: LanguageMode) => {
      setLanguageModeState(mode);
      await setAppSetting(
        database,
        LANGUAGE_SETTING_KEY,
        mode,
      );
      await applyLanguage(mode);
    },
    [applyLanguage, database],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      isReady,
      languageMode,
      resolvedLanguage,
      setLanguageMode,
    }),
    [
      isReady,
      languageMode,
      resolvedLanguage,
      setLanguageMode,
    ],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>
        {isReady ? children : <LanguageBootScreen />}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider",
    );
  }

  return value;
}

function LanguageBootScreen() {
  return (
    <View style={styles.boot}>
      <Text style={styles.brand}>ARUKIYO</Text>
      <ActivityIndicator color={COLORS.vermilion} />
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    alignItems: "center",
    backgroundColor: COLORS.paper,
    flex: 1,
    gap: 18,
    justifyContent: "center",
  },
  brand: {
    color: COLORS.ink,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 4,
  },
});
