import {renderWallet} from "./screens/wallet/wallet.js";
import {renderAdd} from "./screens/add-card/add-card.js";
import {renderScan} from "./screens/card-scan/card-scan.js";
import {renderInfo} from "./screens/card-info/card-info.js";
import {renderAgreement} from "./screens/agreement/agreement.js";
import {renderPasswordSetup} from "./screens/password/password.js";
import {renderPasswordConfirm} from "./screens/password/password-confirm.js";
import {renderPaymentPassword} from "./screens/password/payment-password.js";
import {renderSignature} from "./screens/signature/signature.js";
import {renderRegistrationComplete} from "./screens/registration-complete/registration-complete.js";
import {renderPaymentReady} from "./screens/payment-ready/payment-ready.js";
import {renderPaymentComplete} from "./screens/payment-complete/payment-complete.js";

export default {
  id:"samsung",
  name:"Samsung Pay 연습",

  registerRoutes(router){
    router.register("samsung.wallet", renderWallet);
    router.register("samsung.add", renderAdd);
    router.register("samsung.scan", renderScan);
    router.register("samsung.info", renderInfo);
    router.register("samsung.agreement", renderAgreement);

    // 최초 카드 등록용 비밀번호 설정
    router.register("samsung.passwordSetup", renderPasswordSetup);
    router.register("samsung.passwordConfirm", renderPasswordConfirm);
    router.register("samsung.signature", renderSignature);
    router.register("samsung.registrationComplete", renderRegistrationComplete);

    // 등록 이후 결제 인증용 비밀번호
    router.register("samsung.paymentPassword", renderPaymentPassword);

    router.register("samsung.paymentReady", renderPaymentReady);
    router.register("samsung.paymentComplete", renderPaymentComplete);
  }
};
