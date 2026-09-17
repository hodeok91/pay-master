import {router} from "../../../../core/navigation/router.js";
import {screen,bottomButton} from "../common.js";
export function renderPaymentComplete(params={}){
  const s=screen("");
  const amount=Number(params.amount||0); const amountText=amount>0?`${amount.toLocaleString("ko-KR")}원`:"";
  s.innerHTML=`<div class="center" style="padding-top:26vh"><div style="font-size:76px">✓</div><h1>결제가 완료되었습니다</h1>${amountText?`<h2>${amountText}</h2>`:""}<p class="muted">교육용 NFC 결제 연습이 완료되었습니다.</p></div>`;
  bottomButton(s,"완료",()=>router.reset("samsung.wallet")); return s;
}
