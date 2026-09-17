import {renderPaycoHome} from "./screens/home.js";
import {renderPaycoScan} from "./screens/scan.js";

export default {
  id:"payco",
  name:"PAYCO",
  registerRoutes(router){
    router.register("payco.home", renderPaycoHome);
    router.register("payco.scan", renderPaycoScan);
  }
};
