import {router} from "../../../../core/navigation/router.js";
import {screen} from "../common.js";
import {dalinCard} from "../../../../core/cards/dalin-card.js";
import {
  vibrate,
  getNfcState,
  startNfcPaymentWindow,
  stopNfcPaymentWindow,
  getHceDiagnostics,
  resetHceDiagnostics
} from "../../../../core/native/native-bridge.js";

export function renderPaymentReady(){
  const s = screen("");
  const nfcState = getNfcState();

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

      <div id="nfcWarning"
           style="margin-top:18px;color:#ff9c9c;font-size:17px;font-weight:700"></div>

      <button id="diagToggle"
              style="margin-top:18px;border:1px solid #555;background:#19191b;color:#bbb;border-radius:18px;padding:8px 14px;font-size:14px">
        HCE 진단 보기
      </button>

      <div id="diagPanel"
           style="display:none;width:min(90vw,620px);margin:10px auto 0;padding:14px 16px;background:#111;border:1px solid #333;border-radius:16px;text-align:left;font-size:13px;line-height:1.55;color:#ddd">
        <div style="font-weight:800;margin-bottom:6px">EP-705 / HCE 진단</div>
        <div>NFC/HCE: <span id="diagNfc">-</span></div>
        <div>결제 세션: <span id="diagSession">-</span></div>
        <div>APDU 수신: <span id="diagCount">0회</span></div>
        <div>DALIN AID 선택: <span id="diagAid">아직 없음</span></div>
        <div>마지막 이벤트: <span id="diagEvent">없음</span></div>
        <div>마지막 비활성화: <span id="diagDeactivate">없음</span></div>

        <div style="margin-top:7px;color:#aaa;word-break:break-all">
          마지막 APDU:<br>
          <span id="diagApdu">없음</span>
        </div>

        <div style="margin-top:8px;color:#8f8f94">
          ※ APDU가 0회여도 EP-705의 RF장이 없었다는 뜻은 아닙니다.
          Android HCE 앱은 우리 서비스로 전달된 APDU만 확인할 수 있습니다.
        </div>
      </div>
    </div>
  `;

  const card = dalinCard();
  card.classList.add("payment-card");
  s.querySelector("#card").append(card);

  const warning = s.querySelector("#nfcWarning");

  if(nfcState === "OFF"){
    warning.textContent =
      "휴대전화의 NFC가 꺼져 있습니다. NFC를 켜 주세요.";
  }else if(nfcState === "UNSUPPORTED"){
    warning.textContent =
      "이 기기에서는 NFC 카드 에뮬레이션을 사용할 수 없습니다.";
  }

  resetHceDiagnostics();

  let seconds = 50;
  let stopped = false;

  const armed = startNfcPaymentWindow(50000);

  if(armed){
    vibrate(35);
  }

  const renderDiagnostics = () => {
    const d = getHceDiagnostics();

    s.querySelector("#diagNfc").textContent =
      nfcState === "READY" ? "READY" : nfcState;

    s.querySelector("#diagSession").textContent =
      stopped ? "종료" :
      (armed ? "50초 대기 중" : "활성화 실패");

    s.querySelector("#diagCount").textContent =
      `${Number(d.apduCount || 0)}회`;

    s.querySelector("#diagAid").textContent =
      d.ourAidSelected ? "선택됨" : "아직 없음";

    s.querySelector("#diagEvent").textContent =
      d.lastEvent || "없음";

    s.querySelector("#diagDeactivate").textContent =
      d.lastDeactivateReason || "없음";

    s.querySelector("#diagApdu").textContent =
      d.lastApduHex || "없음";
  };

  s.querySelector("#diagToggle").onclick = () => {
    const panel = s.querySelector("#diagPanel");
    const open = panel.style.display !== "none";

    panel.style.display = open ? "none" : "block";

    s.querySelector("#diagToggle").textContent =
      open ? "HCE 진단 보기" : "HCE 진단 닫기";

    renderDiagnostics();
  };

  renderDiagnostics();

  const diagTimer = setInterval(() => {
    if(!stopped){
      renderDiagnostics();
    }
  }, 300);

  let timer = null;

  const stopSession = () => {
    if(stopped) return;

    stopped = true;

    if(timer){
      clearInterval(timer);
    }

    clearInterval(diagTimer);
    stopNfcPaymentWindow();
    renderDiagnostics();
  };

  timer = setInterval(() => {
    if(stopped) return;

    seconds -= 1;

    const el = s.querySelector("#count");

    if(!el){
      stopSession();
      return;
    }

    el.textContent = String(seconds);
    vibrate(16);

    if(seconds <= 0){
      stopSession();
      vibrate(100);
      router.reset("samsung.wallet");
    }
  }, 1000);

  window.PayMasterHceDiagnostic = () => {
    renderDiagnostics();
  };

  window.PayMasterNfcSuccess = payloadJson => {
    if(stopped) return;

    stopSession();
    vibrate(120);

    let payload = {};

    try{
      payload = typeof payloadJson === "string"
        ? JSON.parse(payloadJson)
        : (payloadJson || {});
    }catch{}

    router.reset("samsung.paymentComplete", {
      transactionId: payload.tx || "",
      amount: payload.amount || 0,
      currency: payload.currency || "KRW"
    });
  };

  window.PayMasterScreenCleanup = () => {
    stopSession();
    window.PayMasterNfcSuccess = null;
    window.PayMasterHceDiagnostic = null;
  };

  return s;
}
