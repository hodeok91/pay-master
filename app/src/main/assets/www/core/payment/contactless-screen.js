import {router} from "../navigation/router.js";
import {
  startNfcPaymentWindow,
  stopNfcPaymentWindow,
  getNfcState,
  getHceDiagnostics,
  resetHceDiagnostics,
  getDeviceCapabilities,
  getHceTraceText,
  copyText,
  vibrate
} from "../native/native-bridge.js";

export function renderContactlessScreen({
  provider,
  title,
  accent = "#ffffff",
  onDoneRoute
}){
  const s = document.createElement("section");
  s.className = "screen";
  s.style.background = "#050506";

  const caps = getDeviceCapabilities();
  const nfcState = getNfcState();

  s.innerHTML = `
    <div class="topbar" style="justify-content:space-between">
      <button id="back" class="back">‹</button>
      <div style="font-weight:900">${title}</div>
      <span class="education-badge">교육용</span>
    </div>

    <div style="padding:18px;text-align:center">
      <div style="margin:20px auto 0;width:min(78vw,360px);aspect-ratio:1.58;border-radius:24px;background:${accent};color:#111;padding:20px;text-align:left;box-shadow:0 24px 60px #0009">
        <div style="font-size:14px;font-weight:800">${provider}</div>
        <div style="font-size:26px;font-weight:900;margin-top:54px">학급화폐</div>
        <div style="font-size:13px;margin-top:6px">DALIN EDUCATION CARD</div>
      </div>

      <div id="count"
           style="font-size:54px;font-weight:900;margin-top:28px">50</div>

      <div style="font-size:22px;font-weight:900;margin-top:4px">
        휴대폰 뒷면을 RF 리더기에 대세요
      </div>

      <div class="muted" style="font-size:13px;margin-top:8px">
        실제 금융결제가 아닌 교육용 RF/HCE 테스트입니다.
      </div>

      <div id="state"
           style="margin-top:18px;font-weight:800"></div>

      <button id="diag"
              style="margin-top:18px;border:1px solid #444;background:#151515;border-radius:999px;padding:10px 16px">
        RF / MST 진단 보기
      </button>

      <div id="panel"
           class="hidden"
           style="margin-top:12px;background:#111;border:1px solid #333;border-radius:18px;padding:14px;text-align:left;font-size:12px;line-height:1.55">
        <div><b>기기</b>: ${caps.manufacturer || "-"} ${caps.model || "-"}</div>
        <div><b>Android</b>: ${caps.android || "-"} / SDK ${caps.sdk ?? "-"}</div>
        <div><b>NFC/HCE</b>: ${nfcState}</div>
        <div><b>Samsung Wallet 앱</b>: ${caps.samsungPayInstalled ? "감지됨" : "미감지"}</div>
        <div><b>Samsung Pay Framework</b>: ${caps.samsungPayFrameworkInstalled ? "감지됨" : "미감지"}</div>
        <div><b>직접 MST 송신 API</b>: ${caps.directMstApiAvailable ? "사용 가능" : "사용 불가/미공개"}</div>
        <div style="margin-top:8px;color:#aaa">${caps.directMstApiNote || ""}</div>
        <hr style="border:0;border-top:1px solid #333;margin:12px 0">
        <div><b>APDU 수신</b>: <span id="apduCount">0</span>회</div>
        <div><b>DALIN AID 선택</b>: <span id="aidSelected">아직 없음</span></div>
        <div><b>마지막 이벤트</b>: <span id="lastEvent">-</span></div>
        <div><b>비활성화</b>: <span id="deact">-</span></div>
        <hr style="border:0;border-top:1px solid #333;margin:12px 0">
        <div><b>RF field detected</b>: <span id="rfField">UNKNOWN</span></div>
        <div><b>RF field events</b>: <span id="rfEvents">0</span></div>
        <div><b>AID not routed</b>: <span id="aidNotRouted">0</span></div>
        <div><b>AID conflict</b>: <span id="aidConflict">0</span></div>
        <div><b>Last routing event</b>: <span id="routingEvent">-</span></div>
        <div><b>Last routing AID</b>: <span id="routingAid">-</span></div>
        <div><b>Preferred service</b>: <span id="preferredService">UNKNOWN</span></div>
        <div><b>Observe mode</b>: <span id="observeMode">UNKNOWN</span></div>
        <div><b>Off-host selected</b>: <span id="offHostSelection">-</span></div>
        <div><b>NFC internal error</b>: <span id="nfcInternalError">-</span></div>
        <div><b>Last NFC state</b>: <span id="lastNfcState">UNKNOWN</span></div>
        <div style="margin-top:7px;word-break:break-all">
          <b>마지막 APDU</b><br><span id="lastApdu">-</span>
        </div>
        <button id="copy"
                style="margin-top:10px;border:0;border-radius:12px;background:#2b2b2b;padding:9px 12px">
          진단 로그 복사
        </button>
        <div id="copyMsg" style="margin-top:6px;color:#8ee6a8"></div>
      </div>
    </div>
  `;

  resetHceDiagnostics();

  const armed = startNfcPaymentWindow(50000);
  const state = s.querySelector("#state");
  state.textContent =
    nfcState === "READY" && armed
      ? "RF/HCE 결제 대기 중"
      : (nfcState === "OFF"
          ? "NFC가 꺼져 있습니다."
          : "RF/HCE 활성화 실패");

  let seconds = 50;
  let stopped = false;
  let timer = null;
  let diagTimer = null;

  const renderDiag = ()=>{
    const d = getHceDiagnostics();
    s.querySelector("#apduCount").textContent = String(d.apduCount || 0);
    s.querySelector("#aidSelected").textContent =
      d.ourAidSelected ? "선택됨" : "아직 없음";
    s.querySelector("#lastEvent").textContent = d.lastEvent || "-";
    s.querySelector("#deact").textContent = d.lastDeactivateReason || "-";
    s.querySelector("#rfField").textContent = d.remoteFieldDetected || "UNKNOWN";
    s.querySelector("#rfEvents").textContent = String(d.remoteFieldEventCount || 0);
    s.querySelector("#aidNotRouted").textContent = String(d.aidNotRoutedCount || 0);
    s.querySelector("#aidConflict").textContent = String(d.aidConflictCount || 0);
    s.querySelector("#routingEvent").textContent = d.lastRoutingEvent || "-";
    s.querySelector("#routingAid").textContent = d.lastRoutingAid || "-";
    s.querySelector("#preferredService").textContent = d.preferredService || "UNKNOWN";
    s.querySelector("#observeMode").textContent = d.observeMode || "UNKNOWN";
    s.querySelector("#offHostSelection").textContent = d.offHostSelection || "-";
    s.querySelector("#nfcInternalError").textContent = d.lastNfcInternalError || "-";
    s.querySelector("#lastNfcState").textContent = d.lastNfcState || "UNKNOWN";
    s.querySelector("#lastApdu").textContent = d.lastApduHex || "-";
  };

  const stop = ()=>{
    if(stopped) return;
    stopped = true;
    if(timer) clearInterval(timer);
    if(diagTimer) clearInterval(diagTimer);
    stopNfcPaymentWindow();
  };

  timer = setInterval(()=>{
    if(stopped) return;
    seconds -= 1;
    const el = s.querySelector("#count");
    if(!el){ stop(); return; }
    el.textContent = String(seconds);
    vibrate(12);

    if(seconds <= 0){
      stop();
      router.replace(onDoneRoute);
    }
  },1000);

  diagTimer = setInterval(renderDiag,300);

  window.PayMasterHceDiagnostic = renderDiag;

  window.PayMasterNfcSuccess = ()=>{
    stop();
    vibrate(120);
    state.textContent = "교육용 RF 승인 신호를 받았습니다.";
    setTimeout(()=>router.replace(onDoneRoute),800);
  };

  s.querySelector("#back").onclick = ()=>{
    stop();
    router.back();
  };

  s.querySelector("#diag").onclick = ()=>{
    s.querySelector("#panel").classList.toggle("hidden");
    renderDiag();
  };

  s.querySelector("#copy").onclick = ()=>{
    const ok = copyText("PayMaster HCE Trace", getHceTraceText());
    s.querySelector("#copyMsg").textContent =
      ok ? "복사했습니다." : "복사하지 못했습니다.";
  };

  window.PayMasterScreenCleanup = ()=>{
    stop();
    window.PayMasterHceDiagnostic = null;
    window.PayMasterNfcSuccess = null;
  };

  renderDiag();
  return s;
}
