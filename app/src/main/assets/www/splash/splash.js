import {router} from "../core/navigation/router.js";
export function renderSplash(){
 const s=document.createElement("section"); s.className="screen center";
 s.innerHTML='<div style="padding-top:38vh;font-size:42px;font-weight:900">페이의 달인</div><div class="muted" style="margin-top:12px">모바일 결제 연습</div>';
 setTimeout(()=>router.go("home",{}, {replace:true}),1200); return s;
}
