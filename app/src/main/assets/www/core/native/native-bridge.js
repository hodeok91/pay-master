export function vibrate(ms=40){
  try{
    if(window.AndroidBridge?.vibrate){
      window.AndroidBridge.vibrate(ms);
    }else{
      navigator.vibrate?.(ms);
    }
  }catch{}
}

export function getNfcState(){
  try{
    if(window.AndroidBridge?.getNfcState){
      return window.AndroidBridge.getNfcState();
    }
  }catch{}
  return "UNSUPPORTED";
}

export function startNfcPaymentWindow(durationMs=50000){
  try{
    if(window.AndroidBridge?.startNfcPaymentWindow){
      return !!window.AndroidBridge.startNfcPaymentWindow(durationMs);
    }
  }catch{}
  return false;
}

export function stopNfcPaymentWindow(){
  try{
    window.AndroidBridge?.stopNfcPaymentWindow?.();
  }catch{}
}

export function getHceDiagnostics(){
  try{
    if(window.AndroidBridge?.getHceDiagnostics){
      return JSON.parse(
        window.AndroidBridge.getHceDiagnostics() || "{}"
      );
    }
  }catch{}
  return {};
}

export function resetHceDiagnostics(){
  try{
    window.AndroidBridge?.resetHceDiagnostics?.();
  }catch{}
}


export function generateCode(type, payload, width=520, height=520){
  try{
    if(window.AndroidBridge?.generateCode){
      return window.AndroidBridge.generateCode(
        type,
        payload,
        width,
        height
      ) || "";
    }
  }catch{}
  return "";
}

export function scanQr(){
  try{
    window.AndroidBridge?.scanQr?.();
    return true;
  }catch{}
  return false;
}


export function getDeviceCapabilities(){
  try{
    if(window.AndroidBridge?.getDeviceCapabilities){
      return JSON.parse(window.AndroidBridge.getDeviceCapabilities() || "{}");
    }
  }catch{}
  return {};
}

export function getHceTraceText(){
  try{
    if(window.AndroidBridge?.getHceTraceText){
      return window.AndroidBridge.getHceTraceText() || "";
    }
  }catch{}
  return "";
}

export function copyText(label,text){
  try{
    return !!window.AndroidBridge?.copyText?.(label,text);
  }catch{}
  return false;
}
