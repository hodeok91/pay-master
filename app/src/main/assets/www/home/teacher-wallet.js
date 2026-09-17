import {router} from "../core/navigation/router.js";
import {
  loadWallet,
  addBalance,
  resetWallet,
  formatMoney,
  merchantQrPayload
} from "../core/wallet/wallet-store.js";
import {generateCode} from "../core/native/native-bridge.js";

export function renderTeacherWallet(){
  const s = document.createElement("section");
  s.className = "screen scroll";

  const render = () => {
    const wallet = loadWallet();

    s.innerHTML = `
      <div class="topbar">
        <button class="back" id="back">‹</button>
        <span>교사 학급화폐</span>
      </div>

      <div style="padding:12px 18px 120px">
        <div class="panel" style="padding:18px">
          <div class="muted">현재 잔액</div>
          <div style="font-size:32px;font-weight:900;margin-top:5px">
            ${formatMoney(wallet.balance)}
          </div>
        </div>

        <h2 style="font-size:18px;margin-top:22px">충전</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
          ${[1000,5000,10000].map(v=>`
            <button data-topup="${v}"
              style="border:0;border-radius:16px;background:#27272a;padding:14px 6px;font-weight:800">
              +${v.toLocaleString()}원
            </button>
          `).join("")}
        </div>

        <div class="panel" style="padding:16px;margin-top:16px">
          <div style="font-weight:800;margin-bottom:10px">직접 충전</div>
          <div class="row" style="gap:8px">
            <input id="custom"
                   inputmode="numeric"
                   placeholder="금액"
                   style="min-width:0;flex:1;border:1px solid #444;border-radius:14px;background:#111;color:white;padding:12px">
            <button id="addCustom"
                    style="border:0;border-radius:14px;background:#3f7fff;padding:12px 16px;font-weight:800">
              충전
            </button>
          </div>
        </div>

        <div class="panel" style="padding:16px;margin-top:16px">
          <div style="font-weight:800">테스트 결제 QR 만들기</div>
          <div class="muted" style="font-size:12px;margin:6px 0 10px">
            다른 휴대폰의 페이의 달인 QR 스캔 화면으로 읽으면 학급화폐가 차감됩니다.
          </div>
          <div class="row" style="gap:8px">
            <input id="merchantAmount"
                   inputmode="numeric"
                   value="1000"
                   style="min-width:0;flex:1;border:1px solid #444;border-radius:14px;background:#111;color:white;padding:12px">
            <button id="makeQr"
                    style="border:0;border-radius:14px;background:#ffd600;color:#111;padding:12px 14px;font-weight:900">
              QR 생성
            </button>
          </div>
          <div id="merchantQr" style="display:grid;place-items:center;margin-top:12px"></div>
        </div>

        <button id="reset"
                style="width:100%;margin-top:18px;border:1px solid #633;background:#251717;color:#ffaaaa;border-radius:16px;padding:13px">
          학급화폐 초기화
        </button>
      </div>
    `;

    s.querySelector("#back").onclick = () => router.back();

    s.querySelectorAll("[data-topup]").forEach(b=>{
      b.onclick = () => {
        addBalance(Number(b.dataset.topup));
        render();
      };
    });

    s.querySelector("#addCustom").onclick = () => {
      addBalance(Number(s.querySelector("#custom").value || 0));
      render();
    };

    s.querySelector("#reset").onclick = () => {
      resetWallet();
      render();
    };

    s.querySelector("#makeQr").onclick = () => {
      const amount =
        Number(s.querySelector("#merchantAmount").value || 0);

      if(amount <= 0) return;

      const payload =
        merchantQrPayload(amount, "학급상점");

      const dataUrl =
        generateCode("QR", payload, 520, 520);

      s.querySelector("#merchantQr").innerHTML =
        dataUrl
          ? `<img src="${dataUrl}" style="width:230px;max-width:70vw;border-radius:12px;background:white;padding:8px">`
          : `<div class="muted">QR 생성 실패</div>`;
    };
  };

  render();
  return s;
}
