import {renderContactlessScreen} from "../../../core/payment/contactless-screen.js";

export function renderKakaoContactless(){
  return renderContactlessScreen({
    provider:"Kakao Pay",
    title:"삼성페이 결제",
    accent:"#ffd800",
    onDoneRoute:"kakao.pay"
  });
}
