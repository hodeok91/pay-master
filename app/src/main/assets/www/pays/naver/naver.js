import {renderNaverSplash} from "./screens/splash.js";
import {renderNaverScan} from "./screens/scan.js";
import {renderNaverContactless} from "./screens/contactless.js";

export default {
  id:"naver",
  name:"N Pay",
  registerRoutes(router){
    router.register("naver.splash", renderNaverSplash);
    router.register("naver.scan", renderNaverScan);
    router.register("naver.contactless", renderNaverContactless);
  }
};
