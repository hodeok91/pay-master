const KEY="payMaster.v1";
const defaults={ samsung:{cardRegistered:false,paymentPassword:null,signature:false}, metrics:{tips:0,wrongTaps:0} };
export function load(){ try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return structuredClone(defaults)} }
export function save(state){ localStorage.setItem(KEY,JSON.stringify(state)); }
export function reset(){ localStorage.removeItem(KEY); }
