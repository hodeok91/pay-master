import {router} from "../../../../core/navigation/router.js";
import {loadWallet,formatMoney} from "../../../../core/wallet/wallet-store.js";

export function renderKakaoHome(){
  const wallet = loadWallet();
  const s = document.createElement("section");
  s.className = "screen kakao scroll";

  s.innerHTML = `
    <div class="k-header">
      <div class="k-logo">●pay <span class="education-badge">교육용</span></div>
      <div style="font-size:22px">⌕　♧　☰</div>
    </div>

    <div style="padding:8px 14px 110px">
      <div style="display:flex;gap:18px;font-size:18px;font-weight:900;padding:2px 4px 12px">
        <span style="background:#e5e5e5;color:#111;border-radius:14px;padding:10px 14px">마이</span>
        <span class="muted" style="padding:10px 0">투데이</span>
      </div>

      <div class="k-card" style="min-height:120px">
        <div class="muted">학급화폐</div>
        <div style="font-size:28px;font-weight:900;margin-top:9px">
          ${formatMoney(wallet.balance)}
        </div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button id="teacherTopup" style="border:0;border-radius:18px;background:#333;padding:8px 14px">충전</button>
          <button style="border:0;border-radius:18px;background:#ffd800;color:#111;padding:8px 14px;font-weight:900">송금</button>
        </div>
      </div>

      <div class="k-card" style="margin-top:12px">
        <div class="muted" style="font-size:16px">나의 학급머니</div>
        <div style="font-size:24px;font-weight:900;margin-top:6px">${formatMoney(wallet.balance)}</div>
        <div class="muted" style="margin-top:16px;font-size:13px">결제 연습 · QR · 바코드 · NFC</div>
      </div>

      <div class="k-card" style="margin-top:12px">
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;text-align:center;font-size:11px">
          ${["결제내역","사용처","삼성페이","교통카드","결제수단","굿딜","쿠폰함","멤버십","주식뽑기","더보기"].map((x,i)=>`
            <div><div style="font-size:23px;margin-bottom:6px">${["▣","●","Pay","▥","⚙","☺","▯","▰","?","◫"][i]}</div>${x}</div>
          `).join("")}
        </div>
      </div>
    </div>

    <button id="pay" class="k-bottom">결제하기</button>
  `;

  s.querySelector("#pay").onclick = ()=>router.go("kakao.pay");
  s.querySelector("#teacherTopup").onclick = ()=>router.go("teacher.wallet");

  return s;
}
