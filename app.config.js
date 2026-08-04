const VALID_VARIANTS = new Set([
  "development",
  "preview",
  "production",
]);

function resolveVariant() {
  const requested =
    process.env.APP_VARIANT ?? "development";

  return VALID_VARIANTS.has(requested)
    ? requested
    : "development";
}

function getAppIdentity(variant) {
  switch (variant) {
    case "preview":
      return {
        name: "Arukiyo Preview",
        packageName:
          "com.eduarddonea.arukiyo.preview",
        scheme: "arukiyo-preview",
      };

    case "production":
      return {
        name: "Arukiyo",
        packageName:
          "com.eduarddonea.arukiyo",
        scheme: "arukiyo",
      };

    case "development":
    default:
      return {
        name: "Arukiyo Dev",
        packageName:
          "com.eduarddonea.arukiyo.dev",
        scheme: "arukiyo-dev",
      };
  }
}

function pluginName(plugin) {
  return Array.isArray(plugin)
    ? plugin[0]
    : plugin;
}

module.exports = ({ config }) => {
  const variant = resolveVariant();
  const identity = getAppIdentity(variant);
  const isDevelopment =
    variant === "development";

  const plugins = (config.plugins ?? []).filter(
    (plugin) =>
      pluginName(plugin) !== "expo-dev-client",
  );

  return {
    ...config,
    name: identity.name,
    scheme: identity.scheme,
    android: {
      ...config.android,
      package: identity.packageName,
    },
    ios: {
      ...config.ios,
      bundleIdentifier: identity.packageName,
    },
    plugins: [
      ...plugins,
      [
        "expo-dev-client",
        {
          addGeneratedScheme: isDevelopment,
        },
      ],
    ],
    extra: {
      ...config.extra,
      appVariant: variant,
    },
  };
};
