const organImages = {
  brain: "organs/brain.png",
  eye: "organs/eye.png",
  ear: "organs/ear.png",
  face: "organs/face.png",
  lung: "organs/lung.png",
  bronchus: "organs/bronchus.png",
  heart: "organs/heart.png",
  vessel: "organs/vessel.png",
  stomach: "organs/stomach.png",
  liver: "organs/liver.png",
  gallbladder: "organs/gallbladder.png",
  smallIntestine: "organs/small-intestine.png",
  colon: "organs/colon.png",
  pancreas: "organs/pancreas.png",
  spleen: "organs/spleen.png",
  kidney: "organs/kidney.png",
  bladder: "organs/bladder.png",
  uterus: "organs/uterus.png",
  ovary: "organs/ovary.png",
  prostate: "organs/prostate.png",
  pelvis: "organs/pelvis.png",
  spine: "organs/spine.png",
  thyroid: "organs/thyroid.png",
  tonsil: "organs/tonsil.png",
  lymph: "organs/lymph.png",
  neck: "organs/neck.png",
  shoulder: "organs/shoulder.png",
  diaphragm: "organs/diaphragm.png",
  immune: "organs/immune.png"
};

const irisOrganDB = {
  "1-1": { title: "시상하부·뇌간", image: organImages.brain, functions: ["자율신경 조절", "호르몬 조절", "체온·식욕 조절"], reactions: ["자율신경 불균형 경향", "수면 리듬 부담", "스트레스 반응 증가"] },
  "1-2": { title: "뇌간", image: organImages.brain, functions: ["호흡·각성 조절", "기본 생명 반응", "신경 전달"], reactions: ["신경 피로 경향", "긴장성 반응", "집중력 저하 경향"] },
  "1-3": { title: "안면·삼차신경", image: organImages.face, functions: ["얼굴 감각", "안면 신경 반응", "통증 감각 전달"], reactions: ["안면 긴장 경향", "신경 예민 반응", "두통·눈 피로 경향"] },
  "1-4": { title: "눈", image: organImages.eye, functions: ["시각 인식", "눈 주변 순환", "시신경 반응"], reactions: ["눈 피로 경향", "시각 부담", "안구 건조 경향"] },
  "1-5": { title: "귀·전정기관", image: organImages.ear, functions: ["청각", "평형 감각", "전정기관 반응"], reactions: ["어지럼 경향", "귀 피로", "평형감각 부담"] },
  "1-6": { title: "평형·감각", image: organImages.ear, functions: ["균형 유지", "감각 통합", "자세 조절"], reactions: ["균형감 저하 경향", "감각 예민", "신경 피로"] },

  "2-1": { title: "기관지", image: organImages.bronchus, functions: ["공기 이동 통로", "가스 교환 준비", "점액 분비 조절"], reactions: ["기관지 부담", "기침 경향", "호흡기 예민 반응"] },
  "2-2": { title: "폐 상엽", image: organImages.lung, functions: ["산소 흡수", "폐 조직 기능 유지", "흉부 보호"], reactions: ["폐 기능 저하 경향", "호흡 피로", "산소 흡수 부담"] },
  "2-3": { title: "폐 조직", image: organImages.lung, functions: ["폐포 기능", "산소·이산화탄소 교환", "폐 조직 유지"], reactions: ["폐 조직 부담", "기관지 예민", "호흡 효율 저하 경향"] },
  "2-4": { title: "폐 혈류", image: organImages.vessel, functions: ["폐 혈류 순환", "산소 운반", "혈액 산소화"], reactions: ["혈류 정체 경향", "순환 부담", "호흡 시 피로"] },
  "2-5": { title: "흉막", image: organImages.lung, functions: ["흉막 보호", "폐 확장 보조", "흉부 마찰 감소"], reactions: ["흉부 긴장", "호흡 불편 경향", "늑막 자극 반응"] },
  "2-6": { title: "흉부 림프", image: organImages.lymph, functions: ["림프 순환", "면역 방어", "노폐물 배출"], reactions: ["림프 정체 경향", "면역 부담", "흉부 순환 저하"] },

  "3-1": { title: "기관지", image: organImages.bronchus, functions: ["기관지 통로 유지", "점액 분비", "섬모 운동"], reactions: ["기관지 기능 저하", "기침·가래 경향", "기관지 염증 반응"] },
  "3-2": { title: "폐 상엽", image: organImages.lung, functions: ["산소 흡수", "폐 조직 유지", "흉막 보호"], reactions: ["폐 기능 저하 경향", "산소 흡수 부담", "호흡기 피로"] },
  "3-3": { title: "폐 중심부", image: organImages.lung, functions: ["폐문 순환", "림프 흐름", "신경 신호 전달"], reactions: ["혈류 저하 경향", "림프 정체", "폐 순환 부담"] },
  "3-4": { title: "폐 하엽", image: organImages.lung, functions: ["하부 폐 기능", "산소 교환", "호흡 보조"], reactions: ["폐 하부 부담", "호흡 깊이 저하", "가래·호흡 불편 경향"] },
  "3-5": { title: "흉막·늑막", image: organImages.lung, functions: ["폐 보호", "흉곽 안정", "호흡 마찰 감소"], reactions: ["흉통 경향", "늑막 긴장", "호흡 시 불편"] },
  "3-6": { title: "위", image: organImages.stomach, functions: ["음식 저장", "위산 분비", "소화 준비"], reactions: ["위 기능 저하 경향", "소화불량", "위산 과다·역류 경향"] },

  "4-1": { title: "소장 상부", image: organImages.smallIntestine, functions: ["영양 흡수", "소화 효소 작용", "장 점막 면역"], reactions: ["흡수 부담", "복부 팽만", "장 예민 경향"] },
  "4-2": { title: "맹장·충수", image: organImages.colon, functions: ["장 내용물 이동", "장내 세균 균형", "면역 보조"], reactions: ["장 정체 경향", "가스·팽만", "복부 불편"] },
  "4-3": { title: "하복부", image: organImages.pelvis, functions: ["하복부 장기 지지", "장 운동 보조", "골반 순환"], reactions: ["하복부 냉감 경향", "장 운동 저하", "복부 긴장"] },
  "4-4": { title: "생식기", image: organImages.pelvis, functions: ["생식 기능", "호르몬 반응", "골반 순환"], reactions: ["호르몬 불균형 경향", "골반 순환 부담", "생식기 예민 반응"] },
  "4-5": { title: "허리·요추", image: organImages.spine, functions: ["요추 지지", "신경 전달", "하체 연결"], reactions: ["허리 부담", "요추 긴장", "좌골 신경 자극 경향"] },
  "4-6": { title: "대장 하행", image: organImages.colon, functions: ["대장 내용물 이동", "수분 흡수", "배출 준비"], reactions: ["변비 경향", "장 정체", "복부 팽만"] },

  "5-1": { title: "직장", image: organImages.colon, functions: ["대변 저장", "배출 조절", "장 운동 조절"], reactions: ["변비·설사 경향", "장 정체", "직장 부담"] },
  "5-2": { title: "자궁", image: organImages.uterus, functions: ["자궁 내막 유지", "월경 주기 조절", "호르몬 반응"], reactions: ["자궁 기능 부담", "생리통 경향", "호르몬 불균형"] },
  "5-3": { title: "난소", image: organImages.ovary, functions: ["난자 생성", "여성 호르몬 분비", "주기 조절"], reactions: ["난소 기능 저하 경향", "배란 장애 경향", "호르몬 불균형"] },
  "5-4": { title: "방광", image: organImages.bladder, functions: ["소변 저장", "배뇨 조절", "방광벽 탄성 유지"], reactions: ["방광 예민", "빈뇨 경향", "비뇨기 부담"] },
  "5-5": { title: "신장·부신", image: organImages.kidney, functions: ["혈액 여과", "노폐물 배출", "스트레스 호르몬 조절"], reactions: ["신장 기능 부담", "부종 경향", "피로·스트레스 반응"] },
  "5-6": { title: "요관", image: organImages.kidney, functions: ["소변 운반", "신장-방광 연결", "배출 경로 유지"], reactions: ["요관 정체 경향", "비뇨기 부담", "배뇨 불편 경향"] },

  "6-1": { title: "방광", image: organImages.bladder, functions: ["소변 저장", "배뇨 압력 조절", "방광 중심 기능"], reactions: ["방광 기능 저하", "빈뇨·잔뇨감", "방광 긴장"] },
  "6-2": { title: "전립선·요도", image: organImages.prostate, functions: ["요도 압력 조절", "정액 생성 보조", "배뇨 조절"], reactions: ["전립선 부담", "요도 긴장", "배뇨 불편"] },
  "6-3": { title: "골반 혈관·림프", image: organImages.lymph, functions: ["골반 림프 순환", "혈액 순환", "면역 보조"], reactions: ["골반 림프 정체", "하복부 순환 부담", "부종 경향"] },
  "6-4": { title: "골반 근육·인대", image: organImages.pelvis, functions: ["골반 지지", "자세 안정", "성 기능 보조"], reactions: ["골반 긴장", "요실금 경향", "허리·골반 통증"] },
  "6-5": { title: "항문·괄약근", image: organImages.colon, functions: ["배출 조절", "괄약근 수축", "항문 기능 유지"], reactions: ["치질 경향", "항문 통증", "배변 불편"] },
  "6-6": { title: "꼬리뼈·척추 기저", image: organImages.spine, functions: ["척추 기저 지지", "체중 지지", "골반 연결"], reactions: ["꼬리뼈 통증", "하리 통증", "척추 기저 부담"] },

  "7-1": { title: "간", image: organImages.liver, functions: ["해독 작용", "담즙 생성", "혈당 저장", "지방 대사"], reactions: ["간 기능 저하 경향", "지방간 경향", "독소 축적 경향", "피로·피부 트러블"] },
  "7-2": { title: "담낭·담도", image: organImages.gallbladder, functions: ["담즙 저장", "담즙 배출", "지방 소화 보조"], reactions: ["담즙 정체 경향", "소화불량", "복부 팽만", "우상복부 부담"] },
  "7-3": { title: "소장", image: organImages.smallIntestine, functions: ["영양분 흡수", "소화 효소 작용", "장 점막 면역"], reactions: ["흡수 장애 경향", "복부 팽만", "영양 결핍 경향"] },
  "7-4": { title: "회장", image: organImages.smallIntestine, functions: ["비타민 B12 흡수", "담즙산 재흡수", "장내 면역 유지"], reactions: ["회장 부담", "영양 흡수 저하", "장내 균형 저하"] },
  "7-5": { title: "상행결장·맹장", image: organImages.colon, functions: ["수분 흡수", "장내 세균 균형", "대장 점막 유지"], reactions: ["변비·가스", "장내 독소 축적", "대장 염증 경향"] },
  "7-6": { title: "하복부", image: organImages.pelvis, functions: ["장 운동 조절", "혈액 순환", "림프 순환"], reactions: ["하복부 통증", "림프 순환 저하", "순환 장애 경향"] },

  "8-1": { title: "비장", image: organImages.spleen, functions: ["혈액 여과", "면역세포 조절", "노화 혈구 제거"], reactions: ["면역 저하 경향", "피로", "감염 취약 경향"] },
  "8-2": { title: "횡행결장", image: organImages.colon, functions: ["소화물 이동", "수분 흡수", "배변 준비"], reactions: ["소화불량", "복부 팽만", "장 운동 저하"] },
  "8-3": { title: "췌장", image: organImages.pancreas, functions: ["소화 효소 분비", "인슐린 분비", "혈당 조절"], reactions: ["혈당 불균형", "소화 효소 부족", "체중 변화 경향"] },
  "8-4": { title: "혈액·림프 순환", image: organImages.lymph, functions: ["혈액 순환", "림프 순환", "체내 산소 공급"], reactions: ["림프 정체", "부종", "독소 축적 경향"] },
  "8-5": { title: "면역·순환 보조", image: organImages.immune, functions: ["면역 반응 보조", "항체 생성 지원", "염증 조절"], reactions: ["알레르기 경향", "면역 불균형", "회복 지연"] },

  "9-1": { title: "심장", image: organImages.heart, functions: ["심장 박동", "혈액 펌프", "순환 중심"], reactions: ["심장 부담 경향", "두근거림", "순환 저하"] },
  "9-2": { title: "심장혈관·관상동맥", image: organImages.vessel, functions: ["관상동맥 혈류", "심장 근육 산소 공급", "혈압 보조"], reactions: ["혈관 탄력 저하", "혈압 부담", "흉부 답답함 경향"] },
  "9-3": { title: "폐 하부", image: organImages.lung, functions: ["폐 하부 기능", "산소 흡수", "호흡 조절"], reactions: ["폐 기능 저하", "호흡 곤란 경향", "가래·기침"] },
  "9-4": { title: "흉부·흉벽", image: organImages.lung, functions: ["흉곽 보호", "호흡 운동 보조", "근육 안정"], reactions: ["흉통", "흉부 압박감", "근육 긴장"] },
  "9-5": { title: "횡격막", image: organImages.diaphragm, functions: ["호흡 깊이 조절", "복식호흡", "폐환기 보조"], reactions: ["호흡 얕음", "복부 팽만", "스트레스성 호흡"] },
  "9-6": { title: "순환계·림프", image: organImages.lymph, functions: ["혈액 순환", "림프 수송", "노폐물 배출"], reactions: ["림프 정체", "부종", "피로·독소 축적"] },

  "10-1": { title: "목 부위", image: organImages.neck, functions: ["목 근육 기능", "경추 신경 보호", "혈액·림프 흐름"], reactions: ["목 통증", "경추 부담", "근육 긴장"] },
  "10-2": { title: "어깨", image: organImages.shoulder, functions: ["어깨 관절", "상지 움직임", "근육 지지"], reactions: ["어깨 통증", "회전근개 부담", "팔 저림 경향"] },
  "10-3": { title: "림프 상부", image: organImages.lymph, functions: ["경부 림프 여과", "면역세포 순환", "노폐물 제거"], reactions: ["림프절 부종", "면역 저하", "감염 취약"] },
  "10-4": { title: "갑상선", image: organImages.thyroid, functions: ["대사 조절", "체온 조절", "호르몬 균형"], reactions: ["갑상선 기능 부담", "피로·체중 변화", "호르몬 불균형"] },
  "10-5": { title: "편도선", image: organImages.tonsil, functions: ["상부 호흡기 방어", "세균·바이러스 차단", "면역 활성"], reactions: ["편도염 경향", "만성 목감기", "상부 호흡기 염증"] },
  "10-6": { title: "상부 호흡기", image: organImages.lung, functions: ["비강·부비동 기능", "공기 여과", "면역 방어"], reactions: ["비염·축농증 경향", "알레르기 반응", "호흡기 예민"] },

  "11-1": { title: "전두엽", image: organImages.brain, functions: ["의사결정", "집중력", "논리적 사고"], reactions: ["집중력 저하", "정신 피로", "스트레스 반응"] },
  "11-2": { title: "변연계", image: organImages.brain, functions: ["감정 조절", "기억 형성", "스트레스 반응"], reactions: ["감정 기복", "불안 경향", "기억력 저하"] },
  "11-3": { title: "운동 조절", image: organImages.brain, functions: ["운동 계획", "근육 협응", "신체 균형"], reactions: ["근육 약화", "운동 피로", "손발 저림"] },
  "11-4": { title: "청각", image: organImages.ear, functions: ["청각 인지", "음의 방향 감지", "청각 정보 처리"], reactions: ["이명 경향", "청각 피로", "귀 먹먹함"] },
  "11-5": { title: "평형 감각", image: organImages.ear, functions: ["균형 감각", "자세 유지", "전정기관 조절"], reactions: ["어지럼", "균형감 저하", "멀미 경향"] },
  "11-6": { title: "자율신경", image: organImages.brain, functions: ["스트레스 반응", "심박·호흡 조절", "긴장 이완"], reactions: ["긴장 과다", "불면 경향", "소화 불량"] },

  "12-1": { title: "대뇌피질", image: organImages.brain, functions: ["사고 통합", "인지 기능", "감각 정보 처리"], reactions: ["정신 피로", "기억력 저하", "집중력 저하"] },
  "12-2": { title: "소뇌", image: organImages.brain, functions: ["운동 조정", "균형 유지", "자세 조절"], reactions: ["균형 장애 경향", "손떨림", "운동 실조 경향"] },
  "12-3": { title: "변연계", image: organImages.brain, functions: ["감정 기억", "스트레스 반응", "호르몬 조절"], reactions: ["감정 불안정", "우울·무기력", "불면 경향"] },
  "12-4": { title: "뇌간", image: organImages.brain, functions: ["호흡 조절", "수면·각성", "기본 생명 반응"], reactions: ["피로", "수면 리듬 저하", "긴장성 두통"] },
  "12-5": { title: "시상하부", image: organImages.brain, functions: ["체온 조절", "식욕 조절", "내분비 조절"], reactions: ["호르몬 불균형", "식욕 이상", "체온 변화"] },
  "12-6": { title: "시신경", image: organImages.eye, functions: ["시각 정보 전달", "망막 연결", "눈 피로 조절"], reactions: ["시력 저하 경향", "눈 피로", "안구 건조 경향"] }
};

