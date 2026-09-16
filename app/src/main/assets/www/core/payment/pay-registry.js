const pays=new Map();
export function registerPay(pay){ pays.set(pay.id,pay); }
export function getPays(){ return [...pays.values()]; }
export function getPay(id){ return pays.get(id); }
