export function vibrate(ms=40){
  try{ if(window.AndroidBridge?.vibrate) window.AndroidBridge.vibrate(ms); else navigator.vibrate?.(ms); }catch{}
}
export function getNfcState(){
  try{ if(window.AndroidBridge?.getNfcState) return window.AndroidBridge.getNfcState(); }catch{}
  return "UNSUPPORTED";
}
export function startNfcPaymentWindow(durationMs=50000){
  try{ if(window.AndroidBridge?.startNfcPaymentWindow) return !!window.AndroidBridge.startNfcPaymentWindow(durationMs); }catch{}
  return false;
}
export function stopNfcPaymentWindow(){
  try{ window.AndroidBridge?.stopNfcPaymentWindow?.(); }catch{}
}
