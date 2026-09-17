import {router} from "../../../../core/navigation/router.js";
import {scanQr} from "../../../../core/native/native-bridge.js";
import {formatMoney} from "../../../../core/wallet/wallet-store.js";
import {installQrResultHandler} from "../../../../core/payment/scan-payment.js";

export function renderPaycoScan(){
  const s = document.createElement("section");
  s.className = "screen payco";

  s.innerHTML = `
    <div class="p-head">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="p-title">결제</div>
        <button id="back" style="border:0;background:none;color:#111;font-size:28px">←</button>
      </div>
      <div class="p-tabs">
        <span>PAYCO 결제</span>
        <span style="color:#111">QR 결제</span>
        <span style="color:#aaa">기업복지</span>
      </div>
    </div>

    <div class="p-scan">
      <div class="p-actions">
        <button>인증코드</button>
        <button>QR 납부기관</button>
      </div>

      <div class="p-frame"></div>

      <div style="position:absolute;top:72%;left:0;right:0;text-align:center">
        <div style="font-size:17px;font-weight:800">키오스크 · 청구서</div>
        <div style="font-size:22px;font-weight:900;margin-top:8px">QR 코드를 스캔해주세요.</div>
        <button id="scan"
                style="margin-top:18px;border:0;border-radius:999px;background:#ef3d4d;padding:12px 22px;font-weight:900">
          QR 스캔
        </button>
        <div id="message" style="margin-top:13px;font-weight:800;padding:0 14px"></div>
      </div>
    </div>
  `;

  const cleanup = installQrResultHandler({
    provider:"payco",
    onSuccess:data=>{
      s.querySelector("#message").innerHTML =
        `<span style="color:#84f5a8">${data.merchant} ${formatMoney(data.amount)} 결제 완료 · 잔액 ${formatMoney(data.wallet.balance)}</span>`;
    },
    onFailure:(reason,msg)=>{
      s.querySelector("#message").innerHTML =
        `<span style="color:#ff9c9c">${msg}</span>`;
    }
  });

  window.PayMasterScreenCleanup = cleanup;

  s.querySelector("#back").onclick = ()=>router.back();
  s.querySelector("#scan").onclick = ()=>scanQr();

  return s;
}
