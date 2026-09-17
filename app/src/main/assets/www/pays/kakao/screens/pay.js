import {router} from "../../../../core/navigation/router.js";
import {
  loadWallet,
  formatMoney,
  walletPresentPayload
} from "../../../../core/wallet/wallet-store.js";
import {
  generateCode,
  scanQr
} from "../../../../core/native/native-bridge.js";
import {installQrResultHandler} from "../../../../core/payment/scan-payment.js";

export function renderKakaoPay(){
  const wallet = loadWallet();
  const s = document.createElement("section");
  s.className = "screen kakao";

  s.innerHTML = `
    <div class="k-header">
      <div class="k-pill">●pay</div>
      <button id="close" style="border:0;background:none;font-size:29px">×</button>
    </div>

    <div class="k-tabs">
      <button class="k-tab active" data-tab="barcode">바코드</button>
      <button class="k-tab" data-tab="samsung">삼성페이</button>
      <button class="k-tab" data-tab="qr">QR스캔</button>
    </div>

    <div id="body"></div>
  `;

  const body = s.querySelector("#body");

  const showBarcode = ()=>{
    const payload = walletPresentPayload("kakao","barcode");
    const img = generateCode("BARCODE",payload,720,220);

    body.innerHTML = `
      <div style="margin:18px;background:white;color:#222;border-radius:24px;padding:22px;text-align:center">
        <div class="muted" style="color:#777">페이머니 · 교육용</div>
        <div style="font-size:26px;font-weight:900;margin:8px 0">${formatMoney(wallet.balance)}</div>
        <img src="${img}" style="width:100%;max-height:160px;object-fit:contain;margin-top:18px">
        <div style="font-size:11px;color:#777;margin-top:10px">PAYMASTER 학급화폐 바코드</div>
      </div>

      <div style="position:absolute;left:14px;right:14px;bottom:24px;display:flex;gap:10px;overflow:hidden">
        ${["페이머니","굿딜","멤버십","학급카드"].map((x,i)=>`
          <div style="min-width:94px;height:138px;border-radius:16px;background:${i===0?"#ffe000":"#25272c"};color:${i===0?"#111":"#fff"};padding:14px;font-weight:900">${x}</div>
        `).join("")}
      </div>
    `;
  };

  const showQr = ()=>{
    body.innerHTML = `
      <div style="padding:32px 22px;text-align:center">
        <div style="font-size:24px;font-weight:900">QR코드를 스캔하세요</div>
        <div style="margin:22px auto;width:72%;aspect-ratio:1;border:2px solid #00dd71;border-radius:22px;display:grid;place-items:center;font-size:70px">⌗</div>
        <button id="scan" class="primary" style="background:#ffd800;color:#111">QR 스캔 시작</button>
        <div id="message" style="margin-top:18px;font-weight:800"></div>
      </div>
    `;

    const cleanup = installQrResultHandler({
      provider:"kakao",
      onSuccess:data=>{
        body.querySelector("#message").innerHTML =
          `<span style="color:#62df8c">${data.merchant} ${formatMoney(data.amount)} 결제 완료<br>잔액 ${formatMoney(data.wallet.balance)}</span>`;
      },
      onFailure:(reason,msg)=>{
        body.querySelector("#message").innerHTML =
          `<span style="color:#ff8a8a">${msg}</span>`;
      }
    });

    window.PayMasterScreenCleanup = cleanup;
    body.querySelector("#scan").onclick = ()=>scanQr();
  };

  s.querySelector("#close").onclick = ()=>router.back();

  s.querySelectorAll(".k-tab").forEach(tab=>{
    tab.onclick = ()=>{
      s.querySelectorAll(".k-tab").forEach(x=>x.classList.remove("active"));
      tab.classList.add("active");

      if(tab.dataset.tab==="barcode") showBarcode();
      if(tab.dataset.tab==="samsung") router.go("kakao.contactless");
      if(tab.dataset.tab==="qr") showQr();
    };
  });

  showBarcode();
  return s;
}
