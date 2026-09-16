# Architecture

app
├─ core
│  ├─ navigation
│  ├─ storage
│  ├─ native
│  ├─ payment
│  ├─ cards
│  └─ tutorial
├─ splash
├─ home
└─ pays
   ├─ samsung
   │  ├─ screens
   │  ├─ data
   │  ├─ tutorial
   │  └─ assets
   ├─ kakao
   └─ naver

Samsung 화면을 다른 결제 모듈이 직접 참조하지 않습니다.
공통 계약이 필요한 기능만 core로 올립니다.
