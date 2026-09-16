import { router } from "./core/navigation/router.js";
import { registerPay } from "./core/payment/pay-registry.js";
import samsungPay from "./pays/samsung/samsung.js";
import { renderSplash } from "./splash/splash.js";
import { renderHome } from "./home/home.js";

registerPay(samsungPay);

router.register("splash", renderSplash);
router.register("home", renderHome);
samsungPay.registerRoutes(router);

window.PayMaster = { back: () => router.back() };
router.go("splash", {}, {replace:true});
