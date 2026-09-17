import {router} from "../../../core/navigation/router.js";
import {loadWallet,formatMoney} from "../../../core/wallet/wallet-store.js";

export function renderPaycoHome(){
  const wallet = loadWallet();
  const s = document.createElement("section");
  s.className = "screen payco";

  s.innerHTML = `
    <div class="p-head">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="p-title">결제 <span class="education-badge" style="background:#eee;color:#555">교육용</span></div>
        <div style="font-size:24px">▣　♧　MY</div>
      </div>
      <div class="p-tabs">
        <span>PAYCO 결제</span>
        <span style="color:#111">QR 결제</span>
        <span style="color:#aaa">기업복지</span>
      </div>
    </div>

    <div style="padding:22px 18px">
      <div class="panel" style="padding:18px">
        <div class="muted">학급화폐</div>
        <div style="font-size:30px;font-weight:900;margin-top:6px">${formatMoney(wallet.balance)}</div>
      </div>

      <button id="scan"
              style="width:100%;margin-top:18px;border:0;border-radius:22px;background:#222;padding:22px;text-align:left">
        <div style="font-size:22px;font-weight:900">QR 결제</div>
        <div class="muted" style="margin-top:5px">키오스크·청구서 QR 코드를 스캔해요</div>
      </button>
    </div>
  `;

  s.querySelector("#scan").onclick = ()=>router.go("payco.scan");
  return s;
}
