export const landmarkEn = {
  engine: {
    eyebrow: "LANDMARK DISCOVERY",
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
      "Landmarks appear as exploration targets on the map. Start a journey and approach a pin to discover it.",
    networkFallback:
      "Network refresh failed, so Arukiyo is showing cached landmark data.",
  },
  discovery: {
    eyebrow: "NEW LANDMARK DISCOVERED",
    saved:
      "This landmark is now part of your local collection. Journal details and historical sources arrive in Stage 4C3.",
    continue: "Continue exploring",
    undiscoveredPin: "Undiscovered landmark",
    unlockedPin: "Discovered landmark",
  },

  journal: {
    subtitle:
      "Your personal travel book now keeps every landmark you physically discover.",
    collectionEyebrow: "LANDMARK COLLECTION",
    discoveredCount: "{{count}} landmarks discovered",
    iconicCount: "{{count}} iconic discoveries",
    landmarks: "Landmarks",
    stamps: "Stamps",
    collections: "Collections",
    loading: "Loading your landmark collection…",
    error: "Your landmark collection could not be loaded.",
    emptyTitle: "No landmarks discovered yet",
    emptyCopy:
      "Start an exploration session, follow a gold landmark pin, and approach it to add the place to your Journal.",
    discoveredOn: "Discovered {{date}}",
    stampsCopy:
      "Journey Stamps remain part of Arukiyo and will be expanded alongside landmark achievements.",
    collectionsCopy:
      "City, regional, historical, cultural, and themed landmark collections will build on these discoveries.",
  },
  detail: {
    eyebrow: "DISCOVERED LANDMARK",
    loading: "Loading landmark…",
    loadingSources: "Loading verified source information…",
    notFound:
      "This discovered landmark could not be found locally.",
    about: "About & history",
    noVerifiedHistory:
      "Arukiyo does not have verified historical text for this place yet. Available source links are shown below instead of generating unsupported history.",
    quickFacts: "Quick facts",
    yourDiscovery: "YOUR DISCOVERY",
    discoveryDetails: "Discovery details",
    unlockDistance: "Unlock distance",
    gpsAccuracy: "GPS accuracy",
    journeyDistance: "Journey distance",
    journeyDuration: "Journey duration",
    reward: "DISCOVERY REWARD",
    sources: "Sources & read more",
    officialWebsite: "Official website",
    sourceNote:
      "Historical text and imagery are shown only when a linked source provides them. Open the sources for the complete original information.",
    imageCredit:
      "Image preview via the linked Wikipedia/Wikimedia page.",
    fact: {
      historic: "Historic type",
      heritage: "Heritage",
      startDate: "Date / period",
      architect: "Architect",
      religion: "Religion",
      denomination: "Denomination",
      tourism: "Tourism type",
      building: "Building type",
      operator: "Operator",
    },
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
    eyebrow: "DESCOPERIRE LANDMARK-URI",
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
      "Landmark-urile apar pe hartă ca obiective de explorare. Pornește o călătorie și apropie-te de un pin pentru a-l descoperi.",
    networkFallback:
      "Actualizarea din rețea a eșuat, deci Arukiyo afișează datele landmark salvate local.",
  },
  discovery: {
    eyebrow: "LANDMARK NOU DESCOPERIT",
    saved:
      "Acest landmark face acum parte din colecția ta locală. Detaliile din Jurnal și sursele istorice vin în Stage 4C3.",
    continue: "Continuă explorarea",
    undiscoveredPin: "Landmark nedescoperit",
    unlockedPin: "Landmark descoperit",
  },

  journal: {
    subtitle:
      "Jurnalul tău personal păstrează acum fiecare landmark descoperit fizic.",
    collectionEyebrow: "COLECȚIE LANDMARK-URI",
    discoveredCount: "{{count}} landmark-uri descoperite",
    iconicCount: "{{count}} descoperiri emblematice",
    landmarks: "Landmark-uri",
    stamps: "Ștampile",
    collections: "Colecții",
    loading: "Se încarcă landmark-urile descoperite…",
    error: "Colecția de landmark-uri nu a putut fi încărcată.",
    emptyTitle: "Niciun landmark descoperit încă",
    emptyCopy:
      "Pornește o sesiune de explorare, urmează un pin auriu și apropie-te de obiectiv pentru a-l adăuga în Jurnal.",
    discoveredOn: "Descoperit la {{date}}",
    stampsCopy:
      "Journey Stamps rămân parte din Arukiyo și vor fi extinse împreună cu realizările pentru landmark-uri.",
    collectionsCopy:
      "Colecțiile de oraș, regionale, istorice, culturale și tematice vor fi construite peste aceste descoperiri.",
  },
  detail: {
    eyebrow: "LANDMARK DESCOPERIT",
    loading: "Se încarcă landmark-ul…",
    loadingSources: "Se încarcă informațiile din surse verificate…",
    notFound:
      "Acest landmark descoperit nu a putut fi găsit local.",
    about: "Despre & istoric",
    noVerifiedHistory:
      "Arukiyo nu are încă text istoric verificat pentru acest loc. Sunt afișate sursele disponibile, fără a inventa informații.",
    quickFacts: "Date rapide",
    yourDiscovery: "DESCOPERIREA TA",
    discoveryDetails: "Detaliile descoperirii",
    unlockDistance: "Distanță la deblocare",
    gpsAccuracy: "Precizie GPS",
    journeyDistance: "Distanța călătoriei",
    journeyDuration: "Durata călătoriei",
    reward: "RECOMPENSA DESCOPERIRII",
    sources: "Surse & citește mai mult",
    officialWebsite: "Site oficial",
    sourceNote:
      "Textul istoric și imaginile apar doar când există o sursă asociată. Deschide sursele pentru informația originală completă.",
    imageCredit:
      "Previzualizare imagine prin pagina Wikipedia/Wikimedia asociată.",
    fact: {
      historic: "Tip istoric",
      heritage: "Patrimoniu",
      startDate: "Dată / perioadă",
      architect: "Arhitect",
      religion: "Religie",
      denomination: "Confesiune",
      tourism: "Tip turistic",
      building: "Tip clădire",
      operator: "Administrator",
    },
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
    eyebrow: "ランドマーク発見",
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
      "ランドマークは探索目標として地図に表示されます。旅を開始し、ピンに近づいて発見しましょう。",
    networkFallback:
      "ネットワーク更新に失敗したため、保存済みのランドマークデータを表示しています。",
  },
  discovery: {
    eyebrow: "新しいランドマークを発見",
    saved:
      "このランドマークはローカルコレクションに保存されました。旅日記の詳細と歴史資料はStage 4C3で追加します。",
    continue: "探索を続ける",
    undiscoveredPin: "未発見のランドマーク",
    unlockedPin: "発見済みランドマーク",
  },

  journal: {
    subtitle:
      "実際に発見したランドマークを、あなただけの旅日記に保存します。",
    collectionEyebrow: "ランドマークコレクション",
    discoveredCount: "{{count}}件のランドマークを発見",
    iconicCount: "象徴的な発見 {{count}}件",
    landmarks: "ランドマーク",
    stamps: "スタンプ",
    collections: "コレクション",
    loading: "ランドマークコレクションを読み込んでいます…",
    error: "ランドマークコレクションを読み込めませんでした。",
    emptyTitle: "まだランドマークを発見していません",
    emptyCopy:
      "探索セッションを開始し、金色のピンを追って近づくと旅日記に追加されます。",
    discoveredOn: "{{date}}に発見",
    stampsCopy:
      "Journey Stampsは今後ランドマーク実績とともに拡張されます。",
    collectionsCopy:
      "都市・地域・歴史・文化・テーマ別コレクションを、発見したランドマークから構築します。",
  },
  detail: {
    eyebrow: "発見済みランドマーク",
    loading: "ランドマークを読み込んでいます…",
    loadingSources: "確認済みソースを読み込んでいます…",
    notFound:
      "この発見済みランドマークは端末内で見つかりませんでした。",
    about: "概要・歴史",
    noVerifiedHistory:
      "この場所について確認済みの歴史情報はまだありません。根拠のない内容は生成せず、利用可能な情報源を表示します。",
    quickFacts: "基本情報",
    yourDiscovery: "あなたの発見",
    discoveryDetails: "発見の詳細",
    unlockDistance: "発見距離",
    gpsAccuracy: "GPS精度",
    journeyDistance: "旅の距離",
    journeyDuration: "旅の時間",
    reward: "発見報酬",
    sources: "情報源・続きを読む",
    officialWebsite: "公式サイト",
    sourceNote:
      "歴史テキストと画像は関連する情報源がある場合のみ表示されます。完全な情報は元の情報源を開いて確認してください。",
    imageCredit:
      "関連するWikipedia/Wikimediaページの画像プレビュー。",
    fact: {
      historic: "歴史種別",
      heritage: "文化遺産",
      startDate: "年代",
      architect: "建築家",
      religion: "宗教",
      denomination: "宗派",
      tourism: "観光種別",
      building: "建物種別",
      operator: "運営",
    },
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
