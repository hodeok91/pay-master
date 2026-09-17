import { router } from "./core/navigation/router.js";
import { registerPay } from "./core/payment/pay-registry.js";

import samsungPay from "./pays/samsung/samsung.js";
import kakaoPay from "./pays/kakao/kakao.js";
import naverPay from "./pays/naver/naver.js";
import paycoPay from "./pays/payco/payco.js";

import { renderSplash } from "./splash/splash.js";
import { renderHome } from "./home/home.js";
import { renderTeacherWallet } from "./home/teacher-wallet.js";

[samsungPay,kakaoPay,naverPay,paycoPay].forEach(registerPay);

router.register("splash", renderSplash);
router.register("home", renderHome);
router.register("teacher.wallet", renderTeacherWallet);

samsungPay.registerRoutes(router);
kakaoPay.registerRoutes(router);
naverPay.registerRoutes(router);
paycoPay.registerRoutes(router);

window.PayMaster = {
  nativeBack: () => router.back(),
  back: () => router.back(),
  paymentApproved: () => router.reset("samsung.paymentComplete")
};

router.reset("splash");
