export function vibrate(ms=40){
  try{ if(window.AndroidBridge?.vibrate) window.AndroidBridge.vibrate(ms); else navigator.vibrate?.(ms); }catch{}
}
