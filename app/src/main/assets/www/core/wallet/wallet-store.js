const KEY = "payMaster.wallet.v2";

const DEFAULT = {
  walletId: "CLASS-001-STUDENT-001",
  studentName: "학생",
  currencyName: "학급머니",
  balance: 0,
  history: []
};

function clone(v){
  return JSON.parse(JSON.stringify(v));
}

export function loadWallet(){
  try{
    const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    return {
      ...clone(DEFAULT),
      ...saved,
      history: Array.isArray(saved.history) ? saved.history : []
    };
  }catch{
    return clone(DEFAULT);
  }
}

export function saveWallet(wallet){
  localStorage.setItem(KEY, JSON.stringify(wallet));
}

export function addBalance(amount, memo="교사 충전"){
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  const wallet = loadWallet();
  wallet.balance += value;
  wallet.history.unshift({
    id: makeTxId("TOPUP"),
    type: "topup",
    amount: value,
    memo,
    at: new Date().toISOString()
  });
  saveWallet(wallet);
  return wallet;
}

export function debitBalance(amount, meta={}){
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  const wallet = loadWallet();

  if(value <= 0){
    return {ok:false, reason:"INVALID_AMOUNT", wallet};
  }

  if(wallet.balance < value){
    wallet.history.unshift({
      id: meta.txId || makeTxId("DECLINE"),
      type: "declined",
      amount: value,
      memo: meta.memo || "잔액 부족",
      provider: meta.provider || "",
      at: new Date().toISOString()
    });
    saveWallet(wallet);
    return {ok:false, reason:"INSUFFICIENT_BALANCE", wallet};
  }

  wallet.balance -= value;
  wallet.history.unshift({
    id: meta.txId || makeTxId("PAY"),
    type: "payment",
    amount: value,
    memo: meta.memo || "교육용 결제",
    provider: meta.provider || "",
    method: meta.method || "",
    at: new Date().toISOString()
  });
  saveWallet(wallet);
  return {ok:true, wallet};
}

export function resetWallet(){
  saveWallet(clone(DEFAULT));
  return loadWallet();
}

export function formatMoney(value){
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

export function makeTxId(prefix="TX"){
  const stamp = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2,8).toUpperCase();
  return `${prefix}-${stamp}-${rnd}`;
}

export function walletPresentPayload(provider, method){
  const wallet = loadWallet();
  return [
    "PAYMASTER-WALLET",
    "v=1",
    `wallet=${encodeURIComponent(wallet.walletId)}`,
    `provider=${encodeURIComponent(provider)}`,
    `method=${encodeURIComponent(method)}`,
    `token=${makeTxId("TOKEN")}`
  ].join("|");
}

export function merchantQrPayload(amount, merchant="학급상점"){
  return [
    "PAYMASTER://pay",
    "v=1",
    `amount=${Math.floor(Number(amount) || 0)}`,
    `merchant=${encodeURIComponent(merchant)}`,
    `tx=${makeTxId("SHOP")}`
  ].join("&");
}

export function parseMerchantQr(text){
  if(typeof text !== "string" || !text.startsWith("PAYMASTER://pay")){
    return {ok:false, reason:"NOT_PAYMASTER"};
  }

  const raw = text.split("&").slice(1);
  const params = {};

  for(const item of raw){
    const [k, ...rest] = item.split("=");
    params[k] = decodeURIComponent(rest.join("=") || "");
  }

  const amount = Number(params.amount || 0);

  if(!Number.isInteger(amount) || amount <= 0){
    return {ok:false, reason:"INVALID_AMOUNT"};
  }

  return {
    ok:true,
    amount,
    merchant: params.merchant || "학급상점",
    txId: params.tx || makeTxId("SHOP")
  };
}
