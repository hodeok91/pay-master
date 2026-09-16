import {router} from "../../../../core/navigation/router.js"; import {screen} from "../common.js";
export function renderAdd(){const s=screen("추가");s.innerHTML+=`<div class="panel" style="margin:10px 20px;padding:10px 28px">
${["💳 결제 카드","🟡 머니·포인트","🚇 교통카드","▰ 계좌","▥ 멤버십","🏷 쿠폰","🛡 삼성 패스","🪪 모바일 신분증","🔑 디지털 키","🎫 탑승권"].map((x,i)=>`<div data-i="${i}" style="padding:23px 0;border-bottom:1px solid #3b3b3d;font-size:27px;font-weight:800">${x}</div>`).join("")}</div>`;
s.querySelector('[data-i="0"]').onclick=()=>router.go("samsung.scan");return s;}
