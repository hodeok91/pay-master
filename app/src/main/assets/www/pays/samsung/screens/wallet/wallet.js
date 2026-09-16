import {router} from "../../../../core/navigation/router.js";
import {load} from "../../../../core/storage/storage.js";
import {dalinCard} from "../../../../core/cards/dalin-card.js";
import {showTip} from "../../../../core/tutorial/tip-engine.js";
export function renderWallet(){
 const state=load(); const registered=!!state.samsung?.cardRegistered;
 const s=document.createElement("section"); s.className="screen samsung";
 s.innerHTML=`<div class="topbar"><span class="wallet-title">Samsung Wallet</span><div class="wallet-actions"><button id="add" style="border:0;background:none;font-size:42px">＋</button><span>⋮</span></div></div>
 <div class="notice">🎫 학생증·수강증을 추가해 편리하게 사용하세요.</div>
 <div class="wallet-card-wrap" id="cardArea">${registered?"":"<div class='muted center' style='font-size:24px'>등록된 달인카드가 없습니다.<br>＋를 눌러 카드를 추가하세요.</div>"}</div>
 <button class="help-btn" id="tip">TIP</button>
 <div class="quick-nav"><span>Ⓟ<br>혜택</span><span>▰<br>빠른 실행</span><span>⌘<br>전체</span></div>`;
 if(registered){ const c=dalinCard(); c.onclick=()=>router.go("samsung.paymentAuth"); s.querySelector("#cardArea").replaceChildren(c); }
 s.querySelector("#add").onclick=()=>router.go("samsung.add");
 s.querySelector("#tip").onclick=()=>showTip(registered?"달인카드를 눌러 결제를 시작하세요.":"오른쪽 위의 + 버튼을 눌러 달인카드를 추가하세요.",registered?".dalin-card":"#add");
 return s;
}
