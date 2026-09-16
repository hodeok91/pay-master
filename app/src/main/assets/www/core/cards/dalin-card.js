export function dalinCard({vertical=false}={}){
 const d=document.createElement("div"); d.className="dalin-card"+(vertical?" vertical":"");
 d.innerHTML='<span class="chip"></span><span class="name">달인카드</span><span class="brand">PAY</span>'; return d;
}
