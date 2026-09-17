import {router} from "../core/navigation/router.js";
import {
  loadWallet,
  formatMoney
} from "../core/wallet/wallet-store.js";

export function renderHome(){
  const wallet = loadWallet();
  const s = document.createElement("section");
  s.className = "screen scroll";

  s.innerHTML = `
    <div class="topbar" style="justify-content:space-between">
      <span>페이의 달인</span>
      <button id="teacher"
              style="border:0;background:#222;border-radius:18px;padding:8px 12px;font-size:13px">
        교사 충전
      </button>
    </div>

    <div style="padding:10px 18px 110px">
      <div class="panel" style="padding:18px;margin-bottom:18px">
        <div class="muted" style="font-size:13px">현재 학급화폐</div>
        <div class="money-text"
             style="font-size:30px;font-weight:900;margin-top:4px">
          ${formatMoney(wallet.balance)}
        </div>
        <div class="muted" style="font-size:12px;margin-top:5px">
          ${wallet.currencyName} · ${wallet.studentName}
        </div>
      </div>

      <h1 style="font-size:25px;margin:8px 0 16px">
        어떤 페이를 연습할까요?
      </h1>

      <div id="providers"
           style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${card("samsung","Samsung Pay","카드 · NFC","⚫")}
        ${card("naver","N Pay","QR 찍기 · QR 보여주기","N")}
        ${card("kakao","Kakao Pay","바코드 · QR · 카드","●pay")}
        ${card("payco","PAYCO","QR 결제 · 스캔","P")}
      </div>

      <div class="panel muted"
           style="margin-top:16px;padding:14px;font-size:12px;line-height:1.55">
        실제 금융결제가 아닌 교육용 학급화폐 시뮬레이터입니다.
        QR·바코드는 페이의 달인용 테스트 코드만 사용합니다.
      </div>
    </div>
  `;

  s.querySelector("#teacher").onclick =
    () => router.go("teacher.wallet");

  s.querySelector('[data-provider="samsung"]').onclick =
    () => router.go("samsung.wallet");

  s.querySelector('[data-provider="naver"]').onclick =
    () => router.go("naver.splash");

  s.querySelector('[data-provider="kakao"]').onclick =
    () => router.go("kakao.home");

  s.querySelector('[data-provider="payco"]').onclick =
    () => router.go("payco.home");

  return s;
}

function card(id,title,sub,icon){
  return `
    <button data-provider="${id}"
      class="panel"
      style="border:0;min-height:132px;padding:18px;text-align:left">
      <div style="font-size:28px;font-weight:900">${icon}</div>
      <div style="font-size:18px;font-weight:900;margin-top:13px">${title}</div>
      <div class="muted" style="font-size:12px;margin-top:4px">${sub}</div>
    </button>
  `;
}
