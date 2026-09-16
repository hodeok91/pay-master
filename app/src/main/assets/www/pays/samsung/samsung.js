import {renderWallet} from "./screens/wallet/wallet.js";
import {renderAdd} from "./screens/add-card/add-card.js";
import {renderScan} from "./screens/card-scan/card-scan.js";
import {renderInfo} from "./screens/card-info/card-info.js";
import {renderAgreement} from "./screens/agreement/agreement.js";
import {renderFingerprint} from "./screens/fingerprint/fingerprint.js";
import {renderPassword} from "./screens/password/password.js";
import {renderPasswordConfirm} from "./screens/password/password-confirm.js";
import {renderSignature} from "./screens/signature/signature.js";
import {renderRegistrationComplete} from "./screens/registration-complete/registration-complete.js";
import {renderPaymentAuth} from "./screens/payment-auth/payment-auth.js";
import {renderPaymentReady} from "./screens/payment-ready/payment-ready.js";
import {renderPaymentComplete} from "./screens/payment-complete/payment-complete.js";

export default {
 id:"samsung", name:"Samsung Pay 연습",
 registerRoutes(r){
  r.register("samsung.wallet",renderWallet); r.register("samsung.add",renderAdd);
  r.register("samsung.scan",renderScan); r.register("samsung.info",renderInfo);
  r.register("samsung.agreement",renderAgreement); r.register("samsung.fingerprint",renderFingerprint);
  r.register("samsung.password",renderPassword); r.register("samsung.passwordConfirm",renderPasswordConfirm);
  r.register("samsung.signature",renderSignature); r.register("samsung.registrationComplete",renderRegistrationComplete);
  r.register("samsung.paymentAuth",renderPaymentAuth); r.register("samsung.paymentReady",renderPaymentReady);
  r.register("samsung.paymentComplete",renderPaymentComplete);
 }
};
