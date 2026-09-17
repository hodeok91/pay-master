import {router} from "../../../core/navigation/router.js";

export function renderNaverSplash(){
  const s = document.createElement("section");
  s.className = "screen naver center";
  s.innerHTML = `
    <div style="padding-top:43vh">
      <div class="n-splash-logo">Ⓝ pay</div>
      <div class="education-badge" style="margin-top:12px">교육용</div>
    </div>
  `;
  setTimeout(()=>router.replace("naver.scan"),700);
  return s;
}
