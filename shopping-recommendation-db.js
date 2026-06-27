window.shoppingRecommendationDB = {
  productGroupDB: [
    { id:"women_probiotics", keywords:["질염","질 냄새","분비물","가려움","여성 밸런스","생식기 염증"], title:"여성 유산균", message:"질·장 유익균 밸런스 관리를 위한 여성 유산균 제품군을 비교합니다." },
    { id:"vitamin_b", keywords:["피로","체력저하","쉽게 지침","피로해진다","간·담낭"], title:"비타민B군", message:"에너지 대사에 필요한 비타민B군의 함량과 구성을 비교합니다." },
    { id:"magnesium", keywords:["피로","근육 경련","쥐가","수면","스트레스","두근거림"], title:"마그네슘", message:"근육·신경 기능과 수면 습관 관리를 위해 마그네슘 형태와 함량을 비교합니다." },
    { id:"milk_thistle", keywords:["간수치","간질환","간·담낭","황달","음주","숙취"], title:"밀크씨슬", message:"간 건강 기능성 원료인 실리마린의 표시 함량과 섭취 주의사항을 비교합니다." },
    { id:"coq10", keywords:["심장","순환","혈압","두근거림","심장·순환·흉부"], title:"코엔자임Q10", message:"항산화와 높은 혈압 감소에 도움을 줄 수 있는 기능성 표시 제품을 비교합니다." },
    { id:"probiotics", keywords:["소화","변비","설사","장·비장·면역","복부","더부룩"], title:"프로바이오틱스", message:"장 건강 관리를 위해 균주 구성과 보장균수를 비교합니다." },
    { id:"eye_health", keywords:["눈 피로","시력","안구건조","눈·귀 신경"], title:"눈 건강 제품군", message:"루테인·지아잔틴 등 눈 건강 기능성 원료의 함량을 비교합니다." },
    { id:"joint_health", keywords:["관절","무릎","연골","관절 통증"], title:"관절·연골 제품군", message:"관절 및 연골 건강 기능성 원료와 일일 섭취량을 비교합니다." }
    ,{ id:"omega3", keywords:["혈행","중성지질","순환"], title:"오메가3", message:"EPA·DHA 합계와 항응고제 복용 주의사항을 비교합니다." }
    ,{ id:"vitamin_c", keywords:["면역","항산화","감기"], title:"비타민C", message:"일일 섭취량과 다른 제품의 중복 섭취를 비교합니다." }
    ,{ id:"vitamin_d", keywords:["면역","뼈","골다공증"], title:"비타민D", message:"혈중 수치와 일일 섭취량을 확인해 비교합니다." }
    ,{ id:"zinc", keywords:["면역","상처","감염"], title:"아연", message:"정상 면역 기능을 위한 함량과 장기 고용량 주의를 비교합니다." }
    ,{ id:"prebiotics", keywords:["장","변비","유익균"], title:"프리바이오틱스", message:"원료와 당류 함량, 섭취 후 불편 가능성을 비교합니다." }
    ,{ id:"fiber", keywords:["변비","배변","체중"], title:"식이섬유", message:"식이섬유 함량과 충분한 물 섭취 조건을 비교합니다." }
    ,{ id:"theanine", keywords:["스트레스","긴장","수면"], title:"L-테아닌", message:"긴장 완화 기능성 표시와 카페인 섭취를 함께 확인합니다." }
    ,{ id:"cranberry", keywords:["방광","비뇨","여성"], title:"크랜베리", message:"원료 함량과 당류, 항응고제 복용 주의를 비교합니다." }
  ],
  searchKeywordDB: {
    women_probiotics:["여성 질 유산균","여성 유산균 질 건강","리스펙타 유산균","락토바실러스 크리스파투스","질 유래 유산균"],
    vitamin_b:["고함량 비타민B군","피로 비타민B 컴플렉스","비타민B군 건강기능식품"],
    magnesium:["마그네슘 글리시네이트","마그네슘 함량 표시 건강기능식품","마그네슘 비타민B6"],
    milk_thistle:["밀크씨슬 실리마린 함량","밀크씨슬 건강기능식품","실리마린 표시 제품"],
    coq10:["코엔자임Q10 건강기능식품","코큐텐 함량 표시","코엔자임Q10 항산화"],
    probiotics:["프로바이오틱스 보장균수","유산균 균주 표시","장 건강 유산균"],
    eye_health:["루테인 지아잔틴 함량","눈 건강 건강기능식품","루테인 아스타잔틴"],
    joint_health:["관절 연골 건강기능식품","MSM 함량 표시","보스웰리아 기능성 제품"],
    omega3:["오메가3 EPA DHA 함량","오메가3 건강기능식품","알티지 오메가3"],
    vitamin_c:["비타민C 건강기능식품","비타민C 함량 표시"],
    vitamin_d:["비타민D 건강기능식품","비타민D IU 함량"],
    zinc:["아연 건강기능식품","아연 일일 함량"],
    prebiotics:["프리바이오틱스 건강기능식품","유산균 먹이 프리바이오틱스"],
    fiber:["식이섬유 건강기능식품","차전자피 식이섬유"],
    theanine:["L-테아닌 건강기능식품","테아닌 긴장 완화"],
    cranberry:["크랜베리 건강기능식품","크랜베리 여성 건강"]
  },
  selectionConditionDB: [
    "제품군과 핵심 성분이 일치하는가", "건강기능식품 표시가 있는가", "핵심 성분 함량이 표시되어 있는가",
    "후기 수가 충분한가", "평점이 낮지 않은가", "과장 표현이 심하지 않은가",
    "가격이 비정상적으로 싸거나 비싸지 않은가", "동일 브랜드 중복을 줄였는가",
    "광고 문구보다 성분표를 우선했는가", "임산부·약 복용자·질환자 주의문구가 있는가"
  ],
  recommendationProductDB: [
    {category:"women_probiotics",name:"리스펙타·질 유래 균주 여성 유산균 비교 후보",ingredient:"여성 유산균 기능성 원료 또는 질 유래 유산균",reason:"기능성 원료명, 보장균수, 보관방법이 표시된 제품을 우선 비교합니다."},
    {category:"women_probiotics",name:"락토바실러스 크리스파투스 함유 제품 비교 후보",ingredient:"L. crispatus 등 균주명 표시",reason:"균주명이 구체적으로 공개된 제품끼리 비교하기 좋습니다."},
    {category:"women_probiotics",name:"질·장 복합 여성 유산균 비교 후보",ingredient:"프로바이오틱스와 여성 건강 원료",reason:"질·장 밸런스용 구성과 1일 섭취량을 확인할 수 있는 후보입니다."},
    {category:"vitamin_b",name:"고함량 비타민B 컴플렉스 비교 후보",ingredient:"비타민 B1·B2·B6·B12 등",reason:"각 비타민의 1일 섭취량 대비 함량이 공개된 제품을 우선합니다."},
    {category:"vitamin_b",name:"활성형 비타민B군 비교 후보",ingredient:"활성형 B6·엽산·B12 등",reason:"원료 형태와 함량을 확인할 수 있는 제품의 비교 후보입니다."},
    {category:"vitamin_b",name:"비타민B군·비타민C 복합 비교 후보",ingredient:"비타민B군과 비타민C",reason:"성분 중복과 총 섭취량을 확인하기 쉬운 제품을 비교합니다."},
    {category:"magnesium",name:"마그네슘 글리시네이트 비교 후보",ingredient:"마그네슘 글리시네이트",reason:"원료 형태와 실제 마그네슘 함량이 명시된 제품을 우선합니다."},
    {category:"magnesium",name:"마그네슘·비타민B6 복합 비교 후보",ingredient:"마그네슘과 비타민B6",reason:"중복 섭취 여부와 일일 함량을 비교하기 좋은 후보입니다."},
    {category:"magnesium",name:"구연산 마그네슘 비교 후보",ingredient:"마그네슘 시트레이트",reason:"제형과 섭취 편의성, 표시 함량을 비교합니다."},
    {category:"milk_thistle",name:"실리마린 함량 표시 밀크씨슬 비교 후보",ingredient:"밀크씨슬 추출물·실리마린",reason:"건강기능식품 표시와 실리마린 일일 함량이 명확한 제품을 우선합니다."},
    {category:"milk_thistle",name:"밀크씨슬·비타민B군 복합 비교 후보",ingredient:"실리마린과 비타민B군",reason:"다른 영양제와 성분이 중복되지 않는지 확인할 비교 후보입니다."},
    {category:"milk_thistle",name:"단일 밀크씨슬 추출물 비교 후보",ingredient:"밀크씨슬 추출물",reason:"불필요한 복합 성분을 줄이고 핵심 원료를 비교하기 좋습니다."},
    {category:"coq10",name:"코엔자임Q10 함량 표시 비교 후보",ingredient:"코엔자임Q10",reason:"기능성 표시, 일일 함량, 복용 중인 약과의 주의사항을 확인합니다."},
    {category:"coq10",name:"코엔자임Q10·비타민E 복합 비교 후보",ingredient:"코엔자임Q10과 비타민E",reason:"항산화 성분 구성과 중복 섭취량을 비교합니다."},
    {category:"coq10",name:"식물성 캡슐 코엔자임Q10 비교 후보",ingredient:"코엔자임Q10",reason:"제형과 원료, 함량이 명확한 제품을 비교합니다."},
    {category:"probiotics",name:"균주·보장균수 표시 프로바이오틱스 비교 후보",ingredient:"프로바이오틱스",reason:"균주명과 유통기한까지의 보장균수가 공개된 제품을 우선합니다."},
    {category:"probiotics",name:"프리바이오틱스 복합 유산균 비교 후보",ingredient:"프로바이오틱스·프리바이오틱스",reason:"부원료와 당류, 1일 섭취량을 함께 비교합니다."},
    {category:"probiotics",name:"상온 보관 유산균 비교 후보",ingredient:"프로바이오틱스",reason:"보관 편의성과 보장균수 조건을 비교하기 좋습니다."},
    {category:"eye_health",name:"루테인·지아잔틴 함량 표시 비교 후보",ingredient:"루테인·지아잔틴",reason:"두 성분의 일일 함량과 기능성 표시를 확인합니다."},
    {category:"eye_health",name:"루테인·아스타잔틴 복합 비교 후보",ingredient:"루테인·아스타잔틴",reason:"눈 피로 관련 복합 구성과 함량을 비교합니다."},
    {category:"eye_health",name:"오메가3 복합 눈 건강 비교 후보",ingredient:"루테인·오메가3",reason:"항응고제 복용 여부와 성분 중복을 먼저 확인합니다."},
    {category:"joint_health",name:"MSM 함량 표시 관절 제품 비교 후보",ingredient:"MSM",reason:"기능성 표시와 일일 섭취량이 명확한 제품을 우선합니다."},
    {category:"joint_health",name:"보스웰리아 기능성 원료 비교 후보",ingredient:"보스웰리아 추출물",reason:"인정 원료 여부와 지표 성분 함량을 비교합니다."},
    {category:"joint_health",name:"글루코사민 관절 제품 비교 후보",ingredient:"글루코사민",reason:"알레르기와 복용약 주의사항을 확인할 비교 후보입니다."}
  ]
};

