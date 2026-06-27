(function(){
  const button=document.querySelector("#menuButton");
  const navigation=document.querySelector("#mainNavigation");
  button?.addEventListener("click",()=>{const open=navigation.classList.toggle("open");button.setAttribute("aria-expanded",String(open))});
  navigation?.addEventListener("click",(event)=>{if(event.target.closest("a")){navigation.classList.remove("open");button?.setAttribute("aria-expanded","false")}});
})();
