import {router} from "../../../../core/navigation/router.js";
import {keypadScreen} from "./password.js";
import {load,save} from "../../../../core/storage/storage.js";

export function renderPasswordConfirm(){
  return keypadScreen(
    "비밀번호 확인",
    "등록할 비밀번호를 한 번 더 입력하세요.",
    digits => {
      const expected = sessionStorage.getItem("newPayPw");

      if(digits !== expected){
        alert("비밀번호가 같지 않습니다. 처음부터 다시 입력해 주세요.");
        router.replace("samsung.passwordSetup");
        return true;
      }

      const state = load();
      state.samsung = {
        ...(state.samsung || {}),
        paymentPassword: digits
      };
      save(state);

      sessionStorage.removeItem("newPayPw");
      router.go("samsung.signature");
      return true;
    }
  );
}
