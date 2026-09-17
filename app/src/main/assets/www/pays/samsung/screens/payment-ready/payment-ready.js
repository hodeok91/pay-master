import {router} from "../../../../core/navigation/router.js";
import {screen} from "../common.js";
import {dalinCard} from "../../../../core/cards/dalin-card.js";
import {vibrate} from "../../../../core/native/native-bridge.js";

export function renderPaymentReady(){
  const s = screen("");

  s.innerHTML = `
    <div style="position:absolute;right:28px;top:24px;color:#aaa;font-weight:800">
      Samsung Pay
    </div>

    <div class="payment-wait">
      <div>🏷 매장쿠폰　|　▥ 멤버십</div>
      <div id="card"></div>

      <div class="payment-timer" id="count">50</div>
      <div class="nfc-wave">)))</div>

      <h2>폰의 뒷면을 카드 리더기에 대세요.</h2>
      <u>가이드 보기</u>
    </div>
  `;

  const card = dalinCard();
  card.classList.add("payment-card");
  s.querySelector("#card").append(card);

  let seconds = 50;
  let stopped = false;

  // 결제 대기 화면에 들어오는 순간부터 자동으로 결제 대기 상태가 시작된다.
  vibrate(35);

  const finishTimeout = () => {
    if(stopped) return;
    stopped = true;
    clearInterval(timer);
    vibrate(100);
    router.reset("samsung.wallet");
  };

  const timer = setInterval(() => {
    if(stopped) return;

    seconds -= 1;

    const el = s.querySelector("#count");
    if(!el){
      stopped = true;
      clearInterval(timer);
      return;
    }

    el.textContent = String(seconds);

    // 실제 화면처럼 카운트가 바뀔 때마다 짧은 햅틱.
    vibrate(16);

    if(seconds <= 0){
      finishTimeout();
    }
  }, 1000);

  // 향후 실제 NFC/키오스크 브리지가 승인 신호를 주면 이 함수가 호출될 수 있다.
  window.PayMasterNfcSuccess = () => {
    if(stopped) return;
    stopped = true;
    clearInterval(timer);
    vibrate(120);
    router.reset("samsung.paymentComplete");
  };

  return s;
}
