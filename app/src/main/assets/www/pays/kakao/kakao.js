import {renderKakaoHome} from "./screens/home.js";
import {renderKakaoPay} from "./screens/pay.js";
import {renderKakaoContactless} from "./screens/contactless.js";

export default {
  id:"kakao",
  name:"Kakao Pay",
  registerRoutes(router){
    router.register("kakao.home", renderKakaoHome);
    router.register("kakao.pay", renderKakaoPay);
    router.register("kakao.contactless", renderKakaoContactless);
  }
};
