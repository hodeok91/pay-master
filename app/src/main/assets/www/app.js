(() => {
  "use strict";

  const app = document.getElementById("app");
  const btn = document.getElementById("samsungPayBtn");

  if (!app || !btn) return;

  btn.addEventListener("click", () => {
    app.innerHTML = `
      <section class="wallet">
        <div class="wallet-top">
          <h2>Samsung Pay 연습</h2>
          <span class="practice">페이의 달인 · 교육용</span>
        </div>

        <div class="dalin-card">
          <div>
            <div class="title">달인카드</div>
            <p>모바일 결제 연습 카드</p>
          </div>
          <div class="number">•••• •••• •••• 0910</div>
        </div>

        <button class="tip" id="tipBtn" type="button">TIP · 도움 요청하기</button>
      </section>
    `;

    const tip = document.getElementById("tipBtn");
    tip?.addEventListener("click", () => {
      alert("이 화면은 삼성페이 결제 과정을 연습하는 교육용 화면입니다. 다음 버전에서 달인카드 등록 절차를 연결합니다.");
    });
  });
})();
