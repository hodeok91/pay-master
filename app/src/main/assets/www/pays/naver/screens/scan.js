import {router} from "../../../../core/navigation/router.js";
import {
  loadWallet,
  formatMoney,
  walletPresentPayload
} from "../../../../core/wallet/wallet-store.js";
import {generateCode,scanQr} from "../../../../core/native/native-bridge.js";
import {installQrResultHandler} from "../../../../core/payment/scan-payment.js";

export function renderNaverScan(){
  const wallet = loadWallet();
  const s = document.createElement("section");
  s.className = "screen naver";

  s.innerHTML = `
    <div style="position:absolute;left:16px;top:14px;z-index:5">
      <button id="back" style="border:0;background:none;font-size:34px">←</button>
    </div>

    <div class="n-tabs">
      <div class="n-tab active" data-tab="scan">QR찍기</div>
      <div class="n-tab" data-tab="show">QR보여주기</div>
      <div class="n-tab" data-tab="samsung">삼성페이</div>
    </div>

    <div id="content"></div>
  `;

  const content = s.querySelector("#content");

  const showScan = ()=>{
    content.innerHTML = `
      <div class="scan-stage">
        <div style="position:absolute;top:18%;left:0;right:0;text-align:center;font-size:25px;font-weight:900;z-index:2">
          QR코드 찍고 결제하세요
        </div>
        <div class="scan-frame">
          <i></i><i></i><i></i><i></i>
          <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:42px;color:#00e872">＋</div>
        </div>
        <button id="scan"
                style="position:absolute;left:25%;right:25%;bottom:12%;border:0;border-radius:999px;background:#00e56f;color:#042114;padding:14px;font-weight:900">
          QR 스캔 시작
        </button>
        <div id="message" style="position:absolute;left:16px;right:16px;bottom:5%;text-align:center;font-weight:800"></div>
      </div>
    `;

    const cleanup = installQrResultHandler({
      provider:"naver",
      onSuccess:data=>{
        content.querySelector("#message").innerHTML =
          `<span style="color:#76ffad">${data.merchant} ${formatMoney(data.amount)} 결제 완료 · 잔액 ${formatMoney(data.wallet.balance)}</span>`;
      },
      onFailure:(reason,msg)=>{
        content.querySelector("#message").innerHTML =
          `<span style="color:#ff9b9b">${msg}</span>`;
      }
    });

    window.PayMasterScreenCleanup = cleanup;
    content.querySelector("#scan").onclick = ()=>scanQr();
  };

  const showQr = ()=>{
    const payload = walletPresentPayload("naver","qr");
    const img = generateCode("QR",payload,520,520);

    content.innerHTML = `
      <div style="padding:34px 20px;text-align:center">
        <div style="font-size:22px;font-weight:900">교육용 N Pay QR</div>
        <img src="${img}"
             style="width:72%;max-width:320px;background:white;padding:12px;border-radius:22px;margin-top:26px">
        <div style="font-size:24px;font-weight:900;margin-top:18px">${formatMoney(wallet.balance)}</div>
        <div class="muted" style="font-size:12px;margin-top:8px">페이의 달인용 학급화폐 코드</div>
      </div>
    `;
  };

  s.querySelector("#back").onclick = ()=>router.back();

  s.querySelectorAll(".n-tab").forEach(tab=>{
    tab.onclick = ()=>{
      s.querySelectorAll(".n-tab").forEach(x=>x.classList.remove("active"));
      tab.classList.add("active");

      if(tab.dataset.tab==="scan") showScan();
      if(tab.dataset.tab==="show") showQr();
      if(tab.dataset.tab==="samsung") router.go("naver.contactless");
    };
  });

  showScan();
  return s;
}
