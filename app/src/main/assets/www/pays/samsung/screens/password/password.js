import {router} from "../../../../core/navigation/router.js";
import {screen} from "../common.js";

export function renderPasswordSetup(){
  return keypadScreen(
    "결제 비밀번호 등록",
    "결제할 때 사용할 6자리 비밀번호를 등록하세요.",
    digits => {
      sessionStorage.setItem("newPayPw", digits);
      router.go("samsung.passwordConfirm");
    }
  );
}

export function keypadScreen(title, sub, onDone, options = {}){
  const s = screen(options.screenTitle || title);

  s.innerHTML += `
    <div class="center" style="padding-top:70px">
      <h1>${title}</h1>
      <div class="muted">${sub}</div>
      <div class="dots" id="dots">○ ○ ○ ○ ○ ○</div>
      <div id="message" style="height:30px;margin-top:12px;color:#ff8b8b;font-weight:700"></div>
      <div class="keypad">
        ${[1,2,3,4,5,6,7,8,9,"⌫",0,"↻"].map(x=>`<button>${x}</button>`).join("")}
      </div>
    </div>
  `;

  let digits = "";
  let locked = false;

  const redraw = () => {
    s.querySelector("#dots").textContent =
      [0,1,2,3,4,5].map(i => i < digits.length ? "●" : "○").join(" ");
  };

  const clear = (message = "") => {
    digits = "";
    redraw();
    s.querySelector("#message").textContent = message;
  };

  s.querySelectorAll(".keypad button").forEach(button => {
    button.onclick = () => {
      if(locked) return;

      const value = button.textContent;

      if(value === "⌫"){
        digits = digits.slice(0,-1);
      }else if(value === "↻"){
        digits = "";
      }else if(digits.length < 6){
        digits += value;
      }

      redraw();

      if(digits.length === 6){
        locked = true;
        setTimeout(() => {
          const result = onDone(digits, {clear});
          if(result === false){
            locked = false;
            clear();
          }
        }, 130);
      }
    };
  });

  return s;
}