// 운영자가 선별한 상품만 저장하고 노출하는 로컬 ProductDB입니다.
(function createProductDB() {
  const STORAGE_KEY = "irisProductDB";
  const LEGACY_KEY = "irisAdminProducts";

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  function toList(value) {
    if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
    return String(value || "").split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
  }

  function makeNaverSearchUrl(query) {
    return "https://search.shopping.naver.com/search/all?query=" + encodeURIComponent(String(query || ""));
  }

  function normalize(product) {
    const searchKeywords = toList(product.searchKeywords || product.recommendationSearchTerms);
    const name = String(product.name || product.productName || "").trim();
    return {
      productId: String(product.productId || product.id || ("P" + Date.now() + Math.random().toString(36).slice(2, 7))),
      name,
      brand: String(product.brand || "").trim(),
      category: String(product.category || "").trim(),
      displayGroup: ["basic", "personal", "preference"].includes(product.displayGroup) ? product.displayGroup : "personal",
      recommendedIngredients: toList(product.recommendedIngredients || product.ingredient),
      targetKeywords: toList(product.targetKeywords || product.recommendationTargets || product.category),
      searchKeywords,
      description: String(product.description || "").trim(),
      reason: String(product.reason || product.recommendationReason || "").trim(),
      imageUrl: String(product.imageUrl || product.image || "").trim(),
      officialUrl: String(product.officialUrl || "").trim(),
      naverSearchUrl: String(product.naverSearchUrl || "").trim() || makeNaverSearchUrl(searchKeywords[0] || name),
      purchaseUrl: String(product.purchaseUrl || product.buyUrl || "").trim(),
      wholesalePrice: Number(product.wholesalePrice) || 0,
      salePrice: Number(product.salePrice) || 0,
      stock: Math.max(0, product.stock === "" || product.stock === undefined || product.stock === null ? 1 : Number(product.stock) || 0),
      visible: product.visible === false || product.visible === "false" || product.visible === "숨김" ? false : true,
      priority: Math.max(0, Number(product.priority) || 100),
      supplier: String(product.supplier || "").trim(),
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: product.updatedAt || new Date().toISOString()
    };
  }

  function migrateLegacy() {
    const current = readJson(STORAGE_KEY, []);
    if (Array.isArray(current) && current.length) return current.map(normalize);
    const legacy = readJson(LEGACY_KEY, []);
    if (!Array.isArray(legacy) || !legacy.length) return [];
    const migrated = legacy.map(normalize);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  }

  window.ProductDB = {
    storageKey: STORAGE_KEY,
    fields: [
      "productId", "name", "brand", "category", "displayGroup", "recommendedIngredients",
      "targetKeywords", "searchKeywords", "description", "reason", "imageUrl",
      "officialUrl", "naverSearchUrl", "purchaseUrl", "wholesalePrice", "salePrice",
      "stock", "visible", "priority"
    ],
    read() {
      return migrateLegacy().map(normalize);
    },
    write(products) {
      const normalized = (Array.isArray(products) ? products : []).map(normalize);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    },
    normalize,
    toList,
    makeNaverSearchUrl
  };
})();
