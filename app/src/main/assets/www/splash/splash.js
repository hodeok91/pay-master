import {router} from "../core/navigation/router.js";

export function renderSplash(){
  const s = document.createElement("section");
  s.className = "screen center";

  s.innerHTML = `
    <div style="padding-top:37vh;font-size:34px;font-weight:900">
      페이의 달인
    </div>
    <div class="muted" style="margin-top:10px;font-size:14px">
      교육용 모바일 결제 연습
    </div>
  `;

  setTimeout(
    () => router.reset("home"),
    900
  );

  return s;
}
