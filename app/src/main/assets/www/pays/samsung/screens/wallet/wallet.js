import {router} from "../../../../core/navigation/router.js";
import {load} from "../../../../core/storage/storage.js";
import {dalinCard} from "../../../../core/cards/dalin-card.js";
import {showTip} from "../../../../core/tutorial/tip-engine.js";
import {vibrate} from "../../../../core/native/native-bridge.js";

export function renderWallet(){
  const state = load();
  const registered = !!state.samsung?.cardRegistered;

  const s = document.createElement("section");
  s.className = "screen samsung";

  s.innerHTML = `
    <div class="topbar">
      <span class="wallet-title">Samsung Wallet</span>
      <div class="wallet-actions">
        <button id="add" style="border:0;background:none;font-size:42px">＋</button>
        <span>⋮</span>
      </div>
    </div>

    <div class="notice">🎫 학생증·수강증을 추가해 편리하게 사용하세요.</div>

    <div class="wallet-card-wrap" id="cardArea">
      ${registered ? "" : `
        <div class="muted center" style="font-size:24px">
          등록된 달인카드가 없습니다.<br>
          ＋를 눌러 카드를 추가하세요.
        </div>
      `}
    </div>

    <div id="authArea"></div>

    <button class="help-btn" id="tip">TIP</button>

    <div class="quick-nav">
      <span>Ⓟ<br>혜택</span>
      <span>▰<br>빠른 실행</span>
      <span>⌘<br>전체</span>
    </div>
  `;

  if(registered){
    // 실제 결제 진입은 카드 탭이 아니라 카드 아래의 지문/비밀번호 영역에서 시작한다.
    s.querySelector("#cardArea").append(dalinCard());

    const auth = document.createElement("div");
    auth.innerHTML = `
      <div class="registered-payment-auth">
        <button id="walletFp" class="wallet-fingerprint" aria-label="지문 인증">◎</button>
        <button id="walletPw" class="wallet-password">비밀번호</button>
      </div>
      <div class="auth-caption">지문을 1초간 누르거나 비밀번호를 입력하세요.</div>
    `;
    s.querySelector("#authArea").replaceChildren(auth);

    const fp = s.querySelector("#walletFp");
    let holdTimer = null;

    const cancelHold = () => {
      if(holdTimer){
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      fp.classList.remove("holding");
    };

    fp.addEventListener("pointerdown", e => {
      e.preventDefault();
      fp.classList.add("holding");
      holdTimer = setTimeout(() => {
        holdTimer = null;
        fp.classList.remove("holding");
        vibrate(80);
        router.go("samsung.paymentReady");
      }, 1000);
    });

    ["pointerup","pointercancel","pointerleave"].forEach(evt =>
      fp.addEventListener(evt, cancelHold)
    );

    s.querySelector("#walletPw").onclick = () => router.go("samsung.paymentPassword");
  }

  s.querySelector("#add").onclick = () => router.go("samsung.add");

  s.querySelector("#tip").onclick = () => {
    if(registered){
      showTip(
        "카드 아래에서 지문을 1초간 누르거나 비밀번호를 눌러 결제를 시작하세요.",
        ".registered-payment-auth"
      );
    }else{
      showTip(
        "오른쪽 위의 + 버튼을 눌러 달인카드를 추가하세요.",
        "#add"
      );
    }
  };

  return s;
}
