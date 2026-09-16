import {load,save} from "../storage/storage.js";
export function showTip(message, selector){
  const layer=document.getElementById("tip-layer"); layer.replaceChildren();
  document.querySelectorAll(".tip-target").forEach(x=>x.classList.remove("tip-target"));
  const target=selector?document.querySelector(selector):null; target?.classList.add("tip-target");
  const b=document.createElement("div"); b.className="tip-bubble"; b.textContent=message; layer.append(b);
  const s=load(); s.metrics=s.metrics||{}; s.metrics.tips=(s.metrics.tips||0)+1; save(s);
  setTimeout(()=>{target?.classList.remove("tip-target");layer.replaceChildren()},3500);
}
