export const landmarkEn = {
  engine: {
    eyebrow: "STAGE 4C1 · LANDMARK ENGINE",
    title: "Nearby landmarks",
    subtitle:
      "Arukiyo scans nearby OpenStreetMap data and keeps only places that look culturally, historically, or locally important.",
    noLocation:
      "Read your GPS location before scanning nearby landmarks.",
    scanning: "Scanning nearby map data…",
    summary:
      "{{raw}} raw candidates · {{cached}} cached · {{eligible}} eligible",
    nearest: "Nearest eligible",
    none:
      "No eligible landmark is cached nearby yet. This can be normal in residential areas.",
    refresh: "Scan again",
    cache: "Cached",
    network: "Live scan",
    score: "score {{score}}",
    distance: "{{distance}} away",
    footnote:
      "4C1 only identifies and caches candidates. Physical unlocks and discovery cards arrive in 4C2.",
    networkFallback:
      "Network refresh failed, so Arukiyo is showing cached landmark data.",
  },
  category: {
    historic: "Historic",
    museum: "Museum",
    culture: "Culture",
    civic: "Civic",
    education: "Education",
    religious: "Religious",
    attraction: "Attraction",
    landmark: "Landmark",
  },
  tier: {
    local: "Local",
    notable: "Notable",
    major: "Major",
    iconic: "Iconic",
  },
} as const;

export const landmarkRo = {
  engine: {
    eyebrow: "STAGE 4C1 · MOTOR LANDMARK",
    title: "Landmark-uri din apropiere",
    subtitle:
      "Arukiyo scanează date OpenStreetMap din apropiere și păstrează doar locurile care par importante cultural, istoric sau local.",
    noLocation:
      "Citește poziția GPS înainte de scanarea landmark-urilor.",
    scanning: "Se scanează datele hărții din apropiere…",
    summary:
      "{{raw}} candidate brute · {{cached}} în cache · {{eligible}} eligibile",
    nearest: "Cel mai apropiat eligibil",
    none:
      "Nu există încă niciun landmark eligibil în cache în apropiere. Este normal în unele zone rezidențiale.",
    refresh: "Scanează din nou",
    cache: "Cache local",
    network: "Scanare live",
    score: "scor {{score}}",
    distance: "la {{distance}}",
    footnote:
      "4C1 doar identifică și salvează candidații. Deblocarea fizică și cardurile de descoperire vin în 4C2.",
    networkFallback:
      "Actualizarea din rețea a eșuat, deci Arukiyo afișează datele landmark salvate local.",
  },
  category: {
    historic: "Istoric",
    museum: "Muzeu",
    culture: "Cultural",
    civic: "Civic",
    education: "Educație",
    religious: "Religios",
    attraction: "Atracție",
    landmark: "Landmark",
  },
  tier: {
    local: "Local",
    notable: "Notabil",
    major: "Major",
    iconic: "Emblematic",
  },
} as const;

export const landmarkJa = {
  engine: {
    eyebrow: "STAGE 4C1 · ランドマークエンジン",
    title: "近くのランドマーク",
    subtitle:
      "Arukiyoは周辺のOpenStreetMapデータを調べ、文化・歴史・地域的に重要な場所を候補として保存します。",
    noLocation:
      "近くのランドマークを検索する前にGPS位置を取得してください。",
    scanning: "周辺の地図データを検索しています…",
    summary:
      "候補 {{raw}} · 保存 {{cached}} · 対象 {{eligible}}",
    nearest: "最も近い対象",
    none:
      "近くに対象ランドマークがまだ保存されていません。住宅地では正常な場合があります。",
    refresh: "もう一度検索",
    cache: "ローカルキャッシュ",
    network: "ライブ検索",
    score: "スコア {{score}}",
    distance: "{{distance}}先",
    footnote:
      "4C1では候補の識別と保存のみを行います。実際の発見解除とカードは4C2で追加します。",
    networkFallback:
      "ネットワーク更新に失敗したため、保存済みのランドマークデータを表示しています。",
  },
  category: {
    historic: "歴史",
    museum: "博物館",
    culture: "文化",
    civic: "公共",
    education: "教育",
    religious: "宗教",
    attraction: "観光",
    landmark: "ランドマーク",
  },
  tier: {
    local: "ローカル",
    notable: "注目",
    major: "主要",
    iconic: "象徴的",
  },
} as const;