// 상담용 관찰 결과에 사용하는 위치 DB입니다. 의학적 진단 자료가 아닙니다.
const irisObservationHourMap = {
  1: "눈·정면·이마·전두동",
  2: "기관지·폐",
  3: "폐·기관지·흉부",
  4: "위·췌장",
  5: "신장·요관",
  6: "골반·생식·비뇨",
  7: "간·담낭·소장",
  8: "비장·횡행결장·하행결장",
  9: "심장·폐·순환·흉부",
  10: "목·어깨·림프·갑상선·편도선",
  11: "뇌신경·감각·자율신경",
  12: "뇌·정신·신경"
};

const irisObservationDetailMap = {
  "12-1": "대뇌피질", "12-2": "소뇌", "12-3": "변연계", "12-4": "뇌간", "12-5": "시상하부", "12-6": "눈·귀 신경",
  "3-1": "기관지", "3-2": "기관지 분기부", "3-3": "폐 중심부", "3-4": "폐 하엽", "3-5": "흉막", "3-6": "흉벽",
  "4-1": "위 상부", "4-2": "위 점막", "4-3": "위산 분비", "4-4": "위장 혈관", "4-5": "췌장", "4-6": "췌관",
  "7-1": "간", "7-2": "담낭", "7-3": "소장 상부", "7-4": "소장 하부", "7-5": "맹장", "7-6": "충수",
  "8-1": "비장", "8-2": "횡행결장", "8-3": "하행결장", "8-4": "혈액·림프", "8-5": "면역 보조", "8-6": "순환 보조",
  "10-1": "목", "10-2": "어깨", "10-3": "림프 상부", "10-4": "갑상선", "10-5": "편도선", "10-6": "상부 호흡기"
};

