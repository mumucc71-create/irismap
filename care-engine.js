(function () {
  const neutral = new Set(["", "아니오", "전혀 아니다", "없음", "해당 없음", "정상", "모름", "잘 모름", "미기록", "특별히 없음", "통증 없음", "환경노출 없음", "알레르기 없음"]);
  const profiles = [
    { id:"fatigue", title:"피로회복형", keywords:["피로","체력","쉽게 지침","회복","무기력"], hours:[7,8,11,12], goals:["에너지 생성 관리","회복 습관 관리","영양 균형 점검"], ingredients:["비타민B군","마그네슘","밀크씨슬"], box:["비타민B군","마그네슘","루이보스차","건강관리 가이드"] },
    { id:"sleep", title:"수면관리형", keywords:["수면","잠들기","새벽","코골이","졸린다"], hours:[11,12], goals:["수면 리듬 관리","긴장 완화","회복 시간 확보"], ingredients:["마그네슘","L-테아닌"], box:["마그네슘","L-테아닌","캐모마일티","수면관리책자"] },
    { id:"gut", title:"장건강형", keywords:["소화","더부룩","변비","설사","복부","위산","장"], hours:[4,7,8], goals:["장내 환경 관리","배변 리듬 관리","식사 습관 점검"], ingredients:["프로바이오틱스","프리바이오틱스","식이섬유"], box:["프로바이오틱스","프리바이오틱스","차전자피","페퍼민트티"] },
    { id:"women", title:"여성밸런스형", keywords:["질염","분비물","생리","여성","방광","생식기","폐경"], hours:[5,6], goals:["여성 유익균 밸런스 관리","비뇨·생활습관 관리","수분 섭취 점검"], ingredients:["여성 유산균","크랜베리"], box:["여성유산균","크랜베리","루이보스티","여성건강가이드"] },
    { id:"immune", title:"면역관리형", keywords:["면역","감기","염증","비염","편도","알레르기"], hours:[2,3,8,10], goals:["면역 균형 관리","회복 습관 관리","환경 노출 점검"], ingredients:["비타민C","비타민D","아연"], box:["비타민C","비타민D","아연","면역관리 가이드"] },
    { id:"circulation", title:"혈액순환형", keywords:["심장","순환","혈압","두근","손발이 차","부종","혈관"], hours:[8,9], goals:["혈행 건강 관리","활동량 관리","혈압·복용약 확인"], ingredients:["오메가3","코엔자임Q10","마그네슘"], box:["오메가3","코엔자임Q10","루이보스차","순환관리 가이드"] },
    { id:"stress", title:"스트레스관리형", keywords:["스트레스","불안","우울","걱정","감정","예민"], hours:[11,12], goals:["긴장 반응 관리","감정 회복 시간 확보","수면·호흡 습관 관리"], ingredients:["마그네슘","L-테아닌"], box:["마그네슘","L-테아닌","캐모마일티","마음챙김 가이드"] },
    { id:"weight", title:"체중관리형", keywords:["체중","과식","폭식","야식","혈당","당뇨"], hours:[4,7], goals:["식사 리듬 관리","활동량 관리","체중·혈당 기록"], ingredients:["식이섬유","프로바이오틱스"], box:["식이섬유","프로바이오틱스","보이차","식습관 가이드"] },
    { id:"liver", title:"간관리형", keywords:["간수치","간질환","황달","음주","숙취","간·담낭"], hours:[7], goals:["간 건강 지표 추적","음주·복용 성분 점검","회복 습관 관리"], ingredients:["밀크씨슬","비타민B군"], box:["밀크씨슬","비타민B군","루이보스차","간건강 생활가이드"] }
  ];

  function normalizePhone(value) { let digits=String(value||"").replace(/\D/g,""); if(digits.length===10&&digits.startsWith("10")) digits=`0${digits}`; return digits; }
  function readJson(key) { try { return JSON.parse(localStorage.getItem(key)||"null"); } catch (_) { return null; } }
  function values(value) { return Array.isArray(value) ? value : [value]; }
  function hasSignal(value) { return values(value).some((item)=>!neutral.has(String(item??"").trim())); }
  function softenSensitiveText(value) {
    return String(value??"")
      .replace(/자위\s*습관이나\s*빈도가\s*신경\s*쓰인다/g, "반복되는 습관 행동을 조절하기 어렵다고 느낀다")
      .replace(/자위/g, "반복되는 습관 행동")
      .replace(/음란물\s*시청/g, "자극적인 콘텐츠 사용")
      .replace(/성적\s*충동/g, "충동");
  }
  function flattenHealth(health) {
    if(!health) return [];
    const labels=health.answerLabels||{};
    return Object.entries(health).flatMap(([group,answers])=>answers&&typeof answers==="object"&&!Array.isArray(answers)&&group!=="answerLabels"
      ? Object.entries(answers).filter(([,answer])=>hasSignal(answer)).map(([name,answer])=>({group,name,label:softenSensitiveText(labels[name]||name),value:values(answer).filter((item)=>!neutral.has(String(item??"").trim())).join(", ")})) : []);
  }
  function irisItems(iris) {
    if(!iris) return [];
    const source=iris.allObservations||{right:iris.right||[],left:iris.left||[]};
    const normalizeItems=(items)=>Array.isArray(items)?items:(Array.isArray(items?.observations)?items.observations:[]);
    return [["우안",source.right||[]],["좌안",source.left||[]]].flatMap(([eye,items])=>normalizeItems(items).map((item)=>({...item,eyeLabel:eye,hour:Number(String(item.code||"").split("-")[0])})));
  }
  function scoreProfiles(findings, observations) {
    const text=findings.map((item)=>`${item.label} ${item.value}`).join(" ");
    return profiles.map((profile)=>{
      const matchedFindings=findings.filter((item)=>profile.keywords.some((keyword)=>`${item.label} ${item.value}`.includes(keyword)));
      const matchedIris=observations.filter((item)=>profile.hours.includes(item.hour));
      const keywordScore=profile.keywords.reduce((sum,keyword)=>sum+(text.includes(keyword)?2:0),0);
      const score=keywordScore+matchedFindings.length*2+matchedIris.length;
      return {...profile,score,matchedFindings,matchedIris};
    }).filter((item)=>item.score>0).sort((a,b)=>b.score-a.score);
  }
  function answerMap(health) {
    const result={}; if(!health)return result;
    Object.values(health).forEach((group)=>{if(group&&typeof group==="object"&&!Array.isArray(group))Object.assign(result,group)}); return result;
  }
  function yes(value) { return values(value).some((item)=>["예","자주","거의 매일","심함","중간","현재 있음"].includes(String(item))); }
  function no(value) { return values(value).some((item)=>["아니오","전혀 아니다","없음"].includes(String(item))); }
  function lifestyleScores(health) {
    const a=answerMap(health);
    const calculate=(bad,good=[])=>Math.max(20,Math.min(95,70-bad.filter((key)=>yes(a[key])).length*13+bad.filter((key)=>no(a[key])).length*4+good.filter((key)=>yes(a[key])).length*8));
    const hydration={"500mL 미만":30,"500mL~1L":48,"1~1.5L":68,"1.5~2L":85,"2L 이상":80,"잘 모르겠음":50}[a.waterIntake]||55;
    return {
      "수면":calculate(["nightWork","irregularSleep","shortSleep","lateScreen","sleepDifficulty","wakeAtDawn","recoverySleep"]),
      "운동":calculate(["avoidExercise"],["exerciseRegular","walkingExercise","strengthTraining","stretching","sweatExercise"]),
      "식습관":calculate(["irregularMeal","skipMeal","lateSnack","overeating","processedFood"]),
      "수분섭취":hydration,
      "흡연":calculate(["smokingCurrent","secondhandSmoke"]),
      "음주":calculate(["drinkingFrequency","drinkingAmount","hangover","blackout"]),
      "스트레스":calculate(["workStress","familyStress","relationStress","moneyStress","loneliness","futureAnxiety","stressRecovery"])
    };
  }
  function analyze(phoneValue) {
    const phone=normalizePhone(phoneValue||localStorage.getItem("irisMappingSession"));
    const health=phone?readJson(`irisHealthTest:${phone}`):null;
    const iris=readJson("irisReadingResult");
    const allFindings=flattenHealth(health);
    const familyFindings=allFindings.filter((item)=>item.group==="familyHistory"||/가족|아버지|어머니|형제|자매/.test(item.label));
    const findings=allFindings.filter((item)=>!familyFindings.includes(item));
    const observations=irisItems(iris), ranked=scoreProfiles(findings,observations);
    const scores=lifestyleScores(health), average=Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/Object.keys(scores).length);
    const actualAge=Number(answerMap(health).age)||null;
    const healthAge=actualAge?Math.max(1,actualAge+Math.round((65-average)/4)):null;
    return {phone,health,iris,findings,familyFindings,observations,ranked,scores,average,actualAge,healthAge,primary:ranked.slice(0,3),type:ranked.length>1&&ranked[0].score-ranked[1].score<3?"복합형":(ranked[0]?.title||"기본관리형")};
  }
  window.IrisCareEngine={profiles,normalizePhone,readJson,analyze};
})();
