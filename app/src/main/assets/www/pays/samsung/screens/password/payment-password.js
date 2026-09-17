import {router} from "../../../../core/navigation/router.js";
import {keypadScreen} from "./password.js";
import {load} from "../../../../core/storage/storage.js";
import {vibrate} from "../../../../core/native/native-bridge.js";

export function renderPaymentPassword(){
  const state = load();
  const expected = state.samsung?.paymentPassword;

  return keypadScreen(
    "비밀번호",
    "등록한 6자리 결제 비밀번호를 입력하세요.",
    (digits, helpers) => {
      if(!expected || digits !== expected){
        vibrate(70);
        setTimeout(() => {
          const message = document.querySelector("#message");
          if(message) message.textContent = "비밀번호가 올바르지 않습니다.";
        }, 0);
        return false;
      }

      vibrate(60);
      router.go("samsung.paymentReady");
      return true;
    },
    {screenTitle:"결제 비밀번호"}
  );
}
