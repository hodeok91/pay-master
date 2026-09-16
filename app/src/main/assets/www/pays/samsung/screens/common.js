import {router} from "../../../core/navigation/router.js";
export function screen(title="", cls=""){
 const s=document.createElement("section"); s.className="screen samsung "+cls;
 if(title) s.innerHTML=`<div class="topbar"><button class="back">‹</button><span>${title}</span></div>`;
 s.querySelector(".back")?.addEventListener("click",()=>router.back()); return s;
}
export function bottomButton(s,label,onClick,id="next"){
 const b=document.createElement("button"); b.id=id;b.className="primary bottom-primary";b.textContent=label;b.onclick=onClick;s.append(b);return b;
}
