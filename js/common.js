/* Copyright (c) 2026 geniuskey and MemoryBook contributors.
   Executable code: MIT (see ../LICENSE-MIT).
   Educational content and illustrations: CC-BY-4.0 (see ../LICENSE.md). */
/* ==========================================================================
   MemoryBook 공통 스크립트 — 전역 객체 MB
   - 레이아웃(상단바, 목차, 이전/다음, 테마) 자동 생성
   - 시뮬레이터 헬퍼: canvas, chart, range, seg, 색/난수/포맷, three.js 씬
   이 파일은 <head>에서 defer 없이 로드된다. 페이지 스크립트는 </body> 직전에 둔다.
   ========================================================================== */
(function () {
  "use strict";

  const CHAPTERS = [
    { slug: "hierarchy",   num: "01", title: "메모리 계층 구조",          desc: "레지스터부터 SSD까지. 지연·대역폭·용량의 트레이드오프, 지역성과 메모리 월.", tags: ["기초", "sim"] },
    { slug: "device",      num: "02", title: "메모리 소자 물리",          desc: "MOSFET 스위치, 누설 전류, 커패시터와 전하 저장, 양자 터널링. 비트를 붙잡는 물리.", tags: ["반도체", "sim"] },
    { slug: "sram",        num: "03", title: "SRAM과 캐시",              desc: "6T 셀, 버터플라이 곡선과 SNM, 읽기/쓰기 안정성, 센스 앰프와 캐시 구조.", tags: ["회로", "sim"] },
    { slug: "dram-cell",   num: "04", title: "DRAM 셀과 어레이",          desc: "1T1C 셀, 전하 공유와 비트라인 센싱, 매립 워드라인·실린더 커패시터를 3D로.", tags: ["구조", "3d", "sim"] },
    { slug: "dram-ops",    num: "05", title: "DRAM 동작과 타이밍",        desc: "ACT·RD·WR·PRE 명령, tRCD·CL·tRP, 뱅크와 로우 버퍼, 리프레시.", tags: ["동작", "sim"] },
    { slug: "interface",   num: "06", title: "DDR·LPDDR·GDDR 인터페이스", desc: "DDR 신호, 버스트, 아이 다이어그램, ODT·트레이닝, PAM4. 세대별 대역폭 계산.", tags: ["시스템", "sim"] },
    { slug: "hbm",         num: "07", title: "HBM과 3D 적층",            desc: "TSV와 마이크로범프, 1024비트 버스, 인터포저·CoWoS, HBM3E·HBM4를 3D로.", tags: ["패키징", "3d", "sim"] },
    { slug: "nand",        num: "08", title: "NAND 플래시 셀",           desc: "플로팅 게이트·차지 트랩, FN 터널링, 프로그램/소거, Vt 분포와 SLC~QLC.", tags: ["비휘발", "sim"] },
    { slug: "vnand",       num: "09", title: "3D NAND",                 desc: "수직 채널과 수백 단 적층, 채널 홀·계단 구조·CMOS 언더 어레이를 3D로.", tags: ["구조", "3d", "sim"] },
    { slug: "ssd",         num: "10", title: "SSD와 플래시 컨트롤러",     desc: "FTL, 가비지 컬렉션, 쓰기 증폭, 웨어 레벨링, 오버 프로비저닝, NVMe.", tags: ["시스템", "sim"] },
    { slug: "reliability", num: "11", title: "신뢰성과 오류 정정",        desc: "리텐션, 로우 해머, 디스터브, 내구성. 해밍 코드부터 LDPC까지 ECC.", tags: ["신뢰성", "sim"] },
    { slug: "emerging",    num: "12", title: "차세대 메모리와 PIM·CIM",   desc: "MRAM·PCM·ReRAM·FeRAM, CXL 메모리 확장, 뱅크 옆 연산(PIM)과 셀 어레이 연산(CIM).", tags: ["트렌드", "sim"] },
    { slug: "design",      num: "13", title: "메모리 시스템 설계",        desc: "루프라인 모델과 AI 가속기 메모리 선택. 대역폭·용량·전력을 직접 설계해 보자.", tags: ["종합", "sim"] },
    { slug: "process",     num: "14", title: "메모리 제조 공정",          desc: "리소그래피·식각·증착의 반복. EUV와 멀티 패터닝, 고종횡비 식각, ALD로 셀을 쌓는 법.", tags: ["공정", "3d", "sim"] },
    { slug: "test",        num: "15", title: "테스트와 수율",            desc: "고장 모델과 마치 테스트, 리던던시 리페어, 수율 모델, 번인과 배스터브 곡선.", tags: ["품질", "sim"] },
    { slug: "industry",    num: "16", title: "메모리 산업과 시장",        desc: "비트당 원가, 메모리 사이클, 팹 경제학, HBM이 바꾼 공급 구조.", tags: ["산업", "sim"] },
    { slug: "glossary",    num: "17", title: "용어집 & 종합 퀴즈",        desc: "핵심 용어 200여 개를 검색하고, 종합 퀴즈로 실력을 점검하자.", tags: ["정리"] },
  ];

  const MB = (window.MB = {});
  MB.CHAPTERS = CHAPTERS;

  // Single source for the glossary page and inline definitions.
  MB.GLOSSARY = [
    // 01 메모리 계층 구조
    { ko: "메모리 계층", en: "Memory hierarchy", abbr: "", def: "레지스터 → L1/L2/L3 캐시(SRAM) → 주기억장치(DRAM) → SSD(NAND)로 이어지는 구조. 위로 갈수록 빠르고 작고 비싸며, 지역성 덕분에 평균적으로 '빠르고 큰' 메모리처럼 보이게 한다.", ch: "hierarchy" },
    { ko: "시간 지역성", en: "Temporal locality", abbr: "", def: "최근에 접근한 데이터는 곧 다시 접근될 가능성이 높다는 성질. 루프 변수·스택이 대표적이며, 캐시가 최근 데이터를 붙잡아 두는 근거가 된다.", ch: "hierarchy" },
    { ko: "공간 지역성", en: "Spatial locality", abbr: "", def: "접근한 주소 근처의 데이터도 곧 접근될 가능성이 높다는 성질. 배열 순차 접근이 대표적이며, 캐시가 64바이트 라인 단위로 가져오는 근거가 된다.", ch: "hierarchy" },
    { ko: "평균 메모리 접근 시간", en: "Average memory access time", abbr: "AMAT", def: "AMAT = 적중 시간 + 미스율 × 미스 페널티. 다단 캐시라면 미스 페널티 자리에 다음 단계의 AMAT이 재귀적으로 들어간다.", ch: "hierarchy" },
    { ko: "메모리 월", en: "Memory wall", abbr: "", def: "프로세서 연산 성능은 빠르게 늘었지만 DRAM 지연과 대역폭 향상은 훨씬 느려서, 메모리가 시스템 성능의 병목이 되는 현상. 1990년대 중반 Wulf·McKee가 이름 붙였다.", ch: "hierarchy" },
    {"ko":"적중률","en":"Hit rate","abbr":"","def":"요청한 데이터가 해당 메모리 계층에 있는 비율. 미스율과 합하면 100%이며, 적중률이 높을수록 느린 하위 계층에 접근하는 횟수가 줄어든다.","ch":"hierarchy"},
    {"ko":"미스율","en":"Miss rate","abbr":"","def":"요청한 데이터가 해당 메모리 계층에 없는 비율. AMAT = 적중 시간 + 미스율 × 미스 페널티이므로, DRAM 페널티가 수백 사이클이면 미스율 1 %p 차이도 접근 시간에 크게 영향을 준다.","ch":"hierarchy"},
    { ko: "지연 시간", en: "Latency", abbr: "", def: "요청부터 첫 데이터가 도착할 때까지 걸리는 시간. L1 약 1 ns, DRAM 약 80~120 ns(로드-투-유즈), NAND SSD 약 50~100 µs 수준이다.", ch: "hierarchy" },
    { ko: "대역폭", en: "Bandwidth", abbr: "BW", def: "단위 시간당 전달할 수 있는 데이터 양(GB/s). 버스 폭 × 전송률로 계산하며, 지연과는 독립적인 성능 축이다.", ch: "hierarchy" },
    {"ko":"휘발성","en":"Volatile","abbr":"","def":"전원이 꺼지면 저장한 데이터가 사라지는 성질. SRAM과 DRAM이 대표적인 휘발성 메모리다.","ch":"hierarchy"},
    {"ko":"비휘발성","en":"Non-volatile","abbr":"","def":"전원이 꺼져도 저장한 데이터가 유지되는 성질. NAND·NOR·MRAM 등이 해당하며, 보통 쓰기 속도와 내구성 사이의 절충이 필요하다.","ch":"hierarchy"},

    // 02 메모리 소자 물리
    { ko: "모스펫", en: "Metal-oxide-semiconductor field-effect transistor", abbr: "MOSFET", def: "게이트 전압으로 채널의 전도를 켜고 끄는 트랜지스터. 메모리 셀의 접근 스위치이자 주변 회로의 기본 소자다.", ch: "device" },
    { ko: "문턱 전압", en: "Threshold voltage", abbr: "Vt", def: "MOSFET 채널이 반전되어 전류가 본격적으로 흐르기 시작하는 게이트 전압. 플래시 메모리는 저장 전하로 이 Vt를 옮겨 데이터를 표현한다.", ch: "device" },
    { ko: "서브스레숄드 스윙", en: "Subthreshold swing", abbr: "SS", def: "문턱 이하 영역에서 드레인 전류를 10배 바꾸는 데 필요한 게이트 전압. 실온에서 이론 한계는 약 60 mV/dec이며, 작을수록 누설을 줄이기 쉽다.", ch: "device" },
    { ko: "누설 전류", en: "Leakage current", abbr: "", def: "트랜지스터가 꺼져 있어도 흐르는 전류. 서브스레숄드 누설, 게이트 터널링, 접합 누설, GIDL 등이 있으며 DRAM 리텐션과 SRAM 대기 전력을 좌우한다.", ch: "device" },
    { ko: "게이트 유도 드레인 누설", en: "Gate-induced drain leakage", abbr: "GIDL", def: "게이트-드레인 중첩부의 강한 전계로 밴드 간 터널링이 일어나 흐르는 누설. DRAM 셀 트랜지스터가 꺼진 상태에서 스토리지 노드 전하를 빼앗는 주요 원인이다.", ch: "device" },
    { ko: "드레인 유도 장벽 감소", en: "Drain-induced barrier lowering", abbr: "DIBL", def: "짧은 채널에서 드레인 전압이 소스 쪽 전위 장벽을 낮춰 Vt가 떨어지고 누설이 느는 단채널 효과.", ch: "device" },
    { ko: "고유전율 게이트 절연막", en: "High-k dielectric", abbr: "HKMG", def: "SiO₂(k≈3.9)보다 유전율이 큰 HfO₂(k≈20~25) 등을 쓴 게이트 절연막. 물리 두께를 유지해 터널링 누설을 막으면서 등가 산화막 두께(EOT)를 줄인다. 메탈 게이트와 함께 쓴다.", ch: "device" },
    { ko: "등가 산화막 두께", en: "Equivalent oxide thickness", abbr: "EOT", def: "어떤 절연막과 같은 커패시턴스를 내는 SiO₂의 두께. EOT = t × 3.9/k로, DRAM 커패시터 유전막 설계의 핵심 지표다.", ch: "device" },
    { ko: "양자 터널링", en: "Quantum tunneling", abbr: "", def: "입자가 고전적으로는 넘을 수 없는 에너지 장벽을 확률적으로 통과하는 현상. 장벽 두께에 지수적으로 민감해 약 2 nm 이하 산화막에서는 누설이 급증한다.", ch: "device" },
    { ko: "파울러-노드하임 터널링", en: "Fowler–Nordheim tunneling", abbr: "FN", def: "강한 전계(약 10 MV/cm)로 장벽이 삼각형으로 얇아져 전자가 터널링하는 현상. NAND 플래시의 프로그램·소거가 이 원리를 쓴다.", ch: "device" },
    { ko: "직접 터널링", en: "Direct tunneling", abbr: "", def: "매우 얇은 산화막(약 3 nm 이하)을 전자가 사다리꼴 장벽 그대로 통과하는 터널링. 게이트 누설과 플래시 리텐션 손실의 원인이 된다.", ch: "device" },

    // 03 SRAM과 캐시
    { ko: "SRAM", en: "Static random-access memory", abbr: "SRAM", def: "교차 결합 인버터 래치로 비트를 붙잡는 메모리. 리프레시가 필요 없고 빠르지만 셀 면적이 커서(6T, 약 120~150F²) 캐시·레지스터 파일에 쓰인다.", ch: "sram" },
    { ko: "6T 셀", en: "6-transistor SRAM cell", abbr: "6T", def: "풀업 PMOS 2개·풀다운 NMOS 2개로 된 교차 결합 인버터와 접근 트랜지스터 2개로 이뤄진 표준 SRAM 셀.", ch: "sram" },
    { ko: "정적 잡음 여유", en: "Static noise margin", abbr: "SNM", def: "SRAM 셀이 상태를 잃지 않고 견딜 수 있는 최대 잡음 전압. 버터플라이 곡선 두 눈에 내접하는 가장 큰 정사각형의 한 변으로 정의한다.", ch: "sram" },
    { ko: "버터플라이 곡선", en: "Butterfly curve", abbr: "", def: "교차 결합된 두 인버터의 전달 특성을 겹쳐 그린 그림. 나비 날개 모양의 두 눈이 클수록 SNM이 크다. 읽기 중에는 눈이 작아진다.", ch: "sram" },
    {"ko":"셀 비율","en":"Cell ratio","abbr":"CR","def":"SRAM 셀에서 풀다운 트랜지스터와 접근 트랜지스터의 강도 비. 읽기 안정성을 결정한다.","ch":"sram"},
    {"ko":"풀업 비율","en":"Pull-up ratio","abbr":"PR","def":"SRAM 셀에서 접근 트랜지스터와 풀업 트랜지스터의 강도 비. 쓰기 가능성을 결정한다.","ch":"sram"},
    { ko: "센스 앰프", en: "Sense amplifier", abbr: "SA", def: "비트라인의 작은 전압차(수십~수백 mV)를 감지해 전원 레벨까지 증폭하는 회로. 보통 교차 결합 래치 형태이며 SRAM과 DRAM 모두의 핵심이다.", ch: "sram" },
    { ko: "캐시 라인", en: "Cache line", abbr: "", def: "캐시와 하위 메모리가 주고받는 최소 단위 블록. 현대 CPU는 보통 64바이트이며 태그·유효 비트와 함께 저장된다.", ch: "sram" },
    { ko: "캐시 연관도", en: "Cache associativity", abbr: "", def: "한 주소가 들어갈 수 있는 캐시 위치의 수. 직접 사상(1-way), N-way 집합 연관, 완전 연관이 있으며 연관도가 높을수록 충돌 미스가 줄지만 비교기가 는다.", ch: "sram" },
    { ko: "LRU 교체", en: "Least recently used replacement", abbr: "LRU", def: "집합에서 가장 오래 쓰이지 않은 라인을 내보내는 교체 정책. 연관도가 크면 실제로는 트리 기반 의사 LRU(PLRU)로 근사한다.", ch: "sram" },
    {"ko":"3C 미스","en":"3C cache misses","abbr":"3C","def":"캐시 미스를 첫 접근(강제), 용량 부족(용량), 같은 집합 경쟁(충돌) 세 원인으로 나누는 분류.","ch":"sram"},
    {"ko":"쓰기 정책","en":"Cache write policy","abbr":"","def":"캐시에 쓰기를 할 때 하위 메모리에 반영하는 시점을 정하는 규칙. write-back과 write-through가 대표적이다.","ch":"sram"},
    {"ko":"라이트백","en":"Write-back","abbr":"","def":"쓰기를 캐시에만 반영하고, 해당 캐시 라인을 교체할 때 하위 메모리로 내려보내는 정책. 변경 여부를 기록하는 더티 비트가 필요하다.","ch":"sram"},
    {"ko":"라이트스루","en":"Write-through","abbr":"","def":"캐시에 쓸 때마다 하위 메모리에도 함께 반영하는 쓰기 정책.","ch":"sram"},

    // 04 DRAM 셀과 어레이
    { ko: "DRAM", en: "Dynamic random-access memory", abbr: "DRAM", def: "커패시터의 전하 유무로 비트를 저장하는 메모리. 전하가 새므로 주기적인 리프레시가 필요해 '동적'이라 부른다.", ch: "dram-cell" },
    { ko: "1T1C 셀", en: "One-transistor one-capacitor cell", abbr: "1T1C", def: "접근 트랜지스터 1개와 스토리지 커패시터 1개로 된 DRAM 셀. 셀 커패시턴스는 보통 약 10~20 fF 수준이다.", ch: "dram-cell" },
    { ko: "전하 공유", en: "Charge sharing", abbr: "", def: "워드라인이 열리면 셀 커패시터와 VDD/2로 프리차지된 비트라인이 전하를 나눠 갖는 과정. ΔV = (VDD/2)·Cs/(Cs+Cbl)로 보통 수십~100 mV 정도의 신호가 생긴다.", ch: "dram-cell" },
    { ko: "비트라인", en: "Bitline", abbr: "BL", def: "셀의 데이터를 센스 앰프로 전달하는 세로 배선. 기생 커패시턴스(약 60~120 fF)가 셀보다 커서 전하 공유 신호를 작게 만든다.", ch: "dram-cell" },
    { ko: "워드라인", en: "Wordline", abbr: "WL", def: "한 로우의 접근 트랜지스터 게이트를 묶은 가로 배선. DRAM은 쓰기·복원 때 VDD를 NMOS 문턱 전압 손실 없이 전달하려 VPP로 승압해 구동한다. 보존 때는 워드라인을 끄고 보통 음의 바이어스로 액세스 트랜지스터 누설을 줄인다.", ch: "dram-cell" },
    { ko: "오픈 비트라인", en: "Open bitline", abbr: "", def: "센스 앰프 양쪽 매트의 비트라인을 한 쌍으로 쓰는 구조. 모든 교차점에 셀을 둘 수 있어 6F² 셀이 가능하지만 잡음 상쇄가 약하다.", ch: "dram-cell" },
    { ko: "폴디드 비트라인", en: "Folded bitline", abbr: "", def: "같은 매트 안의 이웃 비트라인 두 개를 쌍으로 쓰는 구조. 공통 모드 잡음에 강하지만 셀을 교차점 절반에만 둘 수 있어 8F²가 된다.", ch: "dram-cell" },
    { ko: "매립 채널 어레이 트랜지스터", en: "Buried channel array transistor", abbr: "BCAT", def: "워드라인을 실리콘 트렌치 안에 묻은 셀 트랜지스터. 유효 채널 길이를 늘려 누설을 줄이면서 6F² 셀을 가능케 한 현대 DRAM의 표준 구조다.", ch: "dram-cell" },
    { ko: "실린더 커패시터", en: "Cylinder capacitor", abbr: "", def: "셀 위에 높게 세운 원통형 스토리지 커패시터. 종횡비 수십:1의 구조로 좁은 면적에서 표면적을 확보하며, 넘어짐을 막으려 지지막(supporter)을 쓴다.", ch: "dram-cell" },
    { ko: "수직 채널 트랜지스터", en: "Vertical channel transistor", abbr: "VCT", def: "채널을 수직으로 세우고 게이트가 둘러싸는 셀 트랜지스터. 4F² 셀을 목표로 하며 3D DRAM과 함께 차세대 후보로 개발 중이다.", ch: "dram-cell" },
    {"ko":"4F²","en":"4F² cell area","abbr":"","def":"최소 선폭 F의 제곱을 기준으로 면적이 4F²인 셀. 이론적 최소 교차점 셀의 면적이다.","ch":"dram-cell"},
    {"ko":"6F²","en":"6F² cell area","abbr":"","def":"최소 선폭 F의 제곱을 기준으로 면적이 6F²인 셀. 현재 DRAM 셀의 대표적인 면적이다.","ch":"dram-cell"},
    { ko: "하프 VDD 프리차지", en: "Half-VDD precharge", abbr: "VBLP", def: "비트라인 쌍을 VDD/2로 미리 맞춰 두는 방식. 0과 1 모두 같은 크기의 신호(±ΔV)를 만들고 프리차지 전력을 줄인다.", ch: "dram-cell" },
    { ko: "서브어레이 / 매트", en: "Subarray / Mat", abbr: "", def: "로컬 워드라인·비트라인·센스 앰프를 공유하는 셀 묶음(예: 512×512). 배선 길이를 제한해 RC 지연과 비트라인 커패시턴스를 줄인다.", ch: "dram-cell" },

    // 05 DRAM 동작과 타이밍
    { ko: "액티브 명령", en: "Activate", abbr: "ACT", def: "지정한 로우의 워드라인을 열고 센스 앰프로 한 페이지(수 KB)를 읽어 로우 버퍼에 올리는 명령.", ch: "dram-ops" },
    { ko: "프리차지 명령", en: "Precharge", abbr: "PRE", def: "열린 로우를 닫고 비트라인을 VDD/2로 되돌려 다음 ACT를 준비하는 명령.", ch: "dram-ops" },
    {"ko":"읽기 명령","en":"Read command","abbr":"RD","def":"열린 DRAM 로우 버퍼에서 컬럼 주소를 골라 버스트 단위로 데이터를 읽는 명령.","ch":"dram-ops"},
    {"ko":"쓰기 명령","en":"Write command","abbr":"WR","def":"열린 DRAM 로우 버퍼에서 컬럼 주소를 골라 버스트 단위로 데이터를 쓰는 명령.","ch":"dram-ops"},
    { ko: "tRCD", en: "RAS-to-CAS delay", abbr: "tRCD", def: "ACT부터 같은 뱅크에 RD/WR을 낼 수 있을 때까지의 최소 시간. 센싱과 증폭에 필요하며 세대가 바뀌어도 약 13~15 ns로 거의 같다.", ch: "dram-ops" },
    { ko: "CAS 지연", en: "CAS latency", abbr: "CL", def: "RD 명령부터 첫 데이터가 나올 때까지의 클록 수. DDR5-6400 CL52는 약 16 ns로, 클록 수는 늘었지만 절대 시간은 비슷하다.", ch: "dram-ops" },
    { ko: "tRP", en: "Row precharge time", abbr: "tRP", def: "PRE부터 같은 뱅크에 다음 ACT를 낼 수 있을 때까지의 최소 시간(약 14 ns).", ch: "dram-ops" },
    { ko: "tRAS", en: "Row active time", abbr: "tRAS", def: "ACT부터 PRE까지 로우가 열려 있어야 하는 최소 시간(약 32 ns). 센스 앰프가 셀을 완전히 재충전(restore)할 시간을 보장한다.", ch: "dram-ops" },
    { ko: "tRC", en: "Row cycle time", abbr: "tRC", def: "같은 뱅크에서 연속 ACT 사이의 최소 간격. tRC = tRAS + tRP로 약 45~50 ns이며, 랜덤 접근 성능의 근본 한계다.", ch: "dram-ops" },
    {"ko":"tRRD","en":"Row-to-row delay","abbr":"tRRD","def":"서로 다른 뱅크에 내리는 ACT 명령 사이의 최소 간격. 순간 전류와 전원 잡음을 제한한다.","ch":"dram-ops"},
    {"ko":"tFAW","en":"Four activate window","abbr":"tFAW","def":"어떤 시간 창 안에 ACT 명령을 최대 4번만 허용하는 제약. 순간 전류와 전원 잡음을 제한한다.","ch":"dram-ops"},
    { ko: "로우 버퍼", en: "Row buffer", abbr: "", def: "ACT로 열린 로우의 데이터를 붙잡고 있는 센스 앰프 배열. 같은 로우를 다시 읽으면(로우 히트) tRCD·tRP 없이 CL만으로 접근한다.", ch: "dram-ops" },
    {"ko":"로우 히트","en":"Row hit","abbr":"","def":"요청한 로우가 이미 로우 버퍼에 열려 있는 상태. ACT·PRE 없이 읽을 수 있으며 지연은 CL에 해당한다.","ch":"dram-ops"},
    {"ko":"로우 미스","en":"Row miss","abbr":"","def":"요청한 뱅크에 열린 로우가 없는 상태. ACT 후 읽어야 하므로 지연은 tRCD + CL에 해당한다.","ch":"dram-ops"},
    {"ko":"로우 충돌","en":"Row conflict","abbr":"","def":"요청한 로우와 다른 로우가 같은 뱅크에 열려 있는 상태. PRE와 ACT를 거쳐야 하므로 지연은 tRP + tRCD + CL에 해당한다.","ch":"dram-ops"},
    { ko: "뱅크", en: "Bank", abbr: "", def: "독립적으로 ACT/PRE할 수 있는 DRAM 내부 어레이 단위. 여러 뱅크를 겹쳐 동작(인터리빙)시켜 tRC의 한계를 숨긴다. DDR5는 칩당 32뱅크(16Gb 기준).", ch: "dram-ops" },
    { ko: "뱅크 그룹", en: "Bank group", abbr: "BG", def: "내부 데이터 경로를 공유하는 뱅크 묶음. 같은 그룹 내 연속 접근은 긴 tCCD_L, 다른 그룹 간은 짧은 tCCD_S가 적용된다(DDR4부터).", ch: "dram-ops" },
    { ko: "리프레시", en: "Refresh", abbr: "REF", def: "누설로 사라지는 셀 전하를 읽고 다시 써서 복원하는 동작. 모든 로우를 보통 32 ms(DDR5) 또는 64 ms(DDR4, 85 °C 이하) 안에 한 번씩 리프레시한다.", ch: "dram-ops" },
    { ko: "tREFI", en: "Refresh interval", abbr: "tREFI", def: "REF 명령 사이의 평균 간격. DDR4는 7.8 µs, DDR5는 3.9 µs이며 고온에서는 절반으로 줄인다.", ch: "dram-ops" },
    { ko: "tRFC", en: "Refresh cycle time", abbr: "tRFC", def: "REF 한 번에 걸리는 시간으로, 이 동안 해당 랭크(또는 뱅크)에 접근할 수 없다. 칩 용량이 커질수록 길어져 16Gb DDR5에서 약 295 ns다.", ch: "dram-ops" },
    {"ko":"페이지 정책","en":"DRAM page policy","abbr":"","def":"DRAM 접근 후 로우를 계속 열어 둘지 닫을지 정하는 메모리 컨트롤러의 정책.","ch":"dram-ops"},
    {"ko":"오픈 페이지","en":"Open-page","abbr":"","def":"DRAM 접근 후 로우를 열어 두는 페이지 정책. 같은 로우에 다시 접근하는 지역성이 높을 때 유리하다.","ch":"dram-ops"},
    {"ko":"클로즈 페이지","en":"Close-page","abbr":"","def":"DRAM 접근 후 로우를 즉시 닫는 페이지 정책. 랜덤 접근에 유리하다.","ch":"dram-ops"},

    // 06 인터페이스
    { ko: "더블 데이터 레이트", en: "Double data rate", abbr: "DDR", def: "클록(또는 스트로브)의 상승·하강 에지 모두에서 데이터를 전송하는 방식. DDR5-6400은 3.2 GHz 클록에서 6400 MT/s를 낸다.", ch: "interface" },
    { ko: "프리페치", en: "Prefetch", abbr: "n-prefetch", def: "느린 코어 어레이에서 한 번에 여러 비트를 병렬로 읽어 빠른 I/O로 직렬화하는 방식. DDR4 8n, DDR5 16n으로 코어 속도를 크게 올리지 않고 대역폭을 키운다.", ch: "interface" },
    { ko: "버스트 길이", en: "Burst length", abbr: "BL", def: "RD/WR 명령 하나로 연속 전송하는 비트 수. DDR5는 BL16으로 32비트 서브채널에서 64바이트 캐시 라인 하나를 채운다.", ch: "interface" },
    { ko: "데이터 스트로브", en: "Data strobe", abbr: "DQS", def: "데이터(DQ)와 함께 보내는 소스 동기 클록 신호. 수신 측은 DQS 에지에 맞춰 DQ를 샘플링해 배선 지연 차이를 상쇄한다.", ch: "interface" },
    { ko: "온다이 터미네이션", en: "On-die termination", abbr: "ODT", def: "DRAM 칩 안에 넣은 종단 저항. 신호 반사를 줄여 고속에서 신호 무결성을 확보하며, 모드 레지스터로 저항값을 설정한다.", ch: "interface" },
    { ko: "아이 다이어그램", en: "Eye diagram", abbr: "", def: "수신 신호를 한 UI 단위로 겹쳐 그린 그림. 눈의 높이(전압 마진)와 폭(타이밍 마진)이 신호 품질을 나타낸다.", ch: "interface" },
    { ko: "트레이닝", en: "Link training", abbr: "", def: "부팅 시 컨트롤러가 DQS-DQ 지연, 기준 전압(Vref), 이퀄라이저 등을 스윕해 최적점을 찾는 과정. 고속 DDR에서 필수다.", ch: "interface" },
    { ko: "결정 궤환 등화기", en: "Decision feedback equalizer", abbr: "DFE", def: "이미 판정한 이전 비트로 현재 비트의 심볼 간 간섭(ISI)을 빼 주는 수신 등화기. DDR5부터 DRAM 수신단에 들어갔다.", ch: "interface" },
    { ko: "NRZ", en: "Non-return-to-zero", abbr: "NRZ / PAM2", def: "두 전압 레벨로 심볼당 1비트를 보내는 기본 신호 방식. DDR·LPDDR·HBM이 사용한다.", ch: "interface" },
    { ko: "PAM4", en: "4-level pulse amplitude modulation", abbr: "PAM4", def: "네 전압 레벨로 심볼당 2비트를 보내는 방식. 같은 심볼률에서 대역폭이 2배지만 눈 높이가 약 1/3로 줄어든다. GDDR6X가 사용했다.", ch: "interface" },
    { ko: "PAM3", en: "3-level pulse amplitude modulation", abbr: "PAM3", def: "세 전압 레벨로 두 심볼에 3비트(심볼당 1.5비트)를 보내는 방식. GDDR7이 채택해 NRZ보다 빠르고 PAM4보다 잡음에 강하다.", ch: "interface" },
    { ko: "LPDDR", en: "Low-power DDR", abbr: "LPDDR", def: "모바일용 저전력 DRAM 규격. 낮은 I/O 전압, 좁은 채널(16비트), 깊은 절전 모드가 특징이며 LPDDR5X는 핀당 최대 약 8.5~10.7 Gb/s(2024~2025년)이다.", ch: "interface" },
    { ko: "GDDR", en: "Graphics DDR", abbr: "GDDR", def: "그래픽카드용 고대역폭 DRAM. 칩당 32비트 폭에 핀당 속도를 극대화하며, GDDR7은 PAM3로 핀당 약 28~32 Gb/s(2025년)를 낸다.", ch: "interface" },
    { ko: "레지스터드 DIMM", en: "Registered DIMM", abbr: "RDIMM", def: "명령·주소 신호를 레지스터 클록 드라이버(RCD)로 버퍼링한 서버용 메모리 모듈. 채널당 더 많은 칩과 용량을 붙일 수 있다.", ch: "interface" },
    { ko: "멀티플렉스드 랭크 DIMM", en: "Multiplexed rank DIMM", abbr: "MRDIMM", def: "모듈의 데이터 버퍼가 두 랭크를 동시에 읽어 호스트 쪽으로 2배 속도로 합쳐 보내는 서버 모듈. 1세대가 약 8800 MT/s(2024년)다.", ch: "interface" },
    { ko: "LPCAMM", en: "Low-power compression attached memory module", abbr: "LPCAMM2", def: "LPDDR 칩을 교체 가능한 압착형 모듈로 만든 노트북용 규격. 온보드 LPDDR의 전력·속도 장점과 SO-DIMM의 교체성을 함께 노린다.", ch: "interface" },
    { ko: "서브채널", en: "Sub-channel", abbr: "", def: "DDR5 DIMM이 64비트 채널을 독립적인 32비트 채널 두 개로 나눈 구조. 동시 요청 처리량을 높인다.", ch: "interface" },

    // 07 HBM
    { ko: "고대역폭 메모리", en: "High Bandwidth Memory", abbr: "HBM", def: "DRAM 다이를 TSV로 수직 적층하고 1024비트(HBM4는 2048비트)의 넓은 버스로 GPU 옆 인터포저에 붙인 메모리. HBM3E는 스택당 약 1.2 TB/s(2024년)다.", ch: "hbm" },
    { ko: "실리콘 관통 전극", en: "Through-silicon via", abbr: "TSV", def: "얇게 간 실리콘 다이를 수직으로 관통하는 구리 전극. 적층된 다이 사이를 짧게 연결해 수천 개의 신호·전원 경로를 만든다.", ch: "hbm" },
    { ko: "마이크로범프", en: "Microbump", abbr: "µbump", def: "적층 다이 사이를 잇는 수십 µm 피치의 작은 솔더 범프. HBM에서는 약 40~55 µm 피치가 쓰이며 더 좁히기 어려워 하이브리드 본딩이 대안으로 떠올랐다.", ch: "hbm" },
    { ko: "인터포저", en: "Interposer", abbr: "", def: "GPU와 HBM을 나란히 올리고 미세 배선으로 연결하는 중간 기판. 실리콘 인터포저는 수천 개의 신호선을 촘촘히 깔 수 있다.", ch: "hbm" },
    { ko: "CoWoS", en: "Chip-on-Wafer-on-Substrate", abbr: "CoWoS", def: "TSMC의 2.5D 패키징 기술. 칩을 실리콘 인터포저 웨이퍼 위에 붙인 뒤 기판에 올린다. AI 가속기 + HBM 조합의 사실상 표준이다.", ch: "hbm" },
    { ko: "MR-MUF", en: "Mass reflow molded underfill", abbr: "MR-MUF", def: "다이를 쌓은 뒤 한 번에 리플로우로 접합하고 액상 몰드 언더필을 주입하는 HBM 적층 공정. SK하이닉스가 주로 쓰며 열 방출에 유리하다.", ch: "hbm" },
    { ko: "TC-NCF", en: "Thermal compression with non-conductive film", abbr: "TC-NCF", def: "다이 사이에 비전도성 필름을 넣고 한 층씩 열압착하는 HBM 적층 공정. 삼성전자·마이크론이 주로 쓰며 휨 제어에 유리하다.", ch: "hbm" },
    { ko: "하이브리드 본딩", en: "Hybrid bonding", abbr: "HCB", def: "범프 없이 구리 패드끼리, 절연막끼리 직접 접합하는 기술. 10 µm 이하 피치와 얇은 적층 높이가 가능해 16단 이상 HBM의 후보 기술이다.", ch: "hbm" },
    { ko: "베이스 다이", en: "Base (logic) die", abbr: "", def: "HBM 스택 맨 아래의 로직 다이. PHY, TSV 신호 분배, 테스트 회로를 담으며 HBM4부터는 파운드리 로직 공정으로 만들어 기능을 넣는 추세다.", ch: "hbm" },
    { ko: "코어 다이", en: "Core (DRAM) die", abbr: "", def: "HBM 스택에서 실제 셀 어레이가 있는 DRAM 다이. 8·12단(HBM3E), 12·16단(HBM4)으로 쌓는다.", ch: "hbm" },
    { ko: "노운 굿 다이", en: "Known good die", abbr: "KGD", def: "적층·패키징 전에 전기 테스트로 양품임이 확인된 다이. 한 개의 불량이 스택 전체를 버리게 하므로 HBM 수율의 핵심이다.", ch: "hbm" },
    { ko: "의사 채널", en: "Pseudo channel", abbr: "PC", def: "HBM의 채널 하나를 명령은 공유하되 데이터는 독립적인 두 반쪽으로 나눈 모드. 접근 단위를 줄이고 동시성을 높인다.", ch: "hbm" },
    { ko: "HBM4", en: "HBM4", abbr: "", def: "2025년 JEDEC이 표준화한 HBM 세대. 인터페이스를 2048비트로 넓혀 스택당 약 2 TB/s 이상을 목표로 하고, 베이스 다이에 로직 공정을 쓰는 커스텀화가 확대된다.", ch: "hbm" },

    // 08 NAND 플래시 셀
    { ko: "NAND 플래시", en: "NAND flash", abbr: "NAND", def: "셀을 직렬 스트링으로 연결해 콘택을 줄인 고밀도 비휘발 메모리. 페이지 단위로 읽고 쓰며 블록 단위로 지운다.", ch: "nand" },
    { ko: "NOR 플래시", en: "NOR flash", abbr: "NOR", def: "셀을 비트라인에 병렬로 연결한 플래시. 랜덤 읽기가 빨라 코드 직접 실행(XIP)에 쓰이지만 밀도가 낮다.", ch: "nand" },
    { ko: "플로팅 게이트", en: "Floating gate", abbr: "FG", def: "절연막으로 완전히 둘러싸인 폴리실리콘 전극에 전자를 가두는 플래시 셀 구조. 도체라서 결함 하나로도 전하가 모두 샐 수 있다.", ch: "nand" },
    { ko: "차지 트랩 플래시", en: "Charge trap flash", abbr: "CTF", def: "질화막(SiN)의 트랩에 전자를 국소적으로 가두는 셀 구조. 절연체라 누설 경로에 강하고 얇게 만들 수 있어 3D NAND의 표준이 되었다.", ch: "nand" },
    { ko: "증분 스텝 펄스 프로그래밍", en: "Incremental step pulse programming", abbr: "ISPP", def: "프로그램 전압을 조금씩(예: 0.2~0.5 V) 올리며 펄스와 검증(verify)을 반복하는 방식. Vt 분포를 좁게 만들지만 단계 수만큼 쓰기가 느려진다.", ch: "nand" },
    {"ko":"SLC","en":"Single-level cell","abbr":"SLC","def":"셀당 1비트를 저장하는 NAND 방식. 문턱 전압 상태가 2개이며, 셀당 여러 비트를 저장하는 방식보다 밀도는 낮지만 마진·속도·내구성에 유리하다.","ch":"nand"},
    {"ko":"MLC","en":"Multi-level cell","abbr":"MLC","def":"이 책에서는 셀당 2비트를 저장하는 NAND 방식. 문턱 전압 상태가 4개이며, SLC보다 밀도가 높지만 상태 사이의 마진이 줄어든다.","ch":"nand"},
    {"ko":"TLC","en":"Triple-level cell","abbr":"TLC","def":"셀당 3비트를 저장하는 NAND 방식. 문턱 전압 상태가 8개이며, 비트 수가 늘어나는 만큼 밀도는 높아지고 마진·속도·내구성은 줄어든다.","ch":"nand"},
    {"ko":"QLC","en":"Quad-level cell","abbr":"QLC","def":"셀당 4비트를 저장하는 NAND 방식. 문턱 전압 상태가 16개로 밀도가 높지만, 상태 사이의 마진이 좁아 속도와 내구성에 불리하다.","ch":"nand"},
    { ko: "패스 전압", en: "Pass voltage", abbr: "Vpass", def: "NAND 읽기·프로그램 때 선택되지 않은 워드라인에 거는 높은 전압(약 6~10 V). 스트링의 다른 셀을 모두 켜 통로로 만든다.", ch: "nand" },
    { ko: "페이지", en: "Page", abbr: "", def: "NAND에서 읽기·쓰기의 기본 단위로, 한 워드라인의 셀들이다. 크기는 보통 16 KB 수준이며 덮어쓰기는 불가능하다.", ch: "nand" },
    { ko: "블록", en: "Block", abbr: "", def: "NAND에서 소거의 기본 단위로 수백~수천 페이지(수~수십 MB)다. 소거는 기판(웰)에 고전압을 걸어 블록 전체를 한꺼번에 지운다.", ch: "nand" },
    {"ko":"프로그램·소거 사이클","en":"Program/erase cycle","abbr":"P/E","def":"셀을 한 번 쓰고 지우는 횟수. 반복할수록 터널 산화막에 결함이 쌓여 Vt 분포가 퍼지고 결국 수명이 다한다.","ch":"nand"},
    { ko: "Vt 분포", en: "Threshold voltage distribution", abbr: "", def: "같은 상태로 프로그램된 셀들의 Vt 산포. 인접 상태 분포가 겹치면 읽기 오류가 나므로 읽기 기준 전압을 분포 사이 골에 둔다.", ch: "nand" },
    { ko: "셀 간 간섭", en: "Cell-to-cell interference", abbr: "", def: "이웃 셀의 저장 전하가 커패시턴스 결합으로 대상 셀의 Vt를 옮기는 현상. 미세화될수록 커져 2D NAND 축소의 한계가 되었다.", ch: "nand" },
    { ko: "프로그램 디스터브", en: "Program disturb", abbr: "", def: "선택 셀을 프로그램할 때 같은 워드라인·스트링의 비선택 셀이 약하게 프로그램되는 현상. 셀프 부스팅으로 비선택 채널 전위를 올려 막는다.", ch: "nand" },

    // 09 3D NAND
    { ko: "3D NAND", en: "3D NAND / V-NAND", abbr: "V-NAND", def: "워드라인 층을 수직으로 쌓고 그 사이를 관통하는 수직 채널에 셀 스트링을 만든 NAND. 2026년 기준 약 200~400단대 제품이 양산된다.", ch: "vnand" },
    { ko: "채널 홀", en: "Channel hole", abbr: "", def: "적층막 전체를 한 번에 뚫는 원통형 구멍. 벽면에 블로킹 산화막·질화막·터널 산화막·폴리실리콘 채널을 차례로 입힌다. 종횡비가 수십:1에 달한다.", ch: "vnand" },
    { ko: "게이트 대체 공정", en: "Gate replacement", abbr: "", def: "산화막/질화막을 번갈아 쌓아 식각한 뒤, 슬릿으로 질화막을 제거하고 그 자리를 텅스텐 워드라인으로 채우는 공정.", ch: "vnand" },
    { ko: "계단 구조", en: "Staircase", abbr: "", def: "적층된 각 워드라인 층에 콘택을 내리기 위해 가장자리를 계단 모양으로 깎은 영역. 층 수가 늘수록 면적과 공정 부담이 커진다.", ch: "vnand" },
    { ko: "CMOS 언더 어레이", en: "CMOS under array", abbr: "CuA / PUC", def: "페이지 버퍼·디코더 등 주변 회로를 셀 어레이 아래에 배치해 칩 면적을 줄이는 구조. 별도 웨이퍼에 만들어 붙이는 방식(CBA, Xtacking)도 있다.", ch: "vnand" },
    { ko: "멀티 데크", en: "Multi-deck stacking", abbr: "", def: "한 번에 뚫을 수 있는 채널 홀 깊이의 한계 때문에 적층을 2~3개 덱으로 나눠 쌓고 채널을 이어 붙이는 방식.", ch: "vnand" },
    { ko: "종횡비", en: "Aspect ratio", abbr: "AR", def: "구조의 깊이 대 폭의 비. 3D NAND 채널 홀과 DRAM 커패시터는 수십:1에 달해 식각·증착 공정의 최대 난제다.", ch: "vnand" },
    { ko: "스트링 선택 트랜지스터", en: "String select transistor", abbr: "SSL / GSL", def: "NAND 스트링 양 끝에서 비트라인·공통 소스와의 연결을 제어하는 트랜지스터.", ch: "vnand" },

    // 10 SSD
    { ko: "솔리드 스테이트 드라이브", en: "Solid-state drive", abbr: "SSD", def: "NAND 플래시와 컨트롤러, DRAM(또는 HMB)으로 된 저장 장치. 컨트롤러가 수십 개의 NAND 다이를 병렬로 굴려 대역폭을 낸다.", ch: "ssd" },
    { ko: "플래시 변환 계층", en: "Flash translation layer", abbr: "FTL", def: "호스트의 논리 주소(LBA)를 NAND의 물리 주소로 바꾸는 펌웨어 계층. 덮어쓰기 불가, 블록 단위 소거 같은 NAND 제약을 숨긴다.", ch: "ssd" },
    { ko: "L2P 매핑 테이블", en: "Logical-to-physical table", abbr: "L2P", def: "FTL이 관리하는 주소 변환 표. 4 KB 매핑이면 용량의 약 1/1000(1 TB당 약 1 GB) DRAM이 필요하다.", ch: "ssd" },
    { ko: "가비지 컬렉션", en: "Garbage collection", abbr: "GC", def: "무효 페이지가 섞인 블록에서 유효 페이지만 다른 곳으로 옮기고 블록을 소거해 빈 공간을 만드는 작업. 추가 쓰기를 발생시킨다.", ch: "ssd" },
    { ko: "쓰기 증폭 계수", en: "Write amplification factor", abbr: "WAF", def: "NAND에 실제로 쓴 양 ÷ 호스트가 쓴 양. GC 때문에 1보다 크며, 랜덤 쓰기와 낮은 OP에서 커져 수명과 성능을 깎는다.", ch: "ssd" },
    { ko: "오버 프로비저닝", en: "Over-provisioning", abbr: "OP", def: "사용자에게 보이지 않게 남겨 둔 여유 NAND 용량. OP가 클수록 GC가 옮길 유효 페이지가 줄어 WAF가 낮아진다. 데이터센터용은 7~28 % 수준이다.", ch: "ssd" },
    { ko: "웨어 레벨링", en: "Wear leveling", abbr: "", def: "특정 블록만 닳지 않도록 P/E 횟수를 전체 블록에 고르게 분산하는 기법. 정적 데이터도 주기적으로 옮기는 정적 웨어 레벨링이 있다.", ch: "ssd" },
    { ko: "TRIM", en: "TRIM / Deallocate", abbr: "TRIM", def: "파일 시스템이 삭제된 LBA를 SSD에 알려 주는 명령. 해당 페이지를 무효로 표시해 GC가 쓸데없이 옮기지 않게 한다.", ch: "ssd" },
    { ko: "총 기록 가능 용량", en: "Terabytes written", abbr: "TBW", def: "보증 기간 동안 쓸 수 있는 총 호스트 쓰기량. TBW ≈ 용량 × P/E 사이클 ÷ WAF로 어림한다.", ch: "ssd" },
    { ko: "일일 전체 쓰기 횟수", en: "Drive writes per day", abbr: "DWPD", def: "보증 기간 동안 매일 전체 용량을 몇 번 쓸 수 있는지. DWPD = TBW ÷ (용량 × 보증 일수). 읽기 위주 약 1, 쓰기 위주 3 이상.", ch: "ssd" },
    { ko: "NVMe", en: "Non-Volatile Memory Express", abbr: "NVMe", def: "PCIe 위에서 동작하는 SSD 전용 프로토콜. 최대 64K개 큐와 큐당 64K 명령으로 SATA/AHCI보다 병렬성과 지연이 크게 개선된다.", ch: "ssd" },
    { ko: "존드 네임스페이스", en: "Zoned namespace", abbr: "ZNS", def: "LBA 공간을 순차 쓰기만 허용하는 존으로 나눈 NVMe 기능. 호스트가 데이터 배치를 맡아 GC와 OP, 매핑 DRAM을 크게 줄인다.", ch: "ssd" },
    { ko: "유연한 데이터 배치", en: "Flexible data placement", abbr: "FDP", def: "호스트가 쓰기마다 배치 힌트를 주어 수명이 비슷한 데이터를 같은 블록에 모으게 하는 NVMe 기능. ZNS보다 도입이 쉬워 WAF를 낮추는 대안으로 쓰인다.", ch: "ssd" },
    { ko: "SLC 캐시", en: "SLC cache", abbr: "", def: "TLC/QLC 블록 일부를 SLC 모드로 써서 쓰기를 빠르게 받아 두는 버퍼. 캐시가 가득 차면 쓰기 속도가 네이티브 TLC/QLC 수준으로 뚝 떨어진다.", ch: "ssd" },

    // 11 신뢰성
    { ko: "소프트 에러", en: "Soft error", abbr: "SER", def: "알파 입자나 중성자가 만든 전하가 저장 노드를 뒤집어 생기는 일시적 오류. 소자 손상은 없어 다시 쓰면 복구된다.", ch: "reliability" },
    { ko: "FIT", en: "Failures in time", abbr: "FIT", def: "10⁹ 소자-시간당 고장 수. 1 FIT는 10억 시간에 한 번 고장이며, 소프트 에러율과 하드 고장률을 표시하는 단위다.", ch: "reliability" },
    { ko: "리텐션", en: "Data retention", abbr: "", def: "데이터를 잃지 않고 유지할 수 있는 시간. DRAM은 수십 ms~수 초(셀마다 다름), NAND는 수명 말기에도 규격상 약 1년(클라이언트, 30 °C) 이상을 요구한다.", ch: "reliability" },
    { ko: "로우 해머", en: "RowHammer", abbr: "", def: "한 로우를 짧은 시간에 수만~수십만 번 반복 ACT하면 이웃 로우 셀의 전하가 빠져 비트가 뒤집히는 현상. 미세화될수록 임계 횟수가 줄어 보안 위협이 된다.", ch: "reliability" },
    { ko: "대상 로우 리프레시", en: "Target row refresh", abbr: "TRR", def: "자주 ACT된 로우를 추적해 그 이웃 로우를 미리 리프레시하는 DRAM 내부 완화 기법. 추적 용량이 제한되어 우회 공격(TRRespass 등)이 보고되었다.", ch: "reliability" },
    { ko: "로우별 활성화 카운팅", en: "Per-row activation counting", abbr: "PRAC", def: "모든 로우마다 ACT 카운터를 두고 임계치를 넘으면 컨트롤러에 백오프(ABO)를 요청해 이웃을 리프레시하는 JEDEC DDR5 기능(2024년). 결정론적 보호를 제공한다.", ch: "reliability" },
    { ko: "원시 비트 오류율", en: "Raw bit error rate", abbr: "RBER", def: "ECC 정정 전의 비트 오류 비율. NAND는 P/E와 리텐션에 따라 약 10⁻⁴~10⁻² 수준까지 올라간다.", ch: "reliability" },
    { ko: "정정 불가 비트 오류율", en: "Uncorrectable bit error rate", abbr: "UBER", def: "ECC 정정 후에도 남는 오류 비율. 엔터프라이즈 SSD는 보통 10⁻¹⁶~10⁻¹⁷ 이하를 요구한다.", ch: "reliability" },
    { ko: "해밍 코드", en: "Hamming code", abbr: "", def: "패리티 비트를 2의 거듭제곱 위치에 두어 신드롬이 곧 오류 위치를 가리키게 한 단일 비트 정정 부호. (7,4) 코드가 대표적이다.", ch: "reliability" },
    { ko: "SECDED", en: "Single error correction, double error detection", abbr: "SECDED", def: "해밍 코드에 전체 패리티 1비트를 더해 1비트 정정·2비트 검출을 하는 부호. 64비트 데이터에 8비트 검사(72,64)가 서버 ECC DIMM의 고전적 구성이다.", ch: "reliability" },
    { ko: "칩킬", en: "Chipkill", abbr: "SDDC", def: "DRAM 칩 하나가 통째로 고장 나도 데이터를 복구하는 심볼 기반 ECC. 여러 칩에 심볼을 분산하는 리드-솔로몬 계열 부호를 쓴다.", ch: "reliability" },
    { ko: "온다이 ECC", en: "On-die ECC", abbr: "ODECC", def: "DRAM 칩 내부에서 128비트 데이터당 8비트 패리티 등으로 단일 비트 오류를 정정하는 기능. DDR5와 LPDDR5에 기본 탑재되며 시스템 ECC와 별개다.", ch: "reliability" },
    { ko: "BCH 부호", en: "Bose–Chaudhuri–Hocquenghem code", abbr: "BCH", def: "여러 비트 오류를 정정하는 대수적 순환 부호. 경판정만 써서 구현이 간단해 초기 NAND 컨트롤러에 널리 쓰였다.", ch: "reliability" },
    { ko: "LDPC 부호", en: "Low-density parity-check code", abbr: "LDPC", def: "희소한 패리티 검사 행렬을 쓰는 부호. 셀 Vt의 연판정(soft) 정보를 반복 복호에 활용해 샤논 한계에 가까운 정정 능력을 내며 현대 SSD의 표준이다.", ch: "reliability" },
    { ko: "리드 리트라이", en: "Read retry", abbr: "", def: "ECC 복호가 실패하면 읽기 기준 전압을 옮겨 다시 읽는 기법. 리텐션으로 이동한 Vt 분포를 따라가지만 읽기 지연이 늘어난다.", ch: "reliability" },
    { ko: "읽기 디스터브", en: "Read disturb", abbr: "", def: "같은 블록을 반복해 읽을 때 비선택 워드라인의 Vpass가 셀을 약하게 프로그램해 Vt가 오르는 현상. 일정 횟수가 넘으면 블록을 옮겨 쓴다.", ch: "reliability" },
    { ko: "아레니우스 모델", en: "Arrhenius model", abbr: "", def: "열 활성 고장의 속도가 exp(−Ea/kT)에 비례한다는 모델. 고온 가속 시험 결과를 실사용 온도로 환산하는 가속 계수 계산에 쓴다.", ch: "reliability" },

    // 12 차세대 메모리
    { ko: "자기 저항 메모리", en: "Magnetoresistive RAM", abbr: "MRAM", def: "자성층의 자화 방향으로 비트를 저장하는 비휘발 메모리. 빠르고 내구성이 높아 임베디드 플래시·SRAM 대체 용도로 쓰인다.", ch: "emerging" },
    { ko: "자기 터널 접합", en: "Magnetic tunnel junction", abbr: "MTJ", def: "고정층–얇은 MgO 터널 장벽–자유층으로 된 MRAM 소자. 두 층의 자화가 평행이면 저저항, 반평행이면 고저항이다.", ch: "emerging" },
    { ko: "터널 자기 저항비", en: "Tunnel magnetoresistance ratio", abbr: "TMR", def: "TMR = (R_AP − R_P)/R_P. 읽기 마진을 결정하며, MgO 장벽 MTJ는 실온에서 약 100~200 % 수준이 쓰인다.", ch: "emerging" },
    { ko: "스핀 전달 토크", en: "Spin-transfer torque", abbr: "STT", def: "MTJ를 관통하는 스핀 편극 전류가 자유층 자화에 토크를 줘 뒤집는 쓰기 방식. 읽기·쓰기 경로가 같아 장벽 열화 문제가 있다.", ch: "emerging" },
    { ko: "스핀 궤도 토크", en: "Spin-orbit torque", abbr: "SOT", def: "MTJ 아래 중금속 배선에 흐르는 면내 전류가 스핀 홀 효과로 자유층을 뒤집는 방식. 쓰기 경로가 분리된 3단자 구조로 빠르고 내구성이 높다.", ch: "emerging" },
    { ko: "상변화 메모리", en: "Phase-change memory", abbr: "PCM", def: "칼코게나이드의 비정질(고저항)과 결정질(저저항) 상태로 비트를 저장하는 메모리. 짧고 강한 펄스로 용융·급랭(RESET), 길고 약한 펄스로 결정화(SET)한다.", ch: "emerging" },
    { ko: "GST", en: "Ge₂Sb₂Te₅", abbr: "GST", def: "게르마늄·안티모니·텔루륨 합금으로 대표적인 상변화 물질. 광디스크(DVD-RW)에서도 쓰였다.", ch: "emerging" },
    { ko: "저항 변화 메모리", en: "Resistive RAM", abbr: "ReRAM", def: "금속 산화물 안에 산소 공공이나 금속 이온으로 된 전도성 필라멘트를 만들고 끊어 저항을 바꾸는 메모리. 구조가 단순하고 저전력이다.", ch: "emerging" },
    { ko: "크로스포인트 어레이", en: "Cross-point array", abbr: "", def: "수직으로 교차하는 워드라인·비트라인의 모든 교차점에 셀을 둔 4F² 어레이. 층을 쌓아 밀도를 더 높일 수 있다.", ch: "emerging" },
    { ko: "스닉 경로", en: "Sneak path", abbr: "", def: "크로스포인트 어레이에서 선택 셀 외의 저저항 셀들을 거쳐 흐르는 기생 전류 경로. 읽기 마진을 무너뜨려 셀마다 선택 소자가 필요하다.", ch: "emerging" },
    { ko: "오보닉 임계 스위치", en: "Ovonic threshold switch", abbr: "OTS", def: "임계 전압을 넘으면 급격히 전도되는 칼코게나이드 선택 소자. 크로스포인트 셀에 직렬로 붙여 스닉 전류를 막는다.", ch: "emerging" },
    { ko: "강유전체 메모리", en: "Ferroelectric RAM", abbr: "FeRAM", def: "강유전체 커패시터의 분극 방향으로 비트를 저장하는 메모리. 읽기가 파괴적이라 다시 써야 하며, HfO₂ 기반 강유전체 발견으로 CMOS 호환성이 좋아졌다.", ch: "emerging" },
    { ko: "강유전체 트랜지스터", en: "Ferroelectric FET", abbr: "FeFET", def: "게이트 절연막을 강유전체로 바꿔 분극으로 Vt를 옮기는 1T 메모리. 비파괴 읽기가 가능하고 인메모리 연산 후보로도 연구된다.", ch: "emerging" },
    { ko: "스토리지 클래스 메모리", en: "Storage-class memory", abbr: "SCM", def: "DRAM과 NAND 사이의 지연·가격을 노린 비휘발 메모리 계층. 3D XPoint(Optane)가 대표였으나 2022년 사업이 종료되었다.", ch: "emerging" },
    { ko: "컴퓨트 익스프레스 링크", en: "Compute Express Link", abbr: "CXL", def: "PCIe 물리층 위에서 캐시 일관성 있는 메모리 접근을 제공하는 인터커넥트. CXL.mem으로 메모리 확장·풀링을 하며 로컬 DRAM보다 약 70~100 ns 정도 지연이 추가된다.", ch: "emerging" },
    { ko: "프로세싱 인 메모리", en: "Processing-in-memory", abbr: "PIM", def: "메모리 칩(또는 뱅크) 안에 연산기를 넣어 데이터를 밖으로 옮기지 않고 처리하는 구조. 내부 뱅크 대역폭을 활용해 메모리 바운드 연산의 에너지를 줄인다.", ch: "emerging" },
    { ko: "프로세싱 니어 메모리", en: "Processing-near-memory", abbr: "PNM", def: "메모리 다이 밖의 가까운 곳(모듈 버퍼 칩, CXL 컨트롤러, HBM 베이스 다이)에 연산기를 두는 구조. 로직 공정을 쓸 수 있지만 대역폭 이득은 PIM보다 작다.", ch: "emerging" },
    { ko: "컴퓨팅 인 메모리", en: "Computing-in-memory", abbr: "CIM", def: "셀 어레이 자체의 물리(저항 전류의 합, 비트라인 전하 공유)로 연산하는 구조. 멤리스터 크로스바의 아날로그 행렬-벡터 곱과 SRAM-CIM이 대표적이다.", ch: "emerging" },
    { ko: "멤리스터", en: "Memristor", abbr: "", def: "지나간 전류 이력에 따라 저항이 정해지고 그 값을 유지하는 2단자 소자. ReRAM·PCM을 아날로그 컨덕턴스 소자로 볼 때의 이름으로, CIM의 가중치(시냅스) 소자로 쓰인다.", ch: "emerging" },

    // 13 설계
    { ko: "루프라인 모델", en: "Roofline model", abbr: "", def: "달성 가능 성능 = min(최대 연산 성능, 메모리 대역폭 × 산술 강도)로 나타낸 그래프. 커널이 연산 바운드인지 메모리 바운드인지 한눈에 보여 준다.", ch: "design" },
    { ko: "산술 강도", en: "Arithmetic intensity", abbr: "AI", def: "메모리에서 옮긴 바이트당 연산 수(FLOP/byte). 행렬 곱은 크고, LLM 디코딩의 행렬-벡터 곱은 약 1~2 FLOP/byte로 매우 작다.", ch: "design" },
    { ko: "릿지 포인트", en: "Ridge point", abbr: "", def: "루프라인에서 대역폭 경사와 연산 천장이 만나는 산술 강도 = 최대 FLOPS ÷ 대역폭. 이보다 강도가 낮은 커널은 메모리 바운드다.", ch: "design" },
    { ko: "메모리 바운드", en: "Memory-bound", abbr: "", def: "연산기보다 메모리 대역폭이 먼저 한계에 도달해 성능이 대역폭에 비례하는 상태. LLM 추론 디코딩 단계가 대표적이다.", ch: "design" },
    { ko: "KV 캐시", en: "Key-value cache", abbr: "KV cache", def: "트랜스포머 추론에서 이전 토큰의 어텐션 키·값을 저장해 두는 메모리. 크기 = 2 × 층 수 × KV 헤드 수 × 헤드 차원 × 시퀀스 길이 × 배치 × 바이트 수로 커져 HBM 용량을 압박한다.", ch: "design" },
    { ko: "비트당 에너지", en: "Energy per bit", abbr: "pJ/bit", def: "1비트를 옮기는 데 드는 에너지. HBM 약 3~5 pJ/bit, DDR5 약 10~20 pJ/bit 수준이며, 대역폭 × pJ/bit가 곧 메모리 I/O 전력이다.", ch: "design" },
    { ko: "대역폭 대 용량 비", en: "Bandwidth-to-capacity ratio", abbr: "", def: "GB당 제공되는 GB/s. HBM은 크고 LPDDR·DDR은 작아, 모델 크기와 요구 토큰 속도에 맞는 메모리 조합을 고를 때 쓰는 지표다.", ch: "design" },
    { ko: "총 소유 비용", en: "Total cost of ownership", abbr: "TCO", def: "구매 비용뿐 아니라 전력·냉각·공간·운영 비용까지 합한 시스템 비용. 메모리 선택은 $/GB·$/(GB/s)·W를 함께 따져야 한다.", ch: "design" },
    // 14 공정
    { ko: "노광", en: "Lithography", abbr: "", def: "마스크의 회로 패턴을 빛으로 감광막에 옮기는 공정. 찍을 수 있는 최소 선폭이 미세화의 한계를 정한다.", ch: "process" },
    { ko: "레일리 식", en: "Rayleigh criterion", abbr: "", def: "최소 하프 피치 = k1 × λ / NA. 파장을 줄이거나 개구수를 키우거나 k1을 낮춰야 더 가는 선을 찍을 수 있다.", ch: "process" },
    { ko: "극자외선 노광", en: "Extreme ultraviolet lithography", abbr: "EUV", def: "파장 13.5 nm의 빛을 반사 광학계로 쓰는 노광. DRAM은 1z~1a 노드부터 일부 층에 도입해 세대마다 적용 층을 늘리고 있다.", ch: "process" },
    { ko: "초점 심도", en: "Depth of focus", abbr: "DOF", def: "상이 선명하게 맺히는 높이 범위. λ / NA²에 비례하므로 NA를 키우면 해상도는 좋아지지만 초점 여유는 줄어든다.", ch: "process" },
    { ko: "멀티 패터닝", en: "Multi-patterning", abbr: "SADP / SAQP", def: "한 번의 노광으로 찍을 수 없는 피치를 스페이서 증착과 식각을 반복해 2배, 4배로 쪼개는 기법. 공정 단계와 비용이 늘어난다.", ch: "process" },
    { ko: "플라즈마 식각", en: "Plasma etch", abbr: "", def: "이온과 라디칼로 막을 깎아 내는 건식 식각. 이온이 수직으로 입사하므로 옆으로 번지지 않고 깊게 팔 수 있다.", ch: "process" },
    { ko: "식각 선택비", en: "Etch selectivity", abbr: "", def: "깎으려는 막과 마스크(또는 아래 막)의 식각 속도 비. 선택비가 낮으면 깊은 구멍을 파기 전에 마스크가 먼저 닳는다.", ch: "process" },
    { ko: "종횡비 의존 식각", en: "Aspect ratio dependent etching", abbr: "ARDE", def: "구멍이 깊어질수록 이온과 반응 기체가 바닥까지 닿기 어려워져 식각 속도가 느려지는 현상.", ch: "process" },
    { ko: "화학 기상 증착", en: "Chemical vapor deposition", abbr: "CVD", def: "기체 원료를 웨이퍼 표면에서 반응시켜 막을 쌓는 공정. 빠르지만 깊은 구조에서는 입구가 먼저 두꺼워진다.", ch: "process" },
    { ko: "원자층 증착", en: "Atomic layer deposition", abbr: "ALD", def: "전구체와 반응 기체를 번갈아 넣어 한 사이클에 원자층 하나 정도씩 쌓는 공정. 자기 제한 반응이라 고종횡비 구조도 균일하게 덮는다.", ch: "process" },
    { ko: "단차 피복성", en: "Step coverage", abbr: "", def: "구조 바닥(또는 측벽)의 막 두께 ÷ 윗면의 막 두께. 100%에 가까울수록 컨포멀하다.", ch: "process" },
    { ko: "화학적 기계적 연마", en: "Chemical mechanical polishing", abbr: "CMP", def: "슬러리와 패드로 웨이퍼 표면을 갈아 평탄하게 만드는 공정. 다층 배선과 웨이퍼 본딩의 전제 조건이다.", ch: "process" },
    // 15 테스트
    { ko: "웨이퍼 테스트", en: "Wafer test / Electrical die sorting", abbr: "EDS", def: "패키징 전에 프로브 카드로 웨이퍼 위의 다이를 전기적으로 검사해 양품을 고르고 리페어할 주소를 찾는 단계.", ch: "test" },
    { ko: "고장 모델", en: "Fault model", abbr: "", def: "물리적 결함이 논리 동작에 나타나는 방식을 추상화한 것. 고착, 천이, 결합, 주소 디코더 고장 등이 있다.", ch: "test" },
    { ko: "고착 고장", en: "Stuck-at fault", abbr: "SAF", def: "셀 값이 0 또는 1에 고정되어 쓰기로 바뀌지 않는 고장.", ch: "test" },
    { ko: "결합 고장", en: "Coupling fault", abbr: "CF", def: "한 셀의 쓰기나 상태가 다른 셀의 값을 바꾸는 고장. 반전·멱등·상태 결합으로 나눈다.", ch: "test" },
    { ko: "마치 테스트", en: "March test", abbr: "", def: "모든 주소를 오름차순 또는 내림차순으로 지나가며 읽기·쓰기 묶음을 적용하는 테스트. March C-는 10n번의 동작으로 고착·천이·결합·주소 고장을 검출한다.", ch: "test" },
    { ko: "내장 자체 테스트", en: "Built-in self-test", abbr: "BIST / MBIST", def: "칩 안에 패턴 발생기와 비교기를 넣어 스스로 메모리를 검사하는 회로. 외부 테스트 장비 의존도와 테스트 시간을 줄인다.", ch: "test" },
    { ko: "리던던시", en: "Redundancy", abbr: "", def: "불량 셀을 대체하려고 미리 넣어 둔 여분의 행과 열. 퓨즈에 불량 주소를 기록해 여분으로 돌린다.", ch: "test" },
    { ko: "패키지 후 리페어", en: "Post-package repair", abbr: "PPR", def: "패키징 이후, 심지어 시스템에 장착된 뒤에도 불량 행을 여분 행으로 바꾸는 기능. DDR4부터 표준에 포함되었다.", ch: "test" },
    { ko: "수율", en: "Yield", abbr: "", def: "웨이퍼 위 전체 다이 중 양품의 비율. 다이 면적과 결함 밀도가 클수록 떨어진다.", ch: "test" },
    { ko: "결함 밀도", en: "Defect density", abbr: "D0", def: "단위 면적당 치명 결함 수. 푸아송 모델에서 수율 = exp(−A × D0)이다.", ch: "test" },
    { ko: "번인", en: "Burn-in", abbr: "", def: "고온·고전압으로 칩을 가속 구동해 초기 불량을 출하 전에 걸러 내는 공정.", ch: "test" },
    { ko: "배스터브 곡선", en: "Bathtub curve", abbr: "", def: "시간에 따른 고장률 곡선. 초기 불량 구간에서 떨어지고, 우발 고장 구간에서 평평하다가, 마모 구간에서 다시 오른다.", ch: "test" },
    { ko: "백만 개당 불량 수", en: "Defective parts per million", abbr: "DPPM", def: "출하한 부품 백만 개 중 불량품의 수. 출하 품질의 지표다.", ch: "test" },
    // 16 산업
    { ko: "범용품", en: "Commodity", abbr: "", def: "제조사가 달라도 서로 바꿔 쓸 수 있는 표준 제품. 메모리는 JEDEC 표준 덕분에 범용품이 되었고 가격이 수급으로 정해진다.", ch: "industry" },
    { ko: "종합 반도체 회사", en: "Integrated device manufacturer", abbr: "IDM", def: "설계부터 제조, 패키징, 판매까지 직접 하는 회사. 주요 메모리 회사는 모두 이 형태다.", ch: "industry" },
    { ko: "고정거래가격", en: "Contract price", abbr: "", def: "제조사와 대형 고객이 일정 기간 단위로 협상해 정하는 가격. 현물가격보다 느리게 움직인다.", ch: "industry" },
    { ko: "현물가격", en: "Spot price", abbr: "", def: "유통 시장에서 그때그때 거래되는 가격. 수급 변화를 먼저 반영해 고정거래가격의 선행 지표로 쓰인다.", ch: "industry" },
    { ko: "비트당 원가", en: "Cost per bit", abbr: "", def: "웨이퍼 원가 ÷ (웨이퍼당 다이 수 × 수율 × 다이당 비트 수). 미세화, 적층 수, 셀당 비트 수가 이 값을 낮춘다.", ch: "industry" },
    { ko: "비트 그로스", en: "Bit growth", abbr: "", def: "한 해 동안 공급(또는 수요) 비트 총량이 늘어난 비율. 웨이퍼 투입 증가와 다이당 비트 증가의 합으로 결정된다.", ch: "industry" },
    { ko: "라이트의 법칙", en: "Wright's law", abbr: "", def: "누적 생산량이 두 배가 될 때마다 단위 원가가 일정 비율로 떨어진다는 학습 곡선 법칙.", ch: "industry" },
    { ko: "감가상각", en: "Depreciation", abbr: "", def: "팹과 장비 투자비를 사용 기간에 걸쳐 나누어 비용으로 잡는 것. 메모리 원가에서 비중이 큰 고정비다.", ch: "industry" },
    { ko: "메모리 사이클", en: "Memory cycle", abbr: "", def: "증설에 걸리는 시간 지연 때문에 공급 과잉과 부족이 번갈아 나타나며 가격과 이익이 크게 오르내리는 현상.", ch: "industry" },
    { ko: "채찍 효과", en: "Bullwhip effect", abbr: "", def: "최종 수요의 작은 변화가 공급망을 거슬러 올라가며 재고 조정으로 증폭되는 현상.", ch: "industry" },
    { ko: "트레이드 비율", en: "Trade ratio", abbr: "", def: "같은 비트를 만드는 데 HBM이 범용 DRAM보다 웨이퍼를 몇 배 더 쓰는지 나타내는 비율. 약 3배 수준으로 알려져 있다.", ch: "industry" },
  ];

  /* ------------------------------------------------------------ math utils */
  MB.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  MB.lerp = (a, b, t) => a + (b - a) * t;
  MB.map = (x, a, b, c, d) => c + ((x - a) * (d - c)) / (b - a);
  MB.randn = function () {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  MB.poisson = function (lambda) {
    if (lambda <= 0) return 0;
    if (lambda > 40) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * MB.randn()));
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  };
  /** 숫자 포맷: 유효 자리 */
  MB.fmt = function (x, digits = 3) {
    if (!isFinite(x)) return "—";
    if (x === 0) return "0";
    const a = Math.abs(x);
    if (a >= 1e5 || a < 1e-3) return x.toExponential(digits - 1).replace("e+", "e");
    return Number(x.toPrecision(digits)).toLocaleString("en-US", { maximumFractionDigits: 6 });
  };
  /** SI 접두사 포맷: MB.si(2.3e-9,'m') → "2.3 nm" */
  MB.si = function (x, unit = "", digits = 3) {
    if (!isFinite(x)) return "—";
    if (x === 0) return "0 " + unit;
    const pre = [[1e12, "T"], [1e9, "G"], [1e6, "M"], [1e3, "k"], [1, ""], [1e-3, "m"], [1e-6, "µ"], [1e-9, "n"], [1e-12, "p"], [1e-15, "f"]];
    const a = Math.abs(x);
    for (const [v, p] of pre) if (a >= v * 0.9995) return Number((x / v).toPrecision(digits)) + " " + p + unit;
    return x.toExponential(digits - 1) + " " + unit;
  };

  /** 이진 접두사 바이트 포맷: MB.bytes(3*2**30) → "3 GiB" (bin=false면 10진 GB) */
  MB.bytes = function (x, digits = 3, bin = true) {
    if (!isFinite(x)) return "—";
    const base = bin ? 1024 : 1000, units = bin ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"];
    let i = 0, a = Math.abs(x);
    while (a >= base * 0.9995 && i < units.length - 1) { a /= base; i++; }
    return Number((Math.sign(x) * a).toPrecision(digits)) + " " + units[i];
  };
  /** 정수 → 2진 문자열 (자리수 고정): MB.bin(5,4) → "0101" */
  MB.bin = (n, width = 8) => (n >>> 0).toString(2).padStart(width, "0").slice(-width);

  /* ------------------------------------------------------------ physics consts */
  MB.C = { h: 6.62607015e-34, c: 2.99792458e8, q: 1.602176634e-19, k: 1.380649e-23, eps0: 8.8541878128e-12, hbar: 1.054571817e-34, me: 9.1093837015e-31 };

  /** 파장(nm) → [r,g,b] 0..255 (가시광 380~780, 밖은 어두운 색) */
  MB.wl2rgbArr = function (nm) {
    let r = 0, g = 0, b = 0;
    if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
    else if (nm < 490 && nm >= 440) { g = (nm - 440) / 50; b = 1; }
    else if (nm < 510 && nm >= 490) { g = 1; b = -(nm - 510) / 20; }
    else if (nm < 580 && nm >= 510) { r = (nm - 510) / 70; g = 1; }
    else if (nm < 645 && nm >= 580) { r = 1; g = -(nm - 645) / 65; }
    else if (nm <= 780 && nm >= 645) { r = 1; }
    let f = 0;
    if (nm >= 380 && nm < 420) f = 0.3 + (0.7 * (nm - 380)) / 40;
    else if (nm >= 420 && nm <= 700) f = 1;
    else if (nm > 700 && nm <= 780) f = 0.3 + (0.7 * (780 - nm)) / 80;
    const gm = 0.8;
    const c = (v) => Math.round(255 * Math.pow(v * f, gm));
    if (nm < 380) return [110, 60, 160];   // UV: 보라 계열 표시용
    if (nm > 780) return [120, 30, 30];    // IR: 어두운 적색 표시용
    return [c(r), c(g), c(b)];
  };
  MB.wl2rgb = function (nm, alpha = 1) {
    const [r, g, b] = MB.wl2rgbArr(nm);
    return alpha === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
  };

  /* ------------------------------------------------------------ theme */
  const themeCbs = [];
  MB.onTheme = (cb) => themeCbs.push(cb);
  MB.isDark = function () {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  /** CSS 변수 값 읽기: MB.color('accent') */
  MB.color = function (name) {
    return getComputedStyle(document.documentElement).getPropertyValue("--" + name).trim();
  };
  /** 자주 쓰는 색 묶음 (테마 변경 시 다시 호출할 것) */
  MB.palette = function () {
    const c = MB.color;
    return {
      bg: c("canvas-bg"), text: c("text"), dim: c("text-dim"), faint: c("text-faint"),
      grid: c("grid"), axis: c("axis"), border: c("border"), surface: c("surface"),
      accent: c("accent"), accent2: c("accent-2"), ok: c("ok"), warn: c("warn"), bad: c("bad"),
      red: c("red"), green: c("green"), blue: c("blue"),
      // 데이터 시리즈용 기본 순서
      series: [c("accent"), c("accent-2"), c("warn"), c("ok"), c("bad"), c("text-dim")],
    };
  };
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } });
  }
  try { const saved = localStorage.getItem("mb-theme"); if (saved) document.documentElement.setAttribute("data-theme", saved); } catch (e) {}
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
      if (!document.documentElement.getAttribute("data-theme")) applyTheme(null);
    });
  }

  /* ------------------------------------------------------------ canvas helper */
  /**
   * HiDPI 캔버스. 폭은 부모 폭을 따르고 높이는 aspect(높이/폭) 또는 height(px)로 결정.
   * draw(ctx, w, h)는 리사이즈·테마 변경 시 자동 호출된다. 애니메이션이면 직접 redraw() 호출.
   *   const cv = MB.canvas(el, (ctx,w,h)=>{...}, {aspect:0.5, maxHeight: 420});
   *   cv.redraw(); cv.ctx; cv.w; cv.h
   */
  MB.canvas = function (canvas, draw, opts = {}) {
    if (typeof canvas === "string") canvas = document.querySelector(canvas);
    const ctx = canvas.getContext("2d");
    const st = { ctx, w: 0, h: 0, canvas, dpr: 1 };
    function resize() {
      const parent = canvas.parentElement;
      const w = Math.max(200, Math.floor(opts.width || parent.clientWidth || 600));
      let h = opts.height || Math.round(w * (opts.aspect || 0.5));
      if (opts.minHeight) h = Math.max(h, opts.minHeight);
      if (opts.maxHeight) h = Math.min(h, opts.maxHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.w = w; st.h = h; st.dpr = dpr;
      st.redraw();
    }
    st.redraw = function () {
      if (!st.w) return;
      ctx.save();
      ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      if (!opts.noClear) {
        ctx.clearRect(0, 0, st.w, st.h);
        ctx.fillStyle = MB.color("canvas-bg");
        ctx.fillRect(0, 0, st.w, st.h);
      }
      try { draw && draw(ctx, st.w, st.h); } finally { ctx.restore(); }
    };
    st.resize = resize;
    if (window.ResizeObserver) {
      let lastW = -1;
      new ResizeObserver(() => { const w = canvas.parentElement.clientWidth; if (w !== lastW) { lastW = w; resize(); } }).observe(canvas.parentElement);
    } else window.addEventListener("resize", resize);
    MB.onTheme(() => st.redraw());
    resize();
    return st;
  };

  /**
   * 화면에 보일 때만 도는 애니메이션 루프. fn(dt초, t초)
   *   const loop = MB.loop(el, (dt,t)=>{...}); loop.stop(); loop.start();
   */
  MB.loop = function (el, fn) {
    let raf = 0, last = 0, t = 0, visible = true, running = true;
    function frame(ts) {
      raf = 0;
      if (!running || !visible) return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016;
      last = ts; t += dt;
      fn(dt, t);
      raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && running && visible) { last = 0; raf = requestAnimationFrame(frame); } }
    if (window.IntersectionObserver && el) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; kick(); }).observe(el);
    }
    kick();
    return {
      start() { running = true; kick(); },
      stop() { running = false; },
      get running() { return running; },
      toggle() { running ? (running = false) : ((running = true), kick()); return running; },
    };
  };

  /* ------------------------------------------------------------ chart helper */
  /**
   * 간단한 선 그래프. box = {x,y,w,h}(생략 시 캔버스 전체에 여백 자동)
   * opts: { x:[min,max], y:[min,max], logX, logY, xLabel, yLabel, xTicks, yTicks,
   *         xFmt, yFmt, series:[{data:[[x,y],...], color, width, dash, fill, label}],
   *         vlines:[{x,color,label,dash}], hlines:[{y,color,label,dash}], points:[{x,y,color,r,label}],
   *         bands:[{x0,x1,color}] }
   * 반환: { X(v)->px, Y(v)->px, box }
   */
  MB.chart = function (ctx, box, opts) {
    const P = MB.palette();
    const dpr = (ctx.getTransform && ctx.getTransform().a) || 1;
    const W = ctx.canvas.width / dpr, H = ctx.canvas.height / dpr;
    if (!box) box = { x: 58, y: 16, w: W - 58 - 18, h: H - 16 - 46 };
    const [x0, x1] = opts.x, [y0, y1] = opts.y;
    const lx = (v) => (opts.logX ? Math.log10(v) : v);
    const ly = (v) => (opts.logY ? Math.log10(v) : v);
    const X = (v) => box.x + ((lx(v) - lx(x0)) / (lx(x1) - lx(x0))) * box.w;
    const Y = (v) => box.y + box.h - ((ly(v) - ly(y0)) / (ly(y1) - ly(y0))) * box.h;
    const ticks = (a, b, log, n) => {
      if (log) { const out = []; for (let e = Math.ceil(Math.log10(a) - 1e-9); e <= Math.log10(b) + 1e-9; e++) out.push(Math.pow(10, e)); return out; }
      const span = b - a, raw = span / (n || 5), mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= (n || 5) + 0.5) || raw;
      const out = []; for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + step * 1e-6; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
      return out;
    };
    const defFmt = (v) => (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-2 && v !== 0) ? v.toExponential(0).replace("e+", "e") : String(Number(v.toPrecision(4))));
    const xFmt = opts.xFmt || defFmt, yFmt = opts.yFmt || defFmt;
    ctx.save();
    ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--mono");
    ctx.lineWidth = 1;
    // bands
    (opts.bands || []).forEach((b) => { ctx.fillStyle = b.color; ctx.fillRect(X(b.x0), box.y, X(b.x1) - X(b.x0), box.h); });
    // grid + ticks
    const xt = opts.xTicks || ticks(x0, x1, opts.logX, 6);
    const yt = opts.yTicks || ticks(y0, y1, opts.logY, 5);
    ctx.strokeStyle = P.grid; ctx.fillStyle = P.dim;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    xt.forEach((v) => { const px = X(v); if (px < box.x - 1 || px > box.x + box.w + 1) return; ctx.beginPath(); ctx.moveTo(px, box.y); ctx.lineTo(px, box.y + box.h); ctx.stroke(); ctx.fillText(xFmt(v), px, box.y + box.h + 6); });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    yt.forEach((v) => { const py = Y(v); if (py < box.y - 1 || py > box.y + box.h + 1) return; ctx.beginPath(); ctx.moveTo(box.x, py); ctx.lineTo(box.x + box.w, py); ctx.stroke(); ctx.fillText(yFmt(v), box.x - 6, py); });
    ctx.strokeStyle = P.axis;
    ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke();
    // labels
    ctx.fillStyle = P.dim; ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--font");
    if (opts.xLabel) { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(opts.xLabel, box.x + box.w / 2, box.y + box.h + 40); }
    if (opts.yLabel) { ctx.save(); ctx.translate(14, box.y + box.h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(opts.yLabel, 0, 0); ctx.restore(); }
    // clip plot area
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y - 2, box.w + 2, box.h + 4); ctx.clip();
    (opts.series || []).forEach((s, i) => {
      if (!s.data || !s.data.length) return;
      ctx.strokeStyle = s.color || P.series[i % P.series.length];
      ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      let started = false;
      s.data.forEach(([x, y]) => { if (!isFinite(y) || (opts.logY && y <= 0) || (opts.logX && x <= 0)) { started = false; return; } const px = X(x), py = Y(y); started ? ctx.lineTo(px, py) : ctx.moveTo(px, py); started = true; });
      ctx.stroke();
      if (s.fill) {
        ctx.lineTo(X(s.data[s.data.length - 1][0]), Y(opts.logY ? y0 : Math.max(y0, 0)));
        ctx.lineTo(X(s.data[0][0]), Y(opts.logY ? y0 : Math.max(y0, 0)));
        ctx.closePath(); ctx.fillStyle = s.fill; ctx.fill();
      }
      ctx.setLineDash([]);
    });
    (opts.vlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(X(l.x), box.y); ctx.lineTo(X(l.x), box.y + box.h); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(l.label, X(l.x) + 4, box.y + 4); } });
    (opts.hlines || []).forEach((l) => { ctx.strokeStyle = l.color || P.faint; ctx.setLineDash(l.dash || [4, 4]); ctx.lineWidth = l.width || 1.2; ctx.beginPath(); ctx.moveTo(box.x, Y(l.y)); ctx.lineTo(box.x + box.w, Y(l.y)); ctx.stroke(); ctx.setLineDash([]); if (l.label) { ctx.fillStyle = l.color || P.dim; ctx.textAlign = "right"; ctx.textBaseline = "bottom"; ctx.fillText(l.label, box.x + box.w - 4, Y(l.y) - 3); } });
    (opts.points || []).forEach((p) => { ctx.fillStyle = p.color || P.accent; ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), p.r || 4, 0, Math.PI * 2); ctx.fill(); if (p.label) { ctx.fillStyle = P.text; ctx.textAlign = "left"; ctx.textBaseline = "bottom"; ctx.fillText(p.label, X(p.x) + 6, Y(p.y) - 4); } });
    ctx.restore();
    ctx.restore();
    return { X, Y, box };
  };

  /* ------------------------------------------------------------ controls */
  /**
   * range 입력 바인딩. output은 id+"-out" 요소 또는 <output for=id>.
   *   const get = MB.range('wl', v => v+' nm', v => redraw());  get() → 현재 값(Number)
   */
  MB.range = function (id, fmt, onInput) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const out = document.getElementById(el.id + "-out") || document.querySelector(`output[for="${el.id}"]`);
    const update = (fire) => {
      const v = Number(el.value);
      const pct = ((v - Number(el.min || 0)) / (Number(el.max || 100) - Number(el.min || 0))) * 100;
      el.style.setProperty("--fill", pct + "%");
      if (out) out.textContent = fmt ? fmt(v) : String(v);
      if (fire && onInput) onInput(v);
    };
    el.addEventListener("input", () => update(true));
    update(false);
    const get = () => Number(el.value);
    get.set = (v) => { el.value = v; update(true); };
    get.el = el;
    return get;
  };
  /**
   * 세그먼트 버튼: <div class="seg" id="mode"><button data-value="a" class="on">A</button>...</div>
   *   const mode = MB.seg('mode', v => redraw());  mode() → 현재 값
   */
  MB.seg = function (id, onChange) {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    const btns = [...el.querySelectorAll("button")];
    let cur = (btns.find((b) => b.classList.contains("on")) || btns[0]).dataset.value;
    const set = (v, fire = true) => {
      cur = v;
      btns.forEach((b) => { const on = b.dataset.value === v; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
      if (fire && onChange) onChange(v);
    };
    btns.forEach((b) => b.addEventListener("click", () => set(b.dataset.value)));
    set(cur, false);
    const get = () => cur;
    get.set = set;
    return get;
  };
  /** 통계 표시: MB.stat('snr', '32.1 dB') → id 요소의 textContent 설정(HTML 허용) */
  MB.stat = function (id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  /* ------------------------------------------------------------ three.js helper */
  /**
   * three.js 씬 준비 (전역 THREE, THREE.OrbitControls 필요).
   *   const T = MB.three(containerEl, { camera:[x,y,z], target:[x,y,z], fov:40, autoRotate:false });
   *   T.scene, T.camera, T.renderer, T.controls, T.THREE
   *   T.onFrame((dt,t)=>{...});   T.label('텍스트', new THREE.Vector3(...)) → HTML 라벨(자동 투영)
   *   T.material(color, opts)  → MeshStandardMaterial 헬퍼
   * 조명(환경광+방향광 2개), 리사이즈, 화면 밖 일시정지, 테마 대응 포함.
   */
  MB.three = function (container, opts = {}) {
    if (typeof container === "string") container = document.querySelector(container);
    if (!window.THREE) { container.innerHTML = '<p style="padding:20px;color:var(--text-dim)">3D 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인하세요.</p>'; return null; }
    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(opts.fov || 40, 1, 0.01, 2000);
    camera.position.set(...(opts.camera || [6, 5, 8]));
    const controls = THREE.OrbitControls ? new THREE.OrbitControls(camera, renderer.domElement) : null;
    if (controls) {
      controls.target.set(...(opts.target || [0, 0, 0]));
      controls.enableDamping = true; controls.dampingFactor = 0.08;
      controls.autoRotate = !!opts.autoRotate; controls.autoRotateSpeed = opts.autoRotateSpeed || 0.8;
      controls.enablePan = opts.pan !== false;
      if (opts.minDistance) controls.minDistance = opts.minDistance;
      if (opts.maxDistance) controls.maxDistance = opts.maxDistance;
      controls.update();
    } else camera.lookAt(...(opts.target || [0, 0, 0]));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x445066, 0.75));
    const d1 = new THREE.DirectionalLight(0xffffff, 0.85); d1.position.set(5, 10, 7); scene.add(d1);
    const d2 = new THREE.DirectionalLight(0xbfd7ff, 0.35); d2.position.set(-6, 4, -5); scene.add(d2);

    const labelLayer = document.createElement("div");
    labelLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden";
    container.appendChild(labelLayer);
    const labels = [];
    const frameCbs = [];
    const T = { THREE, scene, camera, renderer, controls, container, labels };
    T.onFrame = (cb) => frameCbs.push(cb);
    T.label = function (text, pos, cls) {
      const el = document.createElement("div");
      el.className = "overlay-label" + (cls ? " " + cls : "");
      el.innerHTML = text;
      labelLayer.appendChild(el);
      const L = { el, pos: pos.clone ? pos.clone() : new THREE.Vector3(...pos), visible: true, obj: null };
      L.setVisible = (v) => { L.visible = v; el.style.display = v ? "" : "none"; };
      L.remove = () => { el.remove(); labels.splice(labels.indexOf(L), 1); };
      labels.push(L);
      return L;
    };
    T.material = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.55, metalness: 0.05 }, o));
    function resize() {
      const w = container.clientWidth, h = container.clientHeight || 400;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = w + "px"; renderer.domElement.style.height = h + "px";
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(container); else window.addEventListener("resize", resize);
    resize();
    const v = new THREE.Vector3();
    T.loop = MB.loop(container, (dt, t) => {
      frameCbs.forEach((cb) => cb(dt, t));
      if (controls) controls.update();
      renderer.render(scene, camera);
      const w = container.clientWidth, h = container.clientHeight;
      labels.forEach((L) => {
        if (!L.visible) return;
        v.copy(L.pos); if (L.obj) L.obj.localToWorld(v);
        v.project(camera);
        const behind = v.z > 1;
        L.el.style.display = behind ? "none" : "";
        L.el.style.left = ((v.x + 1) / 2) * w + "px";
        L.el.style.top = ((1 - v.y) / 2) * h + "px";
      });
    });
    return T;
  };

  /* ------------------------------------------------------------ layout build */
  const LOGO = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="8" fill="url(#mbg)"/><rect x="9" y="9" width="14" height="14" rx="2" fill="none" stroke="#fff" stroke-width="1.8"/><g stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M12.5 6v3M16 6v3M19.5 6v3M12.5 23v3M16 23v3M19.5 23v3M6 12.5h3M6 16h3M6 19.5h3M23 12.5h3M23 16h3M23 19.5h3"/></g><g fill="#fff"><rect x="12" y="12" width="3" height="3" rx=".6"/><rect x="17" y="12" width="3" height="3" rx=".6" opacity=".55"/><rect x="12" y="17" width="3" height="3" rx=".6" opacity=".55"/><rect x="17" y="17" width="3" height="3" rx=".6"/></g></svg>`;
  const ICON_MENU = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`;
  const ICON_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
  const ICON_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;

  function build() {
    const body = document.body;
    const root = body.dataset.root != null ? body.dataset.root : body.dataset.chapter ? "../" : "";
    const curSlug = body.dataset.chapter || "";
    const href = (slug) => (slug ? `${root}chapters/${slug}.html` : `${root}index.html`);
    const feedbackUrl = "https://books.euiyun.com/feedback.html?book=memorybook&page=" + encodeURIComponent(location.href);

    // favicon
    if (!document.querySelector('link[rel="icon"]')) { const fi = document.createElement("link"); fi.rel = "icon"; fi.type = "image/svg+xml"; fi.href = root + "favicon.svg"; document.head.appendChild(fi); }

    // top bar
    const bar = document.createElement("header");
    bar.className = "mb-topbar";
    bar.innerHTML = `
      <button class="mb-btn icon" id="mb-menu" aria-label="챕터 목록">${ICON_MENU}</button>
      <a class="mb-logo" href="${href("")}">${LOGO}<span>MemoryBook <small>메모리 반도체 교과서</small></span></a>
      <span class="spacer"></span>
      <a class="mb-btn series-link" href="https://books.euiyun.com/" aria-label="전체 책 보기" title="전체 책 보기"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5h6v14H4zM10 5.5h6v14h-6zM17 7l3-1 2 13-3 1z"/></svg><span>전체 책</span></a>
      <button class="mb-btn icon" id="mb-theme" aria-label="테마 전환"></button>
      <div class="mb-progress" id="mb-progress"></div>`;
    const feedbackButton = document.createElement("a");
    feedbackButton.className = bar.className.replace("-topbar", "-btn") + " icon feedback-button";
    feedbackButton.href = feedbackUrl;
    feedbackButton.target = "_blank";
    feedbackButton.rel = "noopener";
    feedbackButton.setAttribute("aria-label", "독자 의견 보내기");
    feedbackButton.title = "독자 의견 보내기";
    feedbackButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2z"/><path d="M8 9h8M8 13h5"/></svg>';
    bar.querySelector("[id$='-theme']").before(feedbackButton);
    body.prepend(bar);

    // Search chapter metadata immediately; load section and visual titles on demand.
    const progressBar = bar.querySelector("[id$='-progress']");
    const spacer = bar.querySelector(".spacer");
    const leftNav = document.createElement("div");
    leftNav.className = "book-nav-left";
    leftNav.append(bar.querySelector("[id$='-menu']"), bar.querySelector("a[class$='-logo']"));
    const rightNav = document.createElement("div");
    rightNav.className = "book-nav-right";
    [...bar.children].filter((el) => el !== spacer && el !== progressBar).forEach((el) => rightNav.appendChild(el));
    spacer.remove();
    const search = document.createElement("div");
    search.className = "book-search";
    search.innerHTML = '<svg class="book-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input type="search" aria-label="이 책의 챕터, 섹션, 시뮬레이터, 그림 검색" placeholder="이 책 검색" autocomplete="off"><div class="book-search-results" aria-live="polite"></div>';
    bar.prepend(leftNav);
    bar.insertBefore(search, progressBar);
    bar.insertBefore(rightNav, progressBar);
    const searchInput = search.querySelector("input");
    const searchResults = search.querySelector(".book-search-results");
    const closeSearch = () => { search.classList.remove("open"); searchResults.replaceChildren(); };
    let detailEntries = [];
    let detailsLoaded = false;
    let detailPromise;
    function loadDetails() {
      if (detailPromise) return detailPromise;
      detailPromise = Promise.all(CHAPTERS.map(async (chapter) => {
        try {
          const response = await fetch(href(chapter.slug));
          if (!response.ok) return [];
          const doc = new DOMParser().parseFromString(await response.text(), "text/html");
          const main = doc.querySelector("main.chapter");
          if (!main) return [];
          const entries = [];
          [...main.querySelectorAll("section > h2")].forEach((heading, i) => {
            entries.push({ type: "섹션", title: heading.textContent.trim(), chapter, hash: heading.parentElement.id || `s${i + 1}` });
          });
          [...main.querySelectorAll(".sim")].filter((sim) => sim.querySelector(".sim-head h3")).forEach((sim, i) => {
            entries.push({ type: "시뮬레이터", title: sim.querySelector(".sim-head h3").textContent.trim(), chapter, hash: sim.id || `search-sim-${i + 1}` });
          });
          [...main.querySelectorAll("figure")].filter((figure) => figure.querySelector("figcaption")).forEach((figure, i) => {
            const caption = figure.querySelector("figcaption").textContent.replace(/\s+/g, " ").trim();
            entries.push({ type: "그림", title: caption.slice(0, 140), chapter, hash: figure.id || `search-fig-${i + 1}` });
          });
          return entries;
        } catch (error) { return []; }
      })).then((parts) => { detailEntries = parts.flat(); detailsLoaded = true; renderSearch(); });
      return detailPromise;
    }
    function renderSearch() {
      const words = searchInput.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      searchResults.replaceChildren();
      if (!words.length) { closeSearch(); return; }
      const includesWords = (value) => words.every((word) => value.toLocaleLowerCase().includes(word));
      const chapterMatches = CHAPTERS.filter((c) => includesWords([c.num, c.title, c.desc, ...(c.tags || [])].join(" ")))
        .map((c) => ({ type: "챕터", title: c.title, chapter: c, hash: "" }));
      const detailMatches = detailEntries.filter((entry) => includesWords(entry.title));
      const matches = [
        ...chapterMatches.slice(0, 4),
        ...detailMatches.filter((entry) => entry.type === "섹션").slice(0, 5),
        ...detailMatches.filter((entry) => entry.type === "시뮬레이터").slice(0, 4),
        ...detailMatches.filter((entry) => entry.type === "그림").slice(0, 4),
      ];
      matches.forEach((entry) => {
        const link = document.createElement("a");
        link.href = href(entry.chapter.slug) + (entry.hash ? `#${entry.hash}` : "");
        const title = document.createElement("strong");
        title.textContent = entry.title;
        const context = document.createElement("small");
        context.textContent = `${entry.chapter.num} · ${entry.chapter.title} · ${entry.type}`;
        link.append(title, context);
        searchResults.appendChild(link);
      });
      if (chapterMatches.length + detailMatches.length > matches.length) {
        const more = document.createElement("p");
        more.textContent = `상위 ${matches.length}개 표시 · 검색어를 더 구체적으로 입력해 보세요`;
        searchResults.appendChild(more);
      }
      if (detailPromise && !detailsLoaded) {
        const status = document.createElement("p");
        status.textContent = "섹션·시뮬레이터·그림 목록을 불러오는 중…";
        searchResults.appendChild(status);
      } else if (!matches.length) {
        const empty = document.createElement("p");
        empty.textContent = "검색 결과가 없습니다";
        searchResults.appendChild(empty);
      }
      search.classList.add("open");
    }
    searchInput.addEventListener("input", () => { if (searchInput.value.trim()) loadDetails(); renderSearch(); });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeSearch(); searchInput.blur(); }
      else if (e.key === "ArrowDown") { const first = searchResults.querySelector("a"); if (first) { e.preventDefault(); first.focus(); } }
      else if (e.key === "Enter") { const first = searchResults.querySelector("a"); if (first) { e.preventDefault(); first.click(); } }
    });
    searchResults.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeSearch(); searchInput.focus(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const links = [...searchResults.querySelectorAll("a")];
        const next = links.indexOf(document.activeElement) + (e.key === "ArrowDown" ? 1 : -1);
        e.preventDefault();
        (links[next] || searchInput).focus();
      }
    });
    document.addEventListener("pointerdown", (e) => { if (!search.contains(e.target)) closeSearch(); });


    // drawer
    const drawer = document.createElement("nav");
    drawer.className = "mb-drawer";
    drawer.innerHTML = `<h4>Chapters</h4><ul class="mb-chlist">
      <li><a href="${href("")}" class="${curSlug ? "" : "active"}"><span class="num">00</span><span>홈 · 로드맵</span></a></li>
      ${CHAPTERS.map((c) => `<li><a href="${href(c.slug)}" class="${c.slug === curSlug ? "active" : ""}"><span class="num">${c.num}</span><span>${c.title}</span></a></li>`).join("")}
    </ul>`;
    const backdrop = document.createElement("div");
    backdrop.className = "mb-drawer-backdrop";
    body.append(backdrop, drawer);
    const toggleDrawer = (o) => body.classList.toggle("drawer-open", o);
    bar.querySelector("#mb-menu").addEventListener("click", () => toggleDrawer(true));
    backdrop.addEventListener("click", () => toggleDrawer(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleDrawer(false); });

    // theme toggle
    const tbtn = bar.querySelector("#mb-theme");
    const setIcon = () => (tbtn.innerHTML = MB.isDark() ? ICON_SUN : ICON_MOON);
    setIcon();
    tbtn.addEventListener("click", () => {
      const next = MB.isDark() ? "light" : "dark";
      try { localStorage.setItem("mb-theme", next); } catch (e) {}
      applyTheme(next); setIcon();
    });

    // progress
    const prog = bar.querySelector("#mb-progress");
    const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%"; };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    // chapter page extras
    const main = document.querySelector("main.chapter");
    if (main) {
      // Give search results stable anchors even when the source has no id.
      [...main.querySelectorAll(".sim")].filter((sim) => sim.querySelector(".sim-head h3")).forEach((sim, i) => { if (!sim.id) sim.id = `search-sim-${i + 1}`; });
      [...main.querySelectorAll("figure")].filter((figure) => figure.querySelector("figcaption")).forEach((figure, i) => { if (!figure.id) figure.id = `search-fig-${i + 1}`; });
      if (/^#(?:s\d+|search-(?:sim|fig)-)/.test(location.hash)) {
        requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
      }
      // numbered h2 + TOC
      const layout = document.createElement("div");
      layout.className = "mb-layout";
      main.parentNode.insertBefore(layout, main);
      layout.appendChild(main);
      const toc = document.createElement("aside");
      toc.className = "mb-toc";
      const h2s = [...main.querySelectorAll("section > h2")];
      let n = 0;
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + h2s.map((h, i) => {
        const sec = h.parentElement;
        if (!sec.id) sec.id = "s" + (i + 1);
        const numbered = !sec.classList.contains("keypoints") && !sec.classList.contains("quiz-sec") && !sec.hasAttribute("data-nonum");
        if (numbered && !h.querySelector(".h-num")) { n++; h.insertAdjacentHTML("afterbegin", `<span class="h-num">${String(n).padStart(2, "0")}</span>`); }
        return `<a href="#${sec.id}">${h.textContent.replace(/^\d\d/, "").trim()}</a>`;
      }).join("");
      layout.appendChild(toc);
      const links = [...toc.querySelectorAll("a")];
      if (window.IntersectionObserver && h2s.length) {
        const io = new IntersectionObserver((es) => {
          es.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); } });
        }, { rootMargin: "-20% 0px -70% 0px" });
        h2s.forEach((h) => io.observe(h.parentElement));
      }

      // pager
      const idx = CHAPTERS.findIndex((c) => c.slug === curSlug);
      const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
      const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;
      const pager = document.createElement("nav");
      pager.className = "mb-pager";
      pager.innerHTML =
        (prev ? `<a class="prev" href="${href(prev.slug)}"><small>← 이전 · ${prev.num}</small>${prev.title}</a>` : `<a class="prev" href="${href("")}"><small>← 처음으로</small>홈 · 로드맵</a>`) +
        (next ? `<a class="next" href="${href(next.slug)}"><small>다음 · ${next.num} →</small>${next.title}</a>` : "");
      layout.after(pager);
    }
    const foot = document.createElement("footer");
    foot.className = "mb-foot";
    foot.innerHTML = `MemoryBook — 공학도를 위한 인터랙티브 메모리 반도체 교과서 · 수치는 교육용 근사 모델입니다.<br>
      © 2026 geniuskey 및 MemoryBook 기여자 · 콘텐츠 <a rel="license" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · 코드 <a href="${root}LICENSE-MIT">MIT</a> · <a href="${root}LICENSE.md">라이선스 안내</a>`;
    const feedbackLink = document.createElement("a");
    feedbackLink.href = feedbackUrl;
    feedbackLink.target = "_blank";
    feedbackLink.rel = "noopener";
    feedbackLink.textContent = "독자 의견";
    foot.append(" · ", feedbackLink);
    body.appendChild(foot);

    // quiz
    document.querySelectorAll(".quiz-q").forEach((q) => {
      const opts = [...q.querySelectorAll("button.opt")];
      opts.forEach((b) => b.addEventListener("click", () => {
        opts.forEach((o) => { o.disabled = true; if (o.hasAttribute("data-correct")) o.classList.add("right"); });
        if (!b.hasAttribute("data-correct")) b.classList.add("wrong");
        q.classList.add("done");
        q.dispatchEvent(new CustomEvent("answered", { bubbles: true, detail: { correct: b.hasAttribute("data-correct") } }));
      }));
    });

    // KaTeX
    const renderMath = () => {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
          throwOnError: false,
          ignoredClasses: ["no-math"],
        });
      }
    };
    if (window.renderMathInElement) renderMath();
    else window.addEventListener("load", renderMath);
  }

  /* Inline glossary: annotate prose only, leaving controls, formulas and quizzes intact. */
  function initGlossary() {
    const main = document.querySelector("main.chapter");
    if (!main) return;
    const aliases = new Map();
    MB.GLOSSARY.forEach((term) => {
      [term.ko, term.en, term.abbr].forEach((label) => {
        label.split(/\s+\/\s+/).forEach((alias) => {
          alias = alias.trim();
          if (alias && !aliases.has(alias.toLowerCase())) aliases.set(alias.toLowerCase(), term);
        });
      });
    });
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp([...aliases.keys()].sort((a, b) => b.length - a.length).map(escape).join("|"), "gi");
    const excluded = "a, button, input, select, textarea, label, output, script, style, pre, code, svg, canvas, math, .katex, .formula, .quiz-q, .fq, #glossary, [contenteditable], .gl-term";
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement.closest(excluded) || /\$\$|\\[([]/.test(node.data)
          ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const terms = new WeakMap();
    const word = (c) => /[a-z0-9_]/i.test(c || "");
    nodes.forEach((node) => {
      const text = node.data, fragment = document.createDocumentFragment();
      let end = 0;
      pattern.lastIndex = 0;
      for (const match of text.matchAll(pattern)) {
        const label = match[0], start = match.index;
        // ASCII terms may take Korean particles, but never match inside SRAM/HBM3E/etc.
        if ((word(label[0]) && word(text[start - 1])) ||
            (word(label.at(-1)) && word(text[start + label.length])) ||
            (/[가-힣]/.test(label[0]) && /[가-힣]/.test(text[start - 1] || ""))) continue;
        fragment.append(text.slice(end, start));
        const span = document.createElement("span");
        span.className = "gl-term";
        span.tabIndex = 0;
        span.textContent = label;
        terms.set(span, aliases.get(label.toLowerCase()));
        fragment.append(span);
        end = start + label.length;
      }
      if (end) { fragment.append(text.slice(end)); node.replaceWith(fragment); }
    });
    const tooltip = document.createElement("div");
    tooltip.id = "mb-glossary-tooltip";
    tooltip.className = "gl-tooltip no-math";
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;
    document.body.append(tooltip);
    let active, timer;
    function hide() {
      clearTimeout(timer);
      if (active) active.removeAttribute("aria-describedby");
      active = null;
      tooltip.hidden = true;
    }
    function show(target) {
      clearTimeout(timer);
      const term = terms.get(target);
      if (!term) return;
      if (active) active.removeAttribute("aria-describedby");
      active = target;
      const title = document.createElement("strong"), definition = document.createElement("p");
      // Only show the abbreviation being explained, and never repeat the same name.
      const abbreviations = term.abbr.split(/\s+\/\s+/).filter(Boolean);
      const selected = abbreviations.find((abbr) => abbr.toLowerCase() === target.textContent.toLowerCase());
      const names = [term.ko, selected || (abbreviations.length === 1 ? abbreviations[0] : "")];
      title.textContent = names.filter((name, i) => name &&
        !names.slice(0, i).some((previous) => previous.toLowerCase() === name.toLowerCase())).join(" · ");
      definition.textContent = term.def;
      tooltip.replaceChildren(title, definition);
      tooltip.hidden = false;
      target.setAttribute("aria-describedby", tooltip.id);
      const rect = target.getBoundingClientRect(), gap = 8;
      const width = tooltip.offsetWidth, height = tooltip.offsetHeight;
      const left = Math.max(gap, Math.min(rect.left, innerWidth - width - gap));
      const top = rect.bottom + gap + height <= innerHeight - gap
        ? rect.bottom + gap : Math.max(gap, rect.top - height - gap);
      tooltip.style.left = left + "px";
      tooltip.style.top = top + "px";
    }
    const closeSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (document.activeElement !== active) hide(); }, 150);
    };
    main.addEventListener("pointerover", (event) => {
      if (event.pointerType !== "touch") show(event.target.closest(".gl-term"));
    });
    main.addEventListener("pointerout", (event) => { if (event.target.closest(".gl-term")) closeSoon(); });
    main.addEventListener("focusin", (event) => show(event.target.closest(".gl-term")));
    main.addEventListener("focusout", (event) => { if (event.target.closest(".gl-term")) closeSoon(); });
    main.addEventListener("click", (event) => show(event.target.closest(".gl-term")));
    tooltip.addEventListener("pointerenter", () => clearTimeout(timer));
    tooltip.addEventListener("pointerleave", closeSoon);
    document.addEventListener("pointerdown", (event) => {
      if (!event.target.closest(".gl-term, .gl-tooltip")) hide();
    });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") hide(); });
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { build(); initGlossary(); });
  else { build(); initGlossary(); }
})();

// Simulator deep links: add a shareable # link to each simulator heading.
(function () {
  function addSimulatorLinks() {
    document.querySelectorAll(".sim[id] > .sim-head").forEach((head) => {
      if (head.querySelector(".sim-link")) return;
      const link = document.createElement("a");
      link.className = "sim-link";
      link.href = "#" + head.parentElement.id;
      link.textContent = "#";
      link.title = "이 시뮬레이터로 가는 링크";
      link.setAttribute("aria-label", "이 시뮬레이터로 가는 링크");
      head.appendChild(link);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addSimulatorLinks, { once: true });
  } else {
    addSimulatorLinks();
  }
})();
