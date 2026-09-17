import {renderContactlessScreen} from "../../../core/payment/contactless-screen.js";

export function renderNaverContactless(){
  return renderContactlessScreen({
    provider:"N Pay",
    title:"삼성페이 결제",
    accent:"#00e873",
    onDoneRoute:"naver.scan"
  });
}
