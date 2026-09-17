import {router} from "../../../../core/navigation/router.js";
import {screen} from "../common.js";
import {dalinCard} from "../../../../core/cards/dalin-card.js";
import {vibrate,getNfcState,startNfcPaymentWindow,stopNfcPaymentWindow} from "../../../../core/native/native-bridge.js";

export function renderPaymentReady(){
  const s=screen("");
  const nfcState=getNfcState();
  s.innerHTML=`<div style="position:absolute;right:28px;top:24px;color:#aaa;font-weight:800">Samsung Pay</div>
  <div class="payment-wait"><div>🏷 매장쿠폰　|　▥ 멤버십</div><div id="card"></div>
  <div class="payment-timer" id="count">50</div><div class="nfc-wave">)))</div>
  <h2>폰의 뒷면을 카드 리더기에 대세요.</h2><u>가이드 보기</u>
  <div id="nfcWarning" style="margin-top:24px;color:#ff9c9c;font-size:17px;font-weight:700"></div></div>`;
  const card=dalinCard(); card.classList.add("payment-card"); s.querySelector("#card").append(card);
  const warning=s.querySelector("#nfcWarning");
  if(nfcState==="OFF") warning.textContent="휴대전화의 NFC가 꺼져 있습니다. NFC를 켜 주세요.";
  else if(nfcState==="UNSUPPORTED") warning.textContent="이 기기에서는 NFC 카드 에뮬레이션을 사용할 수 없습니다.";

  let seconds=50; let stopped=false;
  const armed=startNfcPaymentWindow(50000); if(armed) vibrate(35);
  const stopSession=()=>{ if(stopped)return; stopped=true; clearInterval(timer); stopNfcPaymentWindow(); };
  const timer=setInterval(()=>{
    if(stopped)return; seconds-=1; const el=s.querySelector("#count");
    if(!el){ stopSession(); return; }
    el.textContent=String(seconds); vibrate(16);
    if(seconds<=0){ stopSession(); vibrate(100); router.reset("samsung.wallet"); }
  },1000);

  window.PayMasterNfcSuccess=payloadJson=>{
    if(stopped)return; stopSession(); vibrate(120);
    let payload={}; try{ payload=typeof payloadJson==="string"?JSON.parse(payloadJson):(payloadJson||{}); }catch{}
    router.reset("samsung.paymentComplete",{transactionId:payload.tx||"",amount:payload.amount||0,currency:payload.currency||"KRW"});
  };
  window.PayMasterScreenCleanup=()=>{ stopSession(); window.PayMasterNfcSuccess=null; };
  return s;
}
