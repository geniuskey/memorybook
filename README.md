# MemoryBook — 인터랙티브 메모리 반도체 교과서

비트 하나에서 테라바이트까지. 공대 학부생을 위한 한국어 메모리 반도체 학습 사이트입니다.
14개 챕터, 70여 개의 시뮬레이터, 3D 구조 모델(three.js)로 구성됩니다.

## 실행
빌드 과정이 없는 정적 사이트입니다.

```bash
python3 -m http.server 8000   # → http://localhost:8000
```
`index.html`을 브라우저로 바로 열어도 동작합니다. KaTeX, three.js, 폰트는 CDN에서 불러오므로 인터넷 연결이 필요합니다.

## 구성
| 장 | 파일 | 주제 |
|---|---|---|
| 01 | chapters/hierarchy.html | 메모리 계층, 지역성, 캐시 AMAT, 메모리 월, 리틀의 법칙 |
| 02 | chapters/device.html | MOSFET 스위치, 누설 전류, 커패시터·전하 저장, 양자 터널링 |
| 03 | chapters/sram.html | 6T 셀, 버터플라이 곡선·SNM, 센스 앰프, 캐시 구조 |
| 04 | chapters/dram-cell.html | 1T1C 셀, 전하 공유, 비트라인 센싱, 3D DRAM 어레이 |
| 05 | chapters/dram-ops.html | ACT/RD/WR/PRE, 타이밍 파라미터, 뱅크·로우 버퍼, 리프레시 |
| 06 | chapters/interface.html | DDR/LPDDR/GDDR, 대역폭 계산, 아이 다이어그램, PAM4/PAM3 |
| 07 | chapters/hbm.html | HBM 3D 구조, TSV·마이크로범프, 인터포저, 수율·열 |
| 08 | chapters/nand.html | 플로팅 게이트·차지 트랩, ISPP, Vt 분포, SLC~QLC |
| 09 | chapters/vnand.html | 3D NAND 3D 구조, 채널 홀, 계단, CMOS 언더 어레이 |
| 10 | chapters/ssd.html | FTL, 가비지 컬렉션, 쓰기 증폭, 웨어 레벨링, NVMe |
| 11 | chapters/reliability.html | 리텐션, 로우 해머, 디스터브, 해밍 코드~LDPC |
| 12 | chapters/emerging.html | MRAM, PCM, ReRAM, FeRAM, CXL, PIM, CIM |
| 13 | chapters/design.html | 루프라인, LLM 메모리 계산, 메모리 시스템 설계 플레이그라운드 |
| 14 | chapters/glossary.html | 용어집, 종합 퀴즈(20문항) |

공통 코드: `css/style.css`(디자인 토큰, 라이트/다크), `js/common.js`(내비게이션, 캔버스·차트·3D 헬퍼, 전역 `MB`).
챕터 작성 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

시뮬레이터의 수치는 교육용 근사 모델입니다. 제품 수치는 2024~2026년 공개 자료 기준의 대략값입니다.