const irisObservationConsultationMap = {
  "췌장": "소화·대사 조절 쪽이 먼저 체크됩니다.",
  "췌관": "소화·대사 흐름 쪽이 함께 체크됩니다.",
  "간": "간 관련 영역이 먼저 체크됩니다.",
  "담낭": "간·담낭 흐름 쪽도 함께 확인됩니다.",
  "변연계": "감정·스트레스 관련 영역은 참고로 봅니다."
};

const irisObservationDB = { right: {}, left: {} };
const irisObservationRingBounds = [0, 16, 33, 50, 66, 83, 100];

["right", "left"].forEach((eyeKey) => {
  for (let hour = 1; hour <= 12; hour += 1) {
    const startAngle = hour === 12 ? 345 : (hour - 1) * 30 + 15;
    const endAngle = hour === 12 ? 15 : hour * 30 + 15;

    for (let ring = 1; ring <= 6; ring += 1) {
      const code = `${hour}-${ring}`;
      const representative = irisObservationDetailMap[code] || irisObservationHourMap[hour];
      irisObservationDB[eyeKey][code] = {
        "영역코드": code,
        "눈구분": eyeKey === "right" ? "우안" : "좌안",
        "시작각도": startAngle,
        "종료각도": endAngle,
        "시작반경": irisObservationRingBounds[ring - 1],
        "종료반경": irisObservationRingBounds[ring],
        "대표부위": representative,
        "상담표현": irisObservationConsultationMap[representative] || `${representative} 관련 영역이 체크됩니다.`
      };
    }
  }
});
