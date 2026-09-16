import {router} from "../core/navigation/router.js";
export function renderHome(){
 const s=document.createElement("section"); s.className="screen";
 s.innerHTML=`<div class="topbar">페이의 달인</div>
 <div style="padding:35px 28px"><h1 style="font-size:34px">어떤 페이를 연습할까요?</h1>
 <button id="samsung" class="panel" style="width:100%;border:0;padding:28px;text-align:left;font-size:27px;font-weight:800;margin-top:25px">Samsung Pay 연습<br><small class="muted">달인카드 등록부터 결제까지</small></button>
 <div class="panel muted" style="padding:28px;margin-top:18px;font-size:23px">다른 결제 방식은 이후 모듈로 추가됩니다.</div></div>`;
 s.querySelector("#samsung").onclick=()=>router.go("samsung.wallet"); return s;
}
