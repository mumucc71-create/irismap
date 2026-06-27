(function(){
  "use strict";
  const $=(selector)=>document.querySelector(selector);
  const rawSessionPhone=localStorage.getItem("irisMappingSession")||"";
  const sessionPhone=IrisCareEngine.normalizePhone(rawSessionPhone);
  const subscriptionKey=sessionPhone?`irisSubscription:${sessionPhone}`:"irisSubscription";
  const reportKey=sessionPhone?`UniverseReportDB:${sessionPhone}`:"UniverseReportDB";
  const vipKey=sessionPhone?`irisVipMembership:${sessionPhone}`:"irisVipMembership";
  const subscription=readJson(subscriptionKey)||{};
  let vipMembership=readJson(vipKey)||{};
  const memberRecord=(readJson("irisMappingUsers")||{})[sessionPhone]||{};
  const healthBoxHistory=readJson(sessionPhone?`irisHealthBoxHistory:${sessionPhone}`:"")||[];
  const purchaseHistory=readJson(sessionPhone?`irisPurchaseHistory:${sessionPhone}`:"")||[];
  const analysis=IrisCareEngine.analyze(sessionPhone);
  const isSubscriber=subscription.status==="관리 중"&&Boolean(subscription.plan);
  const canAccess=Boolean(sessionPhone);
  let currentReport=null;

  const AREA_RULES=[
    rule("mouth","구강·치주",["K05","K04","치주","치은","구내","치아","농양"],["치과","치주","잇몸","치아"],[1,10],"구강 위생과 정기 검진 기록을 함께 관리하세요.",18,14),
    rule("stomach","위·소화기",["K30","K21","K25","K26","K27","K29","오메프라졸","란소프라졸","레바미피드","모사프리드","소화불량","위장약"],["소화","속이","복부","역류","위산"],[4],"식사 리듬과 자극적인 음식 반응을 기록하세요.",42,43),
    rule("skin","피부·연조직",["D21","D23","D36","피부","연조직","조직병리"],["피부","여드름","발진","가려움","두피","탈모"],[1,10],"피부 변화와 환경 노출 시점을 함께 기록하세요.",16,29),
    rule("neck","목·얼굴",["D210","목","얼굴","두경부","편도","성대"],["목통증","목 통증","편도","성대","갑상선"],[10],"목·어깨 긴장과 호흡기 불편의 반복 여부를 살펴보세요.",24,22),
    rule("infection","감염·염증",["항생제","세팔로","아목시","클라불란","감염","염증"],["감기","염증","감염","편도","비염"],[2,3,8,10],"반복되는 불편과 회복 기간을 날짜별로 기록하세요.",78,24),
    rule("female","여성생식",["N70","N71","N72","N73","N75","N76","메트로니다졸","질염","난소","자궁"],["생리","질염","분비물","여성","자궁","난소"],[5,6],"주기 변화와 반복되는 불편을 함께 확인하세요.",38,66,"female"),
    rule("male","남성생식",["N40","N41","N42","전립선"],["전립선","배뇨","남성"],[5,6],"배뇨 변화와 관련 검진 기록을 함께 확인하세요.",38,66,"male"),
    rule("bowel","장",["K50","K51","K52","K57","K58","K59","장염","변비","설사"],["변비","설사","장","배변","복부"],[7,8],"배변 리듬과 음식 반응을 꾸준히 기록하세요.",45,48),
    rule("inflammation","염증·통증",["소염","진통","이부프로펜","나프록센","아세클로페낙","통증"],["통증","관절","허리","무릎","어깨"],[5,6,10],"반복 통증의 위치와 악화 습관을 기록하세요.",78,58),
    rule("liver","간",["K70","K71","K72","K73","K74","K75","K76","R74","간수치","간질환"],["간수치","간질환","지방간","음주","피로"],[7],"음주·복용 성분과 간 기능 검사 추이를 확인하세요.",35,39),
    rule("lung","폐·기관지",["J12","J13","J14","J15","J18","J20","J21","J40","J41","J42","J43","J44","기관지","폐렴","천식"],["기침","가래","천식","기관지","호흡"],[2,3,9],"호흡 불편과 흡연·분진 노출을 함께 관리하세요.",38,31),
    rule("pancreas","췌장",["K85","K86","E10","E11","E13","혈당","당대사","췌장"],["혈당","당뇨","과식","단 음식","췌장"],[4],"식사 간격과 혈당 관련 검진 수치를 기록하세요.",41,48),
    rule("kidney","신장",["N00","N01","N02","N03","N04","N05","N10","N11","N12","N17","N18","N19","신장","콩팥"],["부종","소변","신장","콩팥","야간뇨"],[5,6],"수분 섭취와 부종·배뇨 변화를 함께 살펴보세요.",63,48),
    rule("thyroid","갑상선",["E03","E04","E05","E06","갑상선"],["갑상선","목 앞","호르몬"],[10],"기능 검사와 피로·체중 변화를 함께 기록하세요.",24,18),
    rule("lymph","림프",["I88","D72","림프","임파선"],["림프","부종","면역"],[8,10],"부종과 회복 상태, 반복 감염 여부를 살펴보세요.",70,34),
    rule("brain","뇌·신경",["G40","G43","G44","G47","F41","F43","두통","불면","신경"],["두통","수면","불면","스트레스","불안","집중","신경"],[11,12],"수면·긴장·집중력의 변화를 우선 기록하세요.",24,10),
    rule("circulation","순환",["I10","I11","I20","I21","I25","I34","I35","I36","I37","I47","I48","I49","E78","혈압","고지혈","순환"],["혈압","두근거림","순환","손발이 차","고지혈"],[8,9],"혈압·활동량·수면과 정기 검사 추이를 확인하세요.",24,34),
    rule("breast","유방",["N60","N61","N62","N63","유방","유선"],["유방","가슴 멍울"],[9],"정기 검진 일정과 자가 관찰 기록을 관리하세요.",34,28,"female")
  ];
  const POSITION={mouth:[30,10],stomach:[31,39],skin:[23,34],neck:[30,17],infection:[69,25],female:[31,58],male:[31,58],bowel:[31,49],inflammation:[69,59],liver:[29,37],lung:[31,28],pancreas:[34,42],kidney:[69,43],thyroid:[30,18],lymph:[69,31],brain:[69,9],circulation:[31,31],breast:[34,30]};
  const MEDICATION_AREA_TERMS={
    mouth:["치주","치은","구강","치아","잇몸","아목시실린","클라불란","항생제"],
    stomach:["오메프라졸","란소프라졸","레바미피드","모사프리드","제산제","위장약","소화기관용약","소화불량"],
    skin:["피부","연고","항히스타민","스테로이드","조직병리"],
    neck:["목","인후","편도","갑상선","항생제","소염진통제"],
    infection:["항생제","소염진통제","아목시실린","클라불란","세팔로스포린","메트로니다졸"],
    female:["메트로니다졸","질염","여성","자궁","난소","분비물"],
    male:["전립선","비뇨","요로"],
    bowel:["장염","설사","변비","메트로니다졸","유산균","정장제","차전자피"],
    inflammation:["소염진통제","이부프로펜","나프록센","아세클로페낙","진통제","소염제"],
    liver:["간","간수치","밀크씨슬","실리마린","해독"],
    lung:["기관지","기침","가래","천식","흡입제","항히스타민"],
    pancreas:["혈당","당뇨","인슐린","메트포르민","췌장"],
    kidney:["신장","요로","방광","소변","이뇨제","항생제"],
    thyroid:["갑상선","레보티록신","메티마졸","호르몬"],
    lymph:["림프","면역","항생제","항히스타민"],
    brain:["두통","편두통","수면제","항경련제","진정제","신경","G40","G43","G47"],
    circulation:["혈압","고지혈","스타틴","항혈전","심장","순환"],
    breast:["유방","호르몬","여성"]
  };

  initialize();

  function rule(id,name,pdfTerms,healthTerms,irisHours,direction,left,top,gender){return{id,name,pdfTerms,healthTerms,irisHours,direction,left,top,gender}}
  function readJson(key){try{return JSON.parse(localStorage.getItem(key)||"null")}catch(_){return null}}
  function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}
  function safeText(value){return String(value??"").replace(new RegExp("\uC554","g"),"중증 질환").replace(/진단/g,"의료 기록").replace(/확정/g,"확인")}
  function normalizeText(value){return String(value||"").replace(/\s+/g," ").trim()}
  function unique(items){return[...new Set(items.filter(Boolean))]}
  function clamp(value,min=0,max=100){return Math.max(min,Math.min(max,Math.round(value)))}
  function softenSensitiveText(value){
    return String(value??"")
      .replace(/자위\s*습관이나\s*빈도가\s*신경\s*쓰인다/g,"반복되는 습관 행동을 조절하기 어렵다고 느낀다")
      .replace(/자위/g,"반복되는 습관 행동")
      .replace(/음란물\s*시청/g,"자극적인 콘텐츠 사용")
      .replace(/성적\s*충동/g,"충동");
  }

  function initialize(){
    $("#lockedView").hidden=canAccess;
    $("#subscriberView").hidden=!canAccess;
    if(!canAccess)return;
    const savedReports=getHistory();
    if(!vipMembership.active&&savedReports.length)activateVipMembership(savedReports.at(-1)?.PDF파일URL||"기존 유니버스 리포트");
    if(window.pdfjsLib){pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"}
    $("#pdfInput").addEventListener("change",handlePdf);
    $("#saveReportButton").addEventListener("click",saveCurrentReport);
    document.addEventListener("click",handleHealthBoxNavigation);
    document.addEventListener("click",handleReportDelete);
    renderVipBenefit();
    renderStoredHistory();
    if(savedReports.length){
      currentReport=savedReports.at(-1);
      renderReport(currentReport,false);
      setStatus(`${currentReport.구독회차}회차 유니버스 리포트를 복원했습니다.`);
    }
  }

  async function handlePdf(event){
    const file=event.target.files?.[0];
    if(!file)return;
    if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){setStatus("PDF 파일만 선택할 수 있습니다.");return}
    if(!window.pdfjsLib){setStatus("PDF 분석 모듈을 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 다시 열어주세요.");return}
    try{
      setStatus("PDF 텍스트를 추출하고 병력·검사·투약 기록을 정리하고 있습니다.");
      const extracted=await extractPdfText(file);
      if(extracted.text.length<20)throw new Error("PDF에서 읽을 수 있는 텍스트가 충분하지 않습니다. 스캔 이미지 PDF는 문자 인식 처리가 필요합니다.");
      currentReport=buildUniverseReport(extracted.text,file.name,extracted.pages);
      activateVipMembership(file.name);
      persistCurrentReport();
      renderReport(currentReport);
      setStatus("VIP 활성화 완료 · 건강박스 1회 무료 혜택과 유니버스 리포트가 자동 저장되었습니다.");
    }catch(error){console.error(error);setStatus(error.message||"PDF 분석 중 오류가 발생했습니다.")}
  }

  async function extractPdfText(file){
    const bytes=new Uint8Array(await file.arrayBuffer());
    const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
    const pages=[];
    for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber+=1){
      const page=await pdf.getPage(pageNumber);
      const content=await page.getTextContent();
      pages.push(content.items.map((item)=>item.str).join(" "));
    }
    return{text:pages.join("\n"),pages:pdf.numPages};
  }

  function buildUniverseReport(rawText,fileName,pageCount){
    const text=normalizeText(rawText);
    const memberName=extractMemberName(text);
    const logs=extractLogs(text);
    const previous=getHistory().at(-1)||null;
    const familyFindings=analysis.familyFindings||[];
    const personalFindings=(analysis.findings||[]).filter((item)=>item.group!=="familyHistory"&&!/가족|아버지|어머니|형제|자매/.test(item.label));
    const healthText=personalFindings.map((item)=>`${item.label} ${item.value}`).join(" ");
    const familyText=familyFindings.map((item)=>`${item.label} ${item.value}`).join(" ");
    const irisTop=getTopIrisObservations();
    const boxItems=subscription.box||unique(analysis.primary.flatMap((item)=>item.box)).slice(0,8);
    const scores=AREA_RULES.filter((area)=>isAreaApplicable(area)).map((area)=>{
      const pdfMatches=countMatches(text,area.pdfTerms);
      const medicalHistory=pdfMatches>0;
      const repeated=pdfMatches>1;
      const medications=logs.medications.filter((item)=>medicationMatchesArea(area,item));
      const exams=logs.exams.filter((item)=>area.pdfTerms.some((term)=>item.context.includes(term))||generalExamMatches(area,`${item.name||""} ${item.context||""}`));
      const irisMatches=irisTop.filter((item)=>area.irisHours.includes(item.hour));
      const healthMatches=personalFindings.filter((item)=>area.healthTerms.some((term)=>`${item.label} ${item.value}`.includes(term)));
      const rawFamilyMatches=area.healthTerms.filter((term)=>familyText.includes(term));
      const lifestyleMatches=getLifestyleMatches(area,healthText);
      const managed=boxItems.some((item)=>area.healthTerms.some((term)=>item.includes(term)))||analysis.primary.some((item)=>item.hours?.some((hour)=>area.irisHours.includes(hour)));
      const hasPersonalCorroboration=medicalHistory||medications.length>0||exams.length>0||irisMatches.length>0||healthMatches.length>0;
      const familyMatches=hasPersonalCorroboration?rawFamilyMatches:[];
      let score=(medicalHistory?20:0)+(repeated?15:0)+(medications.length?10:0)+(exams.length?15:0)+(irisMatches.length?20:0)+(healthMatches.length?20:0)+(lifestyleMatches.length?15:0)-(managed?10:0);
      const previousScore=previous?.부위별점수JSON?.find((item)=>item.id===area.id)?.score;
      let change="첫 기록";
      if(Number.isFinite(previousScore)){
        if(score<=previousScore-5){score-=10;change="개선 흐름"}
        else if(score>=previousScore+5){score+=10;change="주의 증가"}
        else change="유지";
      }
      score=clamp(score);
      return{...area,score,level:riskLevel(score),pdfMatches,medicalHistory,repeated,medications,exams,irisMatches,healthMatches,familyMatches,rawFamilyMatches,familyReferenceOnly:rawFamilyMatches.length>0&&!hasPersonalCorroboration,lifestyleMatches,managed,change,evidence:collectAreaEvidence(text,area)};
    }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,"ko"));
    const topFive=scores.slice(0,5);
    const shoppingIngredients=unique(analysis.primary.flatMap((item)=>item.ingredients)).slice(0,6);
    const record={
      회원번호:memberRecord.memberNo||sessionPhone,회원명:memberName,업로드일:new Date().toISOString(),PDF파일URL:fileName,PDF페이지수:pageCount,
      추출텍스트:rawText.slice(0,200000),진료로그JSON:logs.visits,진단로그JSON:logs.diagnoses,검사로그JSON:logs.exams,투약로그JSON:logs.medications,
      부위별점수JSON:scores,TOP5부위JSON:topFive.map(compactArea),홍채매칭결과JSON:topFive.flatMap((area)=>area.irisMatches.map((item)=>({부위:area.name,눈:item.eyeLabel,영역:item.code,관찰부위:item.area,점수:item.score}))),
      문진매칭결과JSON:topFive.flatMap((area)=>area.healthMatches.map((item)=>({부위:area.name,문항:item.label,응답:item.value}))),
      최종리포트문구:buildFinalText(topFive),구독회차:getHistory().length+1,건강박스JSON:boxItems,추천성분JSON:shoppingIngredients,
      생활습관점수JSON:analysis.scores,건강박스이력JSON:healthBoxHistory,구매이력JSON:purchaseHistory
    };
    return record;
  }

  function extractMemberName(text){const match=text.match(/([가-힣]{2,4})님의\s*병력|([가-힣]{2,4})의\s*병력|회원명\s*[:：]?\s*([가-힣]{2,5})/);return match?.[1]||match?.[2]||match?.[3]||memberRecord.name||"회원"}
  function extractLogs(text){
    const codeMatches=[...text.matchAll(/\b([A-Z][0-9]{2,4})\b/g)];
    const diagnoses=codeMatches.slice(0,400).map((match)=>({질병코드:match[1],질병명:"부위 통합 전 원문 기록",건수:1,보험내용:"PDF 기록",context:contextAround(text,match.index,70)}));
    const visitDates=[...text.matchAll(/(20\d{2}[.\-/]\s*\d{1,2}[.\-/]\s*\d{1,2})/g)].slice(0,300);
    const visits=visitDates.map((match,index)=>({진료시작일:match[1],병의원약국:"PDF 원문 참조",입원외래:contextAround(text,match.index,35).includes("입원")?"입원":"외래/기타",주상병코드:codeMatches[index]?.[1]||"",주상병명:"신체 부위명으로 통합",내원일수:null,의료비:null}));
    const examNames=["조직병리검사","혈액검사","소변검사","초음파","CT","MRI","내시경","기능검사","영상검사","심전도","심장초음파","간기능검사","신장기능검사","혈당검사","당화혈색소","콜레스테롤","지질검사","위내시경","대장내시경","유방촬영","자궁경부세포검사"];
    const exams=extractNamedContexts(text,examNames).map((item)=>({name:item.name,검사항목명:item.name,검사일:findDate(item.context),context:item.context}));
    exams.push(...extractAdditionalExamRecords(text));
    const medicineNames=["오메프라졸","란소프라졸","레바미피드","모사프리드","메트로니다졸","아목시실린","클라불란","세팔로스포린","이부프로펜","나프록센","아세클로페낙","항생제","소염진통제"];
    const medications=extractNamedContexts(text,medicineNames).map((item)=>({name:item.name,약품명:item.name,효능:"관련 부위 관리 이력 참고",투약일:findDate(item.context),context:item.context}));
    medications.push(...extractAdditionalMedicationRecords(text));
    return{visits,diagnoses,exams:mergeExamRecords(exams),medications:mergeMedicationRecords(medications)};
  }
  function extractNamedContexts(text,names){return names.flatMap((name)=>{const result=[];let index=text.indexOf(name);while(index>=0&&result.length<20){result.push({name,context:contextAround(text,index,80)});index=text.indexOf(name,index+name.length)}return result})}
  function extractAdditionalExamRecords(text){
    const sectionMatch=text.match(/(?:검사로그|검사 이력|검사내역|검사항목|검사일)[\s\S]{0,12000}/);
    const source=sectionMatch?sectionMatch[0]:text;
    const rows=[];
    const rowPattern=/(20\d{2}[.\-/]\s*\d{1,2}[.\-/]\s*\d{1,2})?\s*([가-힣A-Za-z0-9()+./·\-\s]{2,50}(?:검사|촬영|초음파|내시경|CT|MRI|X-ray|엑스레이|심전도|혈색소|콜레스테롤|조직병리|세포검사))/g;
    let match;
    while((match=rowPattern.exec(source))&&rows.length<160){
      const name=normalizeText(match[2]).replace(/^\d+\s*/,"").trim();
      if(name.length<2||/검사로그|검사내역|검사항목|검사일|보험|청구|금액/.test(name))continue;
      rows.push({name,검사항목명:name,검사일:match[1]||findDate(contextAround(source,match.index,120)),context:contextAround(source,match.index,140)});
    }
    const genericPattern=/(?:^|[\n\r。.!?])([^\n\r。.!?]{0,90}(?:검사|검진|검사항목|검사명|시행|결과|판독|촬영|초음파|내시경|CT|MRI|X-ray|엑스레이|심전도|조직|병리|세포|혈액|소변|요검사|간기능|신장기능|혈당|콜레스테롤)[^\n\r。.!?]{0,90})/g;
    while((match=genericPattern.exec(text))&&rows.length<260){
      const context=normalizeText(match[1]);
      if(context.length<6||/검사 0건|검사 없음|검사로그JSON|검사 이력 참고/.test(context))continue;
      const nameMatch=context.match(/([가-힣A-Za-z0-9()+./·\-\s]{2,50}(?:검사|검진|촬영|초음파|내시경|CT|MRI|X-ray|엑스레이|심전도|혈색소|콜레스테롤|조직병리|세포검사|요검사|간기능|신장기능|혈당))/);
      const name=normalizeText(nameMatch?.[1]||context.slice(0,40));
      rows.push({name,검사항목명:name,검사일:findDate(context),context});
    }
    return rows;
  }
  function mergeExamRecords(records){
    const seen=new Set();
    return records.filter((record)=>{
      const key=`${record.name}|${record.검사일||""}|${record.context}`;
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
  }
  function extractAdditionalMedicationRecords(text){
    const names=["오메프라졸","란소프라졸","레바미피드","모사프리드","메트로니다졸","아목시실린","클라불란","세팔로스포린","이부프로펜","나프록센","아세클로페낙","항생제","소염진통제","진통제","소염제","위장약","소화기관용약","제산제","정장제","유산균","수면제","항경련제","진정제","항히스타민","스테로이드","혈압약","고지혈증약","스타틴","이뇨제","메트포르민","인슐린","레보티록신","메티마졸"];
    const named=extractNamedContexts(text,names);
    const sectionMatch=text.match(/(?:투약|약품|처방|복약|의약품)[\s\S]{0,12000}/);
    const source=sectionMatch?sectionMatch[0]:text;
    const rows=[];
    const rowPattern=/([가-힣A-Za-z0-9()+./\-\s]{2,40}(?:정|캡슐|시럽|주|액|산|겔|크림|연고|패취|분말|과립|mg|㎎|ml|mL))\s{1,}/g;
    let match;
    while((match=rowPattern.exec(source))&&rows.length<120){
      const name=normalizeText(match[1]).replace(/^\d+\s*/,"").trim();
      if(name.length<2||/진료|검사|금액|일수|의료|기관|보험|청구|내역/.test(name))continue;
      rows.push({name,context:contextAround(source,match.index,120)});
    }
    return[...named,...rows];
  }
  function mergeMedicationRecords(records){
    const seen=new Set();
    return records.filter((record)=>{
      const key=`${record.name}|${record.context}`;
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
  }
  function medicationMatchesArea(area,item){
    const text=`${item.name||""} ${item.context||""}`;
    const terms=[...(area.pdfTerms||[]),...(MEDICATION_AREA_TERMS[area.id]||[])];
    return terms.some((term)=>term&&text.includes(term));
  }
  function contextAround(text,index,radius){return normalizeText(text.slice(Math.max(0,index-radius),Math.min(text.length,index+radius)))}
  function findDate(text){return text.match(/20\d{2}[.\-/]\s*\d{1,2}[.\-/]\s*\d{1,2}/)?.[0]||"일자 미표기"}
  function countMatches(text,terms){return terms.reduce((sum,term)=>sum+Math.min(5,text.split(term).length-1),0)}
  function collectAreaEvidence(text,area){return unique(area.pdfTerms.filter((term)=>text.includes(term)).map((term)=>/^[A-Z][0-9]/.test(term)?`질병코드 ${term} 계열`:`${safeText(term)} 관련 기록`)).slice(0,6)}
  function generalExamMatches(area,name){
    const text=String(name||"");
    if(/조직병리|세포검사/.test(text))return["skin","neck","breast","female"].includes(area.id);
    if(/심전도|심장초음파/.test(text))return["circulation"].includes(area.id);
    if(/간기능|AST|ALT|GGT|감마|빌리루빈/.test(text))return["liver"].includes(area.id);
    if(/신장기능|소변검사|요검사|크레아티닌|BUN|단백뇨|혈뇨/.test(text))return["kidney"].includes(area.id);
    if(/혈당|당화혈색소|HbA1c/.test(text))return["pancreas"].includes(area.id);
    if(/콜레스테롤|지질/.test(text))return["circulation","liver"].includes(area.id);
    if(/위내시경/.test(text))return["stomach"].includes(area.id);
    if(/대장내시경/.test(text))return["bowel"].includes(area.id);
    if(/초음파/.test(text))return["thyroid","liver","kidney","breast","female","pancreas"].includes(area.id);
    if(/혈액검사/.test(text))return["liver","kidney","circulation","infection","thyroid","pancreas"].includes(area.id);
    return false;
  }
  function isAreaApplicable(area){const gender=String(analysis.health?.profile?.gender||analysis.health?.basic?.gender||"");if(area.gender==="female"&&gender.includes("남"))return false;if(area.gender==="male"&&gender.includes("여"))return false;return true}
  function getLifestyleMatches(area,text){
    const terms={stomach:["불규칙","야식","과식","가공식품"],bowel:["식사","수분","운동 부족"],liver:["음주","술"],lung:["흡연","분진","화학물질"],circulation:["흡연","운동 부족","수면 부족"],brain:["수면","스트레스","야간"],kidney:["수분","소변"],pancreas:["과식","단 음식","야식"],inflammation:["운동 부족","반복 작업"]}[area.id]||[];
    return terms.filter((term)=>text.includes(term));
  }
  function getTopIrisObservations(){return [...analysis.observations].filter((item)=>item.code).sort((a,b)=>(b.score||0)-(a.score||0)).slice(0,6)}
  function riskLevel(score){if(score>=71)return{key:"very",label:"매우 높음"};if(score>=41)return{key:"high",label:"높음"};if(score>=21)return{key:"normal",label:"보통"};return{key:"low",label:"낮음"}}
  function compactArea(area){return{id:area.id,name:area.name,score:area.score,level:area.level.label,change:area.change}}
  function buildFinalText(top){const names=top.filter((item)=>item.score>0).slice(0,3).map((item)=>item.name);return names.length?`회원님의 과거 병력에서는 ${names.join(", ")} 영역이 우선적으로 확인됩니다. 문진과 생활습관을 먼저 살피고, 홍채 관찰 결과를 교차확인하여 부위별 관리 우선도에 반영했습니다.`:"업로드된 기록에서 우선 표시할 부위가 충분하지 않습니다. 정기 기록과 문진을 함께 확인해 주세요."}

  function upgradeMedicationReport(report){
    if(!report?.추출텍스트||!Array.isArray(report.부위별점수JSON))return report;
    const logs=extractLogs(report.추출텍스트);
    if(!logs.medications.length)return report;
    const nextScores=report.부위별점수JSON.map((item)=>{
      const rule=AREA_RULES.find((area)=>area.id===item.id);
      if(!rule)return item;
      const medications=logs.medications.filter((medication)=>medicationMatchesArea(rule,medication));
      if(!medications.length)return item;
      const hadMedications=Array.isArray(item.medications)&&item.medications.length>0;
      const nextScore=clamp((Number(item.score)||0)+(hadMedications?0:10));
      return{...item,medications,score:nextScore,level:riskLevel(nextScore)};
    }).sort((a,b)=>b.score-a.score||String(a.name).localeCompare(String(b.name),"ko"));
    return{...report,투약로그JSON:logs.medications,부위별점수JSON:nextScores,TOP5부위JSON:nextScores.slice(0,5).map(compactArea)};
  }

  function upgradeExamReport(report){
    if(!report?.추출텍스트||!Array.isArray(report.부위별점수JSON))return report;
    const logs=extractLogs(report.추출텍스트);
    if(!logs.exams.length)return report;
    const nextScores=report.부위별점수JSON.map((item)=>{
      const rule=AREA_RULES.find((area)=>area.id===item.id);
      if(!rule)return item;
      const exams=logs.exams.filter((exam)=>rule.pdfTerms.some((term)=>exam.context.includes(term))||generalExamMatches(rule,`${exam.name||""} ${exam.context||""}`));
      if(!exams.length)return item;
      const previous=Array.isArray(item.exams)?item.exams:[];
      const merged=mergeExamRecords([...previous,...exams]);
      const hadExam=previous.length>0;
      const score=clamp((Number(item.score)||0)+(hadExam?0:15));
      return{...item,exams:merged,score,level:riskLevel(score)};
    }).sort((a,b)=>b.score-a.score||String(a.name).localeCompare(String(b.name),"ko"));
    return{...report,검사로그JSON:logs.exams,부위별점수JSON:nextScores,TOP5부위JSON:nextScores.slice(0,5).map(compactArea)};
  }

  function renderReport(report,shouldScroll=true){
    report=upgradeExamReport(upgradeMedicationReport(report));
    currentReport=report;
    $("#report").hidden=false;
    $("#memberMeta").innerHTML=`회원명 ${escapeHtml(report.회원명)} · 분석일 ${new Date(report.업로드일).toLocaleString("ko-KR")} · ${report.PDF페이지수}페이지`;
    const memberInfo=$("#memberInfo");
    if(memberInfo)memberInfo.innerHTML=summaryItems([["회원명",report.회원명],["회원번호",report.회원번호||"세션 정보 없음"],["구독 플랜",subscription.plan||"미표기"],["구독 회차",`${report.구독회차}회차`]]);
    const historyAreas=report.부위별점수JSON.filter((item)=>item.medicalHistory||item.medications?.length||item.exams?.length).slice(0,8);
    $("#historySummary").innerHTML=historyAreas.length?historyAreas.map((item)=>`<div class="summary-item"><strong>${escapeHtml(item.name)}</strong><span>${historySummaryText(item)}</span></div>`).join(""):'<p class="empty">부위로 통합할 병력 텍스트가 확인되지 않았습니다.</p>';
    const interestGroups=new Set(["healthAwareness","foodSafetyAwareness","environmentalExposureAwareness","cookingStorageHabits","supplementUse"]);
    const healthInterestFindings=analysis.findings.filter((item)=>interestGroups.has(item.group)).slice(0,5);
    const symptomFindings=analysis.findings.filter((item)=>!interestGroups.has(item.group)).slice(0,6);
    const healthSummaryEl=$("#healthSummary");
    if(healthSummaryEl)healthSummaryEl.innerHTML="";
    renderBody(report.부위별점수JSON);
    const top=report.부위별점수JSON.slice(0,5);
    const average=top.length?Math.round(top.reduce((sum,item)=>sum+item.score,0)/top.length):0;
    const overallSummaryEl=$("#overallSummary");
    if(overallSummaryEl)overallSummaryEl.innerHTML="";
    const topFiveEl=$("#topFive");
    if(topFiveEl)topFiveEl.innerHTML=top.map((item,index)=>`<div class="top-item"><strong>${index+1}. ${escapeHtml(item.name)} ${item.score}%</strong><span>${item.level.label} · ${item.change}</span></div>`).join("");
    $("#priorities").innerHTML=top.slice(0,3).map((item,index)=>`<div class="priority-item"><strong>${index+1}순위 · ${escapeHtml(item.name)}</strong><p>${escapeHtml(item.direction)}</p></div>`).join("");
    const evidenceGridEl=$("#evidenceGrid");
    if(evidenceGridEl)evidenceGridEl.innerHTML="";
    renderChange(report);
    if(shouldScroll)$("#report").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function summaryItems(items){return items.map(([title,value])=>`<div class="summary-item"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(value)}</span></div>`).join("")}
  function renderBody(scores){
    const bodyLabels=$("#bodyLabels");
    const riskBars=$("#riskBars");
    if(!$("#bodyDots")&&!bodyLabels&&!riskBars)return;
    const visible=scores.filter((item)=>item.score>0).slice(0,14);
    const bodyDots=$("#bodyDots");
    if(bodyDots)bodyDots.innerHTML=visible.map((item)=>{
      const pos=POSITION[item.id]||[50,50];
      return`<span class="body-dot ${item.level.key}" title="${escapeHtml(item.name)}" style="left:${pos[0]}%;top:${pos[1]}%;color:var(--${item.level.key})"></span>`;
    }).join("");
    if(bodyLabels)bodyLabels.innerHTML=visible.map((item)=>{
      const questionnaireMatch=item.healthMatches.length?Math.min(95,55+Math.max(0,item.healthMatches.length-1)*12):0;
      return`<span class="body-label ${item.level.key}"><strong>${escapeHtml(item.name)}</strong><small>문진 일치도 ${questionnaireMatch}%</small><small>관리 우선도 ${escapeHtml(item.level.label)}</small></span>`;
    }).join("");
    if(riskBars)riskBars.innerHTML=scores.slice(0,12).map((item)=>`<div class="risk-row"><span>${escapeHtml(item.name)}</span><div class="track"><div class="fill ${item.level.key}" style="width:${item.score}%"></div></div><span class="risk-value">${item.score}% ${item.level.label}</span></div>`).join("");
  }
  function renderEvidence(item){
    const pdf=item.evidence.length?item.evidence.join(", "):"관련 PDF 기록 없음";
    const iris=item.irisMatches.length?item.irisMatches.map((entry)=>`${entry.eyeLabel} ${entry.code}`).join(", "):"홍채 상위 관찰값 없음";
    const health=item.healthMatches.length?item.healthMatches.map((entry)=>softenSensitiveText(entry.label)).join(", "):"관련 문진 응답 없음";
    const scoring=[item.medicalHistory&&"병력 +20",item.repeated&&"반복 +15",item.medications.length&&"투약 +10",item.exams.length&&"검사 +15",item.irisMatches.length&&"홍채 +20",item.healthMatches.length&&"문진 +20",item.lifestyleMatches.length&&"생활습관 +15",item.familyMatches.length&&"가족력 참고(점수 미반영)",item.managed&&"관리 -10",item.change==="개선 흐름"&&"최근 개선 -10",item.change==="주의 증가"&&"최근 변화 +10"].filter(Boolean).join(" · ");
    return`<article class="evidence"><h3>${escapeHtml(item.name)} ${item.score}%</h3><p><strong>PDF:</strong> ${escapeHtml(pdf)}</p><p><strong>홍채 기반 참고:</strong> ${escapeHtml(iris)}</p><p><strong>문진 기반 참고:</strong> ${escapeHtml(health)}</p><p><strong>계산 근거:</strong> ${escapeHtml(scoring||"기본 참고값")}</p></article>`;
  }
  function historySummaryText(item){
    const parts=[`관련 기록 ${item.pdfMatches||0}건`];
    if(item.medications?.length)parts.push(`투약 ${item.medications.length}건`);
    if(item.exams?.length)parts.push(`검사 ${item.exams.length}건`);
    return parts.join(" · ");
  }
  function renderChange(report){
    const history=getHistory();
    const currentIndex=history.findIndex((item)=>item.업로드일===report.업로드일);
    const previous=currentIndex>0?history[currentIndex-1]:(currentIndex<0?history.at(-1):null);
    if(!previous){$("#changeSummary").innerHTML='<p class="empty">이번 결과가 첫 기준점입니다. 다음 회차부터 부위별 변화를 비교합니다.</p>';return}
    const previousMap=new Map(previous.부위별점수JSON.map((item)=>[item.id,item.score]));
    const changes=report.부위별점수JSON.map((item)=>({name:item.name,delta:item.score-(previousMap.get(item.id)||0)})).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).slice(0,6);
    $("#changeSummary").innerHTML=changes.map((item)=>`<span class="body-label ${item.delta>5?'high':item.delta<-5?'normal':'low'}" style="position:static;display:inline-block;transform:none;margin:4px">${escapeHtml(item.name)} ${item.delta>0?'+':''}${item.delta}%</span>`).join("");
  }
  function setStatus(message){$("#analysisStatus").textContent=message}
  function reportStorageKeys(){
    return unique([reportKey,rawSessionPhone?`UniverseReportDB:${rawSessionPhone}`:"","UniverseReportDB"]).filter(Boolean);
  }
  function getHistory(){
    for(const key of reportStorageKeys()){
      const value=readJson(key);
      if(Array.isArray(value)){
        if(sessionPhone&&key!==reportKey)localStorage.setItem(reportKey,JSON.stringify(value.slice(-12)));
        return value;
      }
    }
    return[];
  }
  function saveHistoryEverywhere(history){
    const next=Array.isArray(history)?history.slice(-12):[];
    reportStorageKeys().forEach((key)=>{
      localStorage.setItem(key,JSON.stringify(next));
    });
  }
  function activateVipMembership(sourceFile){
    if(!sessionPhone)return;
    const now=new Date().toISOString();
    const existingBox=vipMembership.healthBox&&typeof vipMembership.healthBox==="object"?vipMembership.healthBox:null;
    vipMembership={
      ...vipMembership,
      active:true,
      tier:"보험 VIP",
      activatedAt:vipMembership.activatedAt||now,
      updatedAt:now,
      source:"유니버스 PDF 업로드",
      sourceFile:sourceFile||vipMembership.sourceFile||"",
      benefits:["유니버스 리포트","라이프진단","보장분석","홍채 결과 저장","문진 결과 저장","건강박스 1회 무료 제공"],
      healthBox:existingBox||{benefit:"1회 무료 제공",status:"미사용",composition:"운영자 직접 구성",items:[],updatedAt:now}
    };
    localStorage.setItem(vipKey,JSON.stringify(vipMembership));
    renderVipBenefit();
  }
  function renderVipBenefit(){
    const notice=$("#vipBenefitNotice");
    if(!notice)return;
    notice.hidden=!vipMembership.active;
  }
  function handleHealthBoxNavigation(event){
    const link=event.target.closest("[data-healthbox-link]");
    if(!link)return;
    event.preventDefault();
    if(window.parent&&window.parent!==window){
      window.parent.postMessage({type:"iris:navigate",page:"healthbox"},"*");
    }else{
      location.href="ai-health.html#healthbox";
    }
  }
  function persistCurrentReport(){
    if(!currentReport)return false;
    const history=getHistory();
    const existingIndex=history.findIndex((item)=>item.업로드일===currentReport.업로드일);
    if(existingIndex>=0)history[existingIndex]=currentReport;
    else history.push(currentReport);
    saveHistoryEverywhere(history);
    renderStoredHistory();
    return true;
  }
  function saveCurrentReport(){if(!persistCurrentReport())return;setStatus(`${currentReport.구독회차}회차 유니버스 리포트가 회원 기록에 저장되었습니다.`)}
  function renderStoredHistory(){
    const rows=$("#historyRows");if(!rows)return;
    const history=getHistory().slice().reverse();
    rows.innerHTML=history.length?history.map((record,index)=>{const previous=history[index+1];const currentAverage=Math.round(record.TOP5부위JSON.reduce((sum,item)=>sum+item.score,0)/Math.max(1,record.TOP5부위JSON.length));const pastAverage=previous?Math.round(previous.TOP5부위JSON.reduce((sum,item)=>sum+item.score,0)/Math.max(1,previous.TOP5부위JSON.length)):null;const change=pastAverage===null?"기준점":`${currentAverage-pastAverage>0?'+':''}${currentAverage-pastAverage}%`;return`<tr><td>${record.구독회차}회차</td><td>${new Date(record.업로드일).toLocaleDateString("ko-KR")}</td><td>${escapeHtml(record.TOP5부위JSON.slice(0,3).map((item)=>item.name).join(", "))}</td><td>${change}</td></tr>`}).join(""):'<tr><td colspan="4" class="empty">저장된 유니버스 리포트가 없습니다.</td></tr>';
  }
  const baseRenderStoredHistory=renderStoredHistory;
  renderStoredHistory=function(){
    baseRenderStoredHistory();
    addHistoryDeleteButtons();
  };
  function addHistoryDeleteButtons(){
    const rows=[...document.querySelectorAll("#historyRows tr")];
    const history=getHistory().slice().reverse();
    if(!history.length){
      const emptyCell=document.querySelector("#historyRows td.empty");
      if(emptyCell)emptyCell.colSpan=5;
      return;
    }
    rows.forEach((row,index)=>{
      if(!history[index]||row.querySelector("[data-universe-delete-index]"))return;
      const cell=document.createElement("td");
      const button=document.createElement("button");
      button.type="button";
      button.className="button gold universe-delete-report";
      button.dataset.universeDeleteIndex=String(index);
      button.textContent="삭제";
      button.textContent="삭제";
      button.textContent="\uC0AD\uC81C";
      cell.appendChild(button);
      row.appendChild(cell);
    });
  }
  function handleReportDelete(event){
    const button=event.target.closest("[data-universe-delete-index]");
    if(!button)return;
    const history=getHistory();
    const reverseIndex=Number(button.dataset.universeDeleteIndex);
    const deleteIndex=history.length-1-reverseIndex;
    if(!Number.isInteger(deleteIndex)||deleteIndex<0||deleteIndex>=history.length)return;
    history.splice(deleteIndex,1);
    saveHistoryEverywhere(history);
    const updatedHistory=getHistory();
    currentReport=updatedHistory.at(-1)||null;
    renderStoredHistory();
    if(currentReport){
      renderReport(currentReport,false);
      setStatus("선택한 유니버스 회차를 삭제했습니다.");
    }else{
      $("#report").hidden=true;
      setStatus("저장된 유니버스 회차를 모두 삭제했습니다.");
    }
  }
  addHistoryDeleteButtons();
  window.UniverseEngine={buildUniverseReport,extractLogs,riskLevel};
})();
