import {router} from "../../../../core/navigation/router.js";
import {screen,bottomButton} from "../common.js";
import {dalinCard} from "../../../../core/cards/dalin-card.js";
import {load,save} from "../../../../core/storage/storage.js";

export function renderRegistrationComplete(){
  const state = load();
  state.samsung = {
    ...(state.samsung || {}),
    cardRegistered: true
  };
  save(state);

  const s = screen("");

  s.innerHTML = `
    <div style="position:absolute;right:30px;top:22px;color:#aaa;font-weight:800">Samsung Pay</div>
    <div class="center" style="padding-top:100px">
      <h1 style="font-size:34px">카드 추가 완료</h1>
      <div id="card" style="display:grid;place-items:center;margin-top:60px"></div>
      <h2>달인카드</h2>
      <div class="muted">교육용 카드 이미지입니다.</div>
    </div>
  `;

  s.querySelector("#card").append(dalinCard());

  bottomButton(
    s,
    "완료",
    () => router.reset("samsung.wallet")
  );

  return s;
}
