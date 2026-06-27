(function(){
  "use strict";
  const CANDIDATE_GROUPS={
    1:[area("eyeFace","눈·얼굴·전두동",["눈","시야","충혈","안구","이마","전두동","부비동"],["피부·연조직","목·얼굴"])],
    2:[area("bronchial","폐·기관지",["기침","가래","숨참","호흡","천식","기관지","비염"],["폐·기관지","감염·염증"])],
    3:[area("lung","폐·기관지",["기침","가래","숨참","가슴 답답","호흡","천식","기관지","흉부"],["폐·기관지","감염·염증"])],
    4:[area("stomach","위",["소화불량","속쓰림","위산","역류","구토","더부룩","위염","위궤양"],["위·소화기"]),area("pancreas","췌장",["혈당","당뇨","당대사","췌장","단 음식","과식"],["췌장","위·소화기"]),area("digestive","소화기",["소화","복부","식사","더부룩","메스꺼움"],["위·소화기","장"])],
    5:[area("kidney","신장",["신장","콩팥","부종","옆구리","소변 색","거품뇨"],["신장"]),area("urinary","비뇨",["소변","배뇨","야간뇨","방광","요관"],["신장","여성생식","남성생식"])],
    6:[area("pelvis","골반",["골반","허리","하복부"],["여성생식","남성생식","염증·통증"]),area("female","여성생식",["생리","질염","분비물","자궁","난소","여성"],["여성생식"]),area("male","남성생식",["전립선","남성","배뇨"],["남성생식"]),area("urinary","비뇨",["소변","배뇨","야간뇨","방광"],["신장","여성생식","남성생식"])],
    7:[area("liver","간",["간수치","간질환","지방간","황달","피로","음주","숙취"],["간"]),area("gallbladder","담낭",["담낭","담석","오른쪽 윗배","기름진 음식"],["간","위·소화기"]),area("smallBowel","소장",["소장","장염","설사","복부","흡수"],["장"])],
    8:[area("bowel","장",["변비","설사","배변","대장","장염","과민성","복부"],["장"]),area("spleen","비장",["비장","면역","피로","혈액"],["감염·염증","림프"]),area("lymph","림프",["림프","임파선","부종","면역","반복 감염"],["림프","감염·염증"])],
    9:[area("heartCirculation","심장·순환",["심장","두근거림","가슴 답답","가슴 통증","혈압","판막","순환","맥박"],["순환"]),area("breast","유방",["유방","멍울","생리 전 유방","가슴 멍울"],["유방"]),area("lung","폐·기관지",["기침","숨참","가래","호흡","천식","기관지"],["폐·기관지"])],
    10:[area("neck","목",["목통증","목 통증","거북목","자라목","목 불편"],["목·얼굴","염증·통증"]),area("shoulder","어깨",["어깨통증","어깨 통증","승모근"],["염증·통증"]),area("lymph","림프",["림프","임파선","부종","면역"],["림프"]),area("thyroid","갑상선",["갑상선","목 앞","호르몬"],["갑상선"]),area("tonsil","편도선",["편도","인후","목 붓","목감기"],["목·얼굴","감염·염증"])],
    11:[area("brainSensory","뇌·감각·자율신경",["두통","어지럼","감각","청력","시력","자율신경","집중","기억"],["뇌·신경"])],
    12:[area("brainNerve","뇌·신경",["두통","불면","수면","스트레스","불안","우울","집중","기억","신경","피로"],["뇌·신경"])]
  };
  const REPEATED_VALUES=new Set(["자주","거의 매일","매우심함","심함","재발 있음","현재 불편감","후유증"]);
  const NEUTRAL_VALUES=new Set(["","아니오","전혀 아니다","없음","해당 없음","정상","모름","잘 모름","미기록","특별히 없음","통증 없음"]);
  const LIFESTYLE_GROUPS=new Set(["lifestyle","diet","stress","occupation","riskEnvironment"]);

  function area(id,name,keywords,historyAreas){return{id,name,keywords,historyAreas}}
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||"null")}catch(_){return null}}
  function normalizePhone(value){let digits=String(value||"").replace(/\D/g,"");if(digits.length===10&&digits.startsWith("10"))digits=`0${digits}`;return digits}
  function values(value){return Array.isArray(value)?value:[value]}
  function meaningful(value){return values(value).some((item)=>!NEUTRAL_VALUES.has(String(item??"").trim()))}
  function itemText(item){return`${item.label||item.name||""} ${values(item.value).join(" ")}`}
  function unique(items){return[...new Set(items.filter(Boolean))]}
  function clamp(value,min=0,max=100){return Math.max(min,Math.min(max,Math.round(value)))}
  function irisObservations(iris){
    if(!iris)return[];
    const source=iris.allObservations||{right:iris.right||[],left:iris.left||[]};
    const normalize=(items)=>Array.isArray(items)?items:(Array.isArray(items?.observations)?items.observations:[]);
    return[["우안",source.right],["좌안",source.left]].flatMap(([eye,items])=>normalize(items).map((item)=>({...item,eyeLabel:eye,hour:Number(String(item.code||"").split("-")[0])}))).filter((item)=>Number.isFinite(item.hour));
  }
  function flattenHealth(health,includeNeutral=false){
    if(!health)return[];
    const labels=health.answerLabels||{};
    const excluded=new Set(["phone","status","updatedAt","createdAt","answerLabels"]);
    return Object.entries(health).flatMap(([group,answers])=>{
      if(excluded.has(group)||!answers||typeof answers!=="object"||Array.isArray(answers))return[];
      return Object.entries(answers).filter(([,value])=>includeNeutral||meaningful(value)).map(([name,value])=>({group,name,label:labels[name]||name,value}));
    });
  }
  function latestUniverse(phone){const records=readJson(phone?`UniverseReportDB:${phone}`:"UniverseReportDB");return Array.isArray(records)?records.at(-1)||null:null}
  function previousUniverse(phone){const records=readJson(phone?`UniverseReportDB:${phone}`:"UniverseReportDB");return Array.isArray(records)&&records.length>1?records.at(-2):null}

  function analyze(phoneValue){
    const phone=normalizePhone(phoneValue||localStorage.getItem("irisMappingSession"));
    const health=phone?readJson(`irisHealthTest:${phone}`):null;
    const iris=readJson("irisReadingResult");
    const allAnswers=flattenHealth(health,true);
    const allFindings=allAnswers.filter((item)=>meaningful(item.value));
    const familyFindings=allFindings.filter(isFamilyFinding);
    const negativeFindings=allAnswers.filter((item)=>!isFamilyFinding(item)&&!meaningful(item.value));
    const lifestyleFindings=allFindings.filter((item)=>LIFESTYLE_GROUPS.has(item.group));
    const questionnaire=allFindings.filter((item)=>!LIFESTYLE_GROUPS.has(item.group)&&!isFamilyFinding(item));
    const currentSymptoms=questionnaire.filter(isCurrentSymptom);
    const universe=latestUniverse(phone),previous=previousUniverse(phone);
    const subscription=readJson(phone?`irisSubscription:${phone}`:"irisSubscription")||{};
    const boxHistory=readJson(phone?`irisHealthBoxHistory:${phone}`:"")||[];
    const purchases=readJson(phone?`irisPurchaseHistory:${phone}`:"")||[];
    const observations=irisObservations(iris);
    const byHour=new Map();
    observations.forEach((item)=>{if(!byHour.has(item.hour))byHour.set(item.hour,[]);byHour.get(item.hour).push(item)});
    const context={questionnaire,lifestyleFindings,currentSymptoms,familyFindings,negativeFindings,universe,previous,subscription,boxHistory,purchases};
    const groups=Object.keys(CANDIDATE_GROUPS).map(Number).map((hour)=>evaluateHour(hour,byHour.get(hour)||[],context)).filter((group)=>group&&group.score>0).sort((a,b)=>b.score-a.score||b.irisStrength-a.irisStrength);
    const rankedResults=dedupeResults(groups);
    const results=rankedResults.slice(0,3);
    const additionalResults=rankedResults.slice(3,8);
    const confidence=buildConfidence(results,{health,universe,lifestyleFindings,observations});
    const output={createdAt:new Date().toISOString(),phone,sourcePriority:["현재 문진","유니버스 결과","과거 병력","홍채 관찰","가족력 참고"],hasQuestionnaire:Boolean(health&&questionnaire.length),hasHistory:Boolean(universe),familyReferences:familyFindings,results,additionalResults,confidence,introduction:"회원님의 현재 문진, 유니버스 결과, 과거 병력 정보를 우선 분석했습니다. 홍채 관찰은 교차확인 자료로 반영하고 가족력은 별도 참고사항으로만 표시합니다."};
    if(phone)localStorage.setItem(`irisIntegratedReading:${phone}`,JSON.stringify(output));
    return output;
  }

  function evaluateHour(hour,irisItems,context){
    const candidates=(CANDIDATE_GROUPS[hour]||[]).map((candidate)=>evaluateCandidate(candidate,hour,irisItems,context)).sort((a,b)=>b.score-a.score||b.questionnaireMatches.length-a.questionnaireMatches.length);
    if(!candidates.length)return null;
    const selected=candidates[0];
    return{hour,candidateAreas:candidates.map((item)=>item.name),selected,candidates,score:selected.score,irisStrength:irisItems.length?Math.max(...irisItems.map((item)=>Number(item.score||item.priorityScore||0))):0,irisItems,consultation:buildConsultation(hour,selected)};
  }
  function evaluateCandidate(candidate,hour,irisItems,context){
    const questionnaireMatches=context.questionnaire.filter((item)=>matchesCandidate(item,candidate));
    const pastHealthMatches=questionnaireMatches.filter(isPastHealthFinding);
    const currentQuestionnaireMatches=questionnaireMatches.filter((item)=>!isPastHealthFinding(item));
    const lifestyleMatches=context.lifestyleFindings.filter((item)=>matchesCandidate(item,candidate));
    const currentMatches=context.currentSymptoms.filter((item)=>matchesCandidate(item,candidate));
    const repeatedMatches=currentMatches.filter((item)=>values(item.value).some((value)=>REPEATED_VALUES.has(String(value))));
    const rawFamilyMatches=context.familyFindings.filter((item)=>matchesCandidate(item,candidate));
    const negativeMatches=context.negativeFindings.filter((item)=>matchesCandidate(item,candidate));
    const historyMatches=matchHistory(candidate,context.universe);
    const improved=isImproved(candidate,context.universe,context.previous);
    const managed=isManaged(candidate,context.subscription,context.boxHistory,context.purchases);
    const questionnaireScore=currentQuestionnaireMatches.length?40+Math.min(15,(currentQuestionnaireMatches.length-1)*5):0;
    const pastHealthScore=pastHealthMatches.length?25+Math.min(5,(pastHealthMatches.length-1)*3):0;
    const lifestyleScore=lifestyleMatches.length?Math.min(20,8+lifestyleMatches.length*4):0;
    const negativePenalty=!questionnaireMatches.length&&!historyMatches.length?Math.min(25,negativeMatches.length*5):0;
    const corroboratingSources=[questionnaireMatches.length>0,historyMatches.length>0,irisItems.length>0].filter(Boolean).length;
    const familyMatches=corroboratingSources>0?rawFamilyMatches:[];
    const score=clamp(questionnaireScore+pastHealthScore+(historyMatches.length?30:0)+lifestyleScore+(irisItems.length?10:0)+(repeatedMatches.length?10:0)-negativePenalty-(improved?10:0)-(managed?5:0));
    const questionnaireMatchPercent=!context.questionnaire.length?null:currentQuestionnaireMatches.length?clamp(55+(currentQuestionnaireMatches.length-1)*12+(repeatedMatches.length?8:0),0,95):pastHealthMatches.length?35:0;
    const managementPriority=score>=80?"매우 높음":score>=60?"높음":score>=40?"보통":"낮음";
    return{...candidate,hour,score,questionnaireMatches,currentQuestionnaireMatches,pastHealthMatches,lifestyleMatches,currentMatches,repeatedMatches,familyMatches,rawFamilyMatches,familyReferenceOnly:rawFamilyMatches.length>0&&corroboratingSources===0,negativeMatches,historyMatches,improved,managed,irisItems,questionnaireMatchPercent,managementPriority};
  }
  function isFamilyFinding(item){return item?.group==="familyHistory"||/가족|아버지|어머니|형제|자매/.test(String(item?.label||""))}
  function isPastHealthFinding(item){
    if(isFamilyFinding(item))return false;
    const text=`${item?.name||""} ${item?.label||""} ${values(item?.value).join(" ")}`;
    return /History|Diagnosis|Surgery|Procedure|past|과거|수술|시술|병원 진단|재발|후유증/i.test(text);
  }
  function matchesCandidate(item,candidate){const text=itemText(item);return candidate.keywords.some((keyword)=>text.includes(keyword))}
  function matchHistory(candidate,universe){
    if(!universe)return[];
    const scores=Array.isArray(universe.부위별점수JSON)?universe.부위별점수JSON:[];
    return scores.filter((item)=>{
      const personalHealth=(item.healthMatches||[]).filter((finding)=>!isFamilyFinding(finding));
      const hasPersonalEvidence=Boolean(item.medicalHistory||item.pdfMatches||(item.medications||[]).length||(item.exams||[]).length||(item.irisMatches||[]).length||personalHealth.length||(item.lifestyleMatches||[]).length);
      return Number(item.score)>0&&hasPersonalEvidence&&candidate.historyAreas.some((name)=>String(item.name||"").includes(name)||name.includes(String(item.name||"")));
    });
  }
  function isImproved(candidate,current,previous){
    if(!current)return false;
    const currentItems=matchHistory(candidate,current);
    if(currentItems.some((item)=>item.change==="개선 흐름"))return true;
    if(!previous)return false;
    const previousItems=matchHistory(candidate,previous);
    if(!currentItems.length||!previousItems.length)return false;
    return Math.max(...currentItems.map((item)=>item.score))<=Math.max(...previousItems.map((item)=>item.score))-5;
  }
  function isManaged(candidate,subscription,boxHistory,purchases){
    const texts=[...(subscription.box||[]),...boxHistory.flatMap((item)=>item.box||[]),...purchases.map((item)=>`${item.productName||""} ${item.ingredient||""}`)].join(" ");
    const managementTerms={heartCirculation:["오메가3","코엔자임","혈압","운동"],lung:["호흡","면역"],bronchial:["호흡","면역"],brainNerve:["마그네슘","테아닌","수면"],brainSensory:["마그네슘","테아닌"],stomach:["유산균","효소"],digestive:["유산균","효소"],pancreas:["식이섬유","혈당"],liver:["밀크씨슬","비타민B"],bowel:["프로바이오틱스","유산균","식이섬유"],smallBowel:["프로바이오틱스","유산균"],kidney:["수분"],female:["여성유산균","크랜베리"],lymph:["비타민C","아연"]}[candidate.id]||candidate.keywords;
    return managementTerms.some((term)=>texts.includes(term));
  }
  function isCurrentSymptom(item){if(item.group==="symptoms")return true;const text=itemText(item);return/(현재|통증|불편|기침|가래|피로|두근|숨참|부종|소화|변비|설사|불면|두통|어지)/.test(text)&&item.group!=="familyHistory"}
  function buildConsultation(hour,candidate){
    const parts=[];
    if(candidate.currentQuestionnaireMatches.length)parts.push(`회원님의 현재 문진에서 ${summarizeMatches(candidate.currentQuestionnaireMatches)} 항목이 확인되었습니다.`);
    if(candidate.pastHealthMatches.length)parts.push(`과거 병력에서는 ${summarizeHistoryMatches(candidate.pastHealthMatches)} 기록이 확인됩니다. 이는 현재 증상의 시작 시기를 의미하지 않으며 당시 수술·치료 및 회복 이력으로 참고합니다.`);
    if(!candidate.currentQuestionnaireMatches.length&&!candidate.pastHealthMatches.length&&candidate.negativeMatches.length)parts.push("문진에서는 이 부위의 현재 불편감이 체크되지 않아 홍채 단독 후보의 우선도를 낮췄습니다.");
    else if(!candidate.currentQuestionnaireMatches.length&&!candidate.pastHealthMatches.length)parts.push("문진에서는 이 부위와 직접 일치하는 현재 응답이 확인되지 않았습니다.");
    if(candidate.lifestyleMatches.length)parts.push(`생활습관에서도 ${summarizeMatches(candidate.lifestyleMatches)} 경향이 함께 확인됩니다.`);
    if(candidate.historyMatches.length)parts.push(`과거 병력에서도 ${candidate.name} 관련 기록이 함께 확인됩니다.`);
    if(candidate.irisItems.length)parts.push(`홍채에서는 ${hour}시${[9,10].includes(hour)?" 주변":""} 관련 영역이 함께 관찰되어 교차확인 자료로 반영했습니다.`);
    else parts.push("홍채에서는 같은 영역의 뚜렷한 관찰 신호가 없어 문진과 병력 중심으로 해석했습니다.");
    parts.push(`종합하면 현재는 ${candidate.name} 영역이 관리 우선순위로 표시됩니다.`);
    return parts.join(" ");
  }
  function summarizeMatches(items){return unique(items.slice(0,3).map((item)=>item.label)).join(", ")||"관련 불편감"}
  function summarizeHistoryMatches(items){return unique(items.slice(0,3).map((item)=>`${item.label}${item.value?`(${values(item.value).join(", ")})`:""}`)).join(", ")||"과거 치료"}
  function dedupeResults(groups){const seen=new Set();return groups.filter((group)=>{if(seen.has(group.selected.id))return false;seen.add(group.selected.id);return true})}
  function buildConfidence(results,context){
    if(!context.health)return{irisQuestionnaire:null,history:null,lifestyle:null,overall:null,overallLabel:"낮음",notice:"문진이 없어 홍채 후보의 최종 신뢰도를 낮게 표시합니다."};
    const count=Math.max(1,results.length);
    const questionRate=results.filter((item)=>item.selected.questionnaireMatches.length).length/count;
    const historyRate=results.filter((item)=>item.selected.historyMatches.length).length/count;
    const lifestyleRate=results.filter((item)=>item.selected.lifestyleMatches.length).length/count;
    const irisQuestionnaire=clamp(questionRate*95,0,95);
    const history=context.universe?clamp(25+historyRate*70,0,95):null;
    const lifestyle=clamp(lifestyleRate*95,0,95);
    const irisConfidence=context.observations.length?70:0;
    const components=[[irisQuestionnaire,.4],[lifestyle,.2],[irisConfidence,.1]];
    if(history!==null)components.push([history,.3]);
    const weight=components.reduce((sum,item)=>sum+item[1],0);
    let overall=clamp(components.reduce((sum,[value,itemWeight])=>sum+value*itemWeight,0)/weight,0,95);
    if(history===null)overall=Math.min(overall,79);
    const overallLabel=overall>=80?"높음":overall>=60?"보통":"낮음";
    return{irisQuestionnaire,history,lifestyle,overall,overallLabel,notice:history===null?"유니버스 병력 PDF가 없어 병력 참고도는 확인할 수 없습니다.":"문진, 과거 병력, 생활습관을 우선하고 홍채 관찰은 교차확인에만 반영한 종합값입니다."};
  }

  window.IrisIntegratedReadingEngine={analyze,CANDIDATE_GROUPS};
})();
