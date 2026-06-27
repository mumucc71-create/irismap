(function(){
  "use strict";
  const MEMBER_KEY="irisMappingUsers";
  const CONSULT_KEY="irisShoppingConsultRequests";
  let members=readJson(MEMBER_KEY,{});
  let products=window.ProductDB?.read?.()||[];
  let consultations=readJson(CONSULT_KEY,[]);

  document.querySelectorAll("[data-tab]").forEach(button=>button.addEventListener("click",()=>{
    document.querySelectorAll("[data-tab]").forEach(item=>item.classList.toggle("is-active",item===button));
    document.querySelectorAll("[data-panel]").forEach(panel=>panel.classList.toggle("is-active",panel.dataset.panel===button.dataset.tab));
  }));

  document.querySelector("#memberForm").addEventListener("submit",saveMember);
  document.querySelector("#subscriptionForm").addEventListener("submit",saveSubscription);
  document.querySelector("#memberForm").addEventListener("reset",event=>setTimeout(()=>event.currentTarget.originalPhone.value="",0));

  function renderAll(){
    renderMetrics();renderMembers();renderProducts();renderSubscriptions();renderConsultations();
  }

  function renderMetrics(){
    const subscriptions=readSubscriptions();
    document.querySelector("#memberMetric").textContent=Object.keys(members).length;
    document.querySelector("#productMetric").textContent=products.length;
    document.querySelector("#subscriptionMetric").textContent=subscriptions.filter(item=>item.data.status==="활성"||item.data.active===true).length;
    document.querySelector("#consultMetric").textContent=consultations.filter(item=>!["완료","취소"].includes(item.status)).length;
  }

  function renderMembers(){
    const rows=Object.entries(members).map(([phone,member])=>`<tr><td>${esc(member.memberNo||member.memberNumber||member.id||"-")}</td><td>${esc(member.name||"-")}</td><td>${esc(member.phone||phone)}</td><td>${esc(member.email||"-")}</td><td>${esc(member.joinedAt||member.createdAt||"-")}</td><td><div class="row-actions"><button class="button small" data-member-edit="${esc(phone)}">수정</button><button class="button danger small" data-member-delete="${esc(phone)}">삭제</button></div></td></tr>`).join("");
    document.querySelector("#memberTable").innerHTML=rows?table(["회원번호","이름","전화번호","이메일","가입일","관리"],rows):empty("등록된 회원이 없습니다.");
    document.querySelectorAll("[data-member-edit]").forEach(button=>button.addEventListener("click",()=>editMember(button.dataset.memberEdit)));
    document.querySelectorAll("[data-member-delete]").forEach(button=>button.addEventListener("click",()=>deleteMember(button.dataset.memberDelete)));
  }

  function saveMember(event){
    event.preventDefault();
    const form=event.currentTarget,data=Object.fromEntries(new FormData(form).entries());
    const phone=normalizePhone(data.phone);if(!phone)return alert("전화번호를 입력해 주세요.");
    const original=normalizePhone(data.originalPhone);const prior=members[original]||members[phone]||{};
    if(original&&original!==phone)delete members[original];
    const now=new Date();
    const memberNo=prior.memberNo||`MB${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}${String(Date.now()).slice(-4)}`;
    members[phone]={...prior,memberNo,joinedAt:prior.joinedAt||now.toISOString().slice(0,10),name:data.name.trim(),phone,email:data.email.trim(),address:data.address.trim(),referrer:data.referrer.trim(),updatedAt:now.toISOString()};
    localStorage.setItem(MEMBER_KEY,JSON.stringify(members));form.reset();renderAll();
  }

  function editMember(phone){
    const member=members[phone];if(!member)return;
    const form=document.querySelector("#memberForm");
    form.originalPhone.value=phone;form.name.value=member.name||"";form.phone.value=member.phone||phone;form.email.value=member.email||"";form.address.value=member.address||"";form.referrer.value=member.referrer||"";form.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function deleteMember(phone){
    if(!confirm("이 회원을 회원 목록에서 삭제할까요? 건강 기록과 구독 기록은 안전을 위해 유지됩니다."))return;
    delete members[phone];localStorage.setItem(MEMBER_KEY,JSON.stringify(members));renderAll();
  }

  function renderProducts(){
    const groupName={basic:"기본 필수",personal:"개인별 필수",preference:"기호식품"};
    const rows=products.map(product=>`<tr><td>${product.imageUrl?`<img src="${esc(product.imageUrl)}" alt="">`:"사진 없음"}</td><td>${esc(product.name)}</td><td>${esc(groupName[product.displayGroup]||product.displayGroup||"개인별 필수")}</td><td>${Number(product.salePrice||0).toLocaleString("ko-KR")}원</td><td>${Number(product.stock||0)}</td><td><button class="button small ${product.visible!==false?"primary":""}" data-product-toggle="${esc(product.productId)}">${product.visible!==false?"노출 중":"숨김"}</button></td></tr>`).join("");
    document.querySelector("#productTable").innerHTML=rows?table(["사진","상품","구분","가격","재고","노출"],rows):empty("등록된 상품이 없습니다.");
    document.querySelectorAll("[data-product-toggle]").forEach(button=>button.addEventListener("click",()=>{
      products=products.map(product=>product.productId===button.dataset.productToggle?{...product,visible:product.visible===false}:product);
      products=window.ProductDB.write(products);renderAll();
    }));
  }

  function readSubscriptions(){
    const result=[];for(let index=0;index<localStorage.length;index++){const key=localStorage.key(index);if(!key?.startsWith("irisSubscription:"))continue;result.push({key,phone:key.slice("irisSubscription:".length),data:readJson(key,{})});}return result;
  }

  function renderSubscriptions(){
    const rows=readSubscriptions().map(item=>`<tr><td>${esc(item.phone)}</td><td>${esc(item.data.plan||"-")}</td><td>${esc(item.data.status||"-")}</td><td>${Number(item.data.months||item.data.subscriptionMonths||0)}</td><td>${esc((item.data.box||[]).join?.(", ")||item.data.healthBox||"-")}</td><td><button class="button small" data-subscription-edit="${esc(item.phone)}">수정</button></td></tr>`).join("");
    document.querySelector("#subscriptionTable").innerHTML=rows?table(["전화번호","플랜","상태","개월","건강박스","관리"],rows):empty("등록된 구독 정보가 없습니다.");
    document.querySelectorAll("[data-subscription-edit]").forEach(button=>button.addEventListener("click",()=>editSubscription(button.dataset.subscriptionEdit)));
  }

  function saveSubscription(event){
    event.preventDefault();const form=event.currentTarget,data=Object.fromEntries(new FormData(form).entries());const phone=normalizePhone(data.phone);if(!phone)return alert("전화번호를 입력해 주세요.");
    const key=`irisSubscription:${phone}`,prior=readJson(key,{});const box=data.healthBox.split(",").map(value=>value.trim()).filter(Boolean);
    localStorage.setItem(key,JSON.stringify({...prior,phone,plan:data.plan,status:data.status,active:data.status==="활성",months:Number(data.months||0),subscriptionMonths:Number(data.months||0),box,updatedAt:new Date().toISOString()}));form.reset();renderAll();
  }

  function editSubscription(phone){
    const data=readJson(`irisSubscription:${phone}`,{}),form=document.querySelector("#subscriptionForm");form.phone.value=phone;form.plan.value=data.plan||"베이직";form.status.value=data.status||"활성";form.months.value=data.months||data.subscriptionMonths||0;form.healthBox.value=(data.box||[]).join?.(", ")||data.healthBox||"";form.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function renderConsultations(){
    const rows=consultations.map(item=>`<tr><td>${esc(item.name||"-")}</td><td>${esc(item.phone||"-")}</td><td>${esc(item.availableTime||"-")}</td><td>${esc(formatDate(item.createdAt))}</td><td><select class="status-select" data-consult-status="${esc(item.id)}">${["접수","연락중","완료","취소"].map(value=>`<option ${item.status===value?"selected":""}>${value}</option>`).join("")}</select></td><td><button class="button danger small" data-consult-delete="${esc(item.id)}">삭제</button></td></tr>`).join("");
    document.querySelector("#consultationTable").innerHTML=rows?table(["이름","연락처","상담 가능 시간","신청일","상태","관리"],rows):empty("상담 요청이 없습니다.");
    document.querySelectorAll("[data-consult-status]").forEach(select=>select.addEventListener("change",()=>{consultations=consultations.map(item=>item.id===select.dataset.consultStatus?{...item,status:select.value,updatedAt:new Date().toISOString()}:item);saveConsultations();}));
    document.querySelectorAll("[data-consult-delete]").forEach(button=>button.addEventListener("click",()=>{if(!confirm("상담 요청을 삭제할까요?"))return;consultations=consultations.filter(item=>item.id!==button.dataset.consultDelete);saveConsultations();}));
  }

  function saveConsultations(){localStorage.setItem(CONSULT_KEY,JSON.stringify(consultations));renderAll();}
  function table(headings,rows){return `<table class="data-table"><thead><tr>${headings.map(value=>`<th>${value}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;}
  function empty(message){return `<div class="empty">${message}</div>`;}
  function normalizePhone(value){return String(value||"").replace(/\D/g,"");}
  function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||"null")??fallback}catch(_){return fallback}}
  function formatDate(value){if(!value)return "-";const date=new Date(value);return Number.isNaN(date.getTime())?value:date.toLocaleString("ko-KR");}
  function esc(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
  renderAll();
})();
