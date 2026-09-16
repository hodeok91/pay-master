const KEY="payMaster.v1";
const defaults={
  samsung:{cardRegistered:false,paymentPassword:null,signature:false},
  metrics:{tips:0,wrongTaps:0}
};

function cloneDefaults(){
  return JSON.parse(JSON.stringify(defaults));
}

export function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||"{}");
    const base=cloneDefaults();
    return {
      ...base,
      ...saved,
      samsung:{...base.samsung,...(saved.samsung||{})},
      metrics:{...base.metrics,...(saved.metrics||{})}
    };
  }catch{
    return cloneDefaults();
  }
}

export function save(state){
  localStorage.setItem(KEY,JSON.stringify(state));
}

export function reset(){
  localStorage.removeItem(KEY);
}
