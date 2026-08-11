# 작업 보고서 — 2026-08-11

배포 커밋: `d6ac61c` · 저장소 상태: clean

---

## 1. 두호 결정 필요

| # | 항목 | 선택지 | 권장 | 근거 |
|---|---|---|---|---|
| 1 | PSI API 키 | (a) 무료 키 발급 (b) Node 설치 (c) 측정 보류 | **(a)** | Lighthouse 4개 지표가 이것 없이는 측정 불가. 키 1개면 자동화 가능 |
| 2 | 폰트 셀프호스팅 | (a) 375자 정확 서브셋 (b) 현행 유지 | **(b) 지금은 유지** | 전송량 −90%지만, 새 문자 쓰면 그 글자만 대체 폰트로 렌더. 카피 변경이 잦은 현 단계에선 위험 |
| 3 | og:image | (a) `og.png` 자체 호스팅 허용 (b) 없이 감 | **(a)** | 카톡·X 공유 시 썸네일 없음. 자체 호스팅은 외부 요청이 아니라 "외부 이미지 금지"와 충돌하지 않을 수 있으나 해석 필요 |
| 4 | 로고 대비 4.40 | (a) 로고타입 예외로 유지 (b) 로고 색 변경 | **(a)** | WCAG 1.4.3이 로고타입을 명시 예외 처리. 팔레트 변경 금지 규칙과도 충돌 |
| 5 | 커리큘럼 DAW W6 | (a) 「가사 작법」 유지 (b) 확정안 전달 | **(b)** | W3이 「탑라인」이 되며 기존 W6과 중복돼 임의로 옮긴 것. 확정 목록이 필요 |

---

## 2. 요약

| # | 항목 | 상태 | 커밋 |
|---|---|---|---|
| A2 | Lighthouse 4개 지표 | ❌ 실패 — node·npx 없음 + PSI API 일일 쿼터 초과(429) | — |
| A4 | 스크린샷 3종 | ❌ 실패 — 브라우저 패널 미표시로 프레임 합성 불가. 계산값 검증으로 대체 | — |
| B4 | 폰트 셀프호스팅 | ⏸️ 보류 — 지시대로 계산만. 구현은 결정 1-2번 대기 | — |
| C2 | MEDIA 영상 섹션 | ⚠️ 부분 — 구조는 라이브 동작, 항목 0개(주소 미확보)로 화면에는 미표시 | `d626465` |
| A1 | 4개 URL 200 + 정규 URL 수정 | ✅ | `d47a180` |
| A3 | 접근성 재점검 | ✅ | — |
| B1 | 404.html | ✅ | `f72e717` |
| B2 | sitemap lastmod | ✅ | `46aaeee` |
| B3 | Analytics 주입·sitemap 오염 확인 | ✅ | `ef24438` |
| B5 | DAW W2 진행과 감정 / W3 탑라인 | ✅ | `46aaeee` |
| C1 | 대메뉴 3개 | ✅ | `e196f4c` |
| C3 | 「본과 결」 하단 이동 | ✅ | `105eab3` |
| D1 | README 폼·MEDIA 표 | ✅ | `da193ef` |
| D2 | REPORT 갱신 | ✅ | 이 커밋 |

---

## 3. 검증

### 필수 확인 (curl, 세션 종료 시점)

| 항목 | 방법 | 결과 |
|---|---|---|
| `https://bonandgyeol.com` | curl -sI | `HTTP/1.1 200 OK` |
| `https://bonandgyeol.com/platform` | curl -sI | `HTTP/1.1 200 OK` |
| `https://bonandgyeol.com/curriculum` | curl -sI | `HTTP/1.1 200 OK` |
| `https://bonandgyeol.com/sitemap.xml` | curl -sI | `HTTP/1.1 200 OK` |

### 배포 상태

| 항목 | 방법 | 결과 |
|---|---|---|
| `.html` 주소 처리 | curl -sI | `/platform.html` → **308** → `/platform` |
| 문서 파일 비공개 | curl | `README.md` `REPORT.md` `DEPLOY.md` 전부 **404** (허용목록 정상) |
| 없는 경로 | curl | **404** + `404.html` 서빙 확인 |
| 보안 헤더 | curl -sI | CSP·HSTS·nosniff·Referrer-Policy·Permissions-Policy 전부 적용 |
| 압축 | curl --compressed | **br** (3페이지) |

### 성능 (Lighthouse 대체)

| 페이지 | 방법 | TTFB | 전송량 |
|---|---|---|---|
| `/` | curl 실측 | 0.62s | 10,453 B |
| `/platform` | curl 실측 | 0.66s | 7,798 B |
| `/curriculum` | curl 실측 | 0.56s | 8,441 B |

> TTFB는 이 머신 → Cloudflare edge 1회 측정값. 사용자 환경 대표값 아님. LCP·CLS·TBT는 미측정(결정 1번).

### 접근성 (브라우저, 라이브 3페이지)

| 항목 | 방법 | 결과 |
|---|---|---|
| image-alt / frame-title / link-name | 브라우저 DOM 검사 | 0건 |
| heading-order / h1 개수 | 브라우저 DOM 검사 | 0건 |
| duplicate-id / 빈 href | 브라우저 DOM 검사 | 0건 |
| aria-controls·labelledby 대상 존재 | 브라우저 DOM 검사 | 0건 |
| target-size 44px | `getBoundingClientRect` | 0건 |
| skip link / main 랜드마크 | 브라우저 DOM 검사 | 3페이지 모두 존재 |
| 명도 대비 | 계산 (상대휘도) | **2건** — `.logo .amp`(&) 4.40, `.wordmark-ko .ko-accent`(결) 4.40. 둘 다 로고타입 → 결정 4번 |

> axe는 설치 불가(node 없음). 위 항목은 axe 주요 규칙을 직접 구현해 검사한 것.

### 뷰포트 (브라우저 계산값)

| 뷰포트 | 방법 | 가로 스크롤 | 넘친 요소 | 44px 미달 | 네비 |
|---|---|---|---|---|---|
| 320px | `scrollWidth` / `getBoundingClientRect` | 없음 | 0 | 0 | 모바일 |
| 768px | 동일 | 없음 | 0 | 0 | 모바일 |
| 1440px | 동일 | 없음 | 0 | 0 | 데스크톱 |

index 3종 전부 / platform 320·1440 / curriculum 320 통과. 스크린샷은 미캡처.

### Analytics 주입 (B3)

| 항목 | 방법 | 결과 |
|---|---|---|
| sitemap Content-Type | curl -sI | `application/xml` |
| sitemap 내 `<script>` | curl + grep | **0개 — 오염 없음** |
| HTML 내 beacon | **curl** | 0건 (주입 안 됨) |
| HTML 내 beacon | **브라우저** | **1건 주입됨** |
| beacon 로드 (수정 전) | 브라우저 콘솔 | **CSP 차단** — script-src 위반 |
| beacon 로드 (수정 후) | 브라우저, 새 탭 | 콘솔 오류 0건, `__cfBeacon` 설정, `/cdn-cgi/rum` 전송 1건 |

> curl과 브라우저 결과가 갈린 항목. Cloudflare는 브라우저 요청에만 beacon을 주입하므로 curl 점검만으로는 이 문제를 못 잡는다.

### 폰트 (B4)

| 항목 | 방법 | 결과 |
|---|---|---|
| 폰트 CSS 크기 | curl 실측 | 79,819 B |
| 선언된 `@font-face` | CSS 파싱 | 576개 |
| 사이트 사용 문자 | HTML 텍스트 추출 | 375자 |
| 매칭되는 face | unicode-range 대조 | 128개 |
| 매칭 face 총 용량 | 128× `curl -sI` Content-Length | 1,817.7 KB |
| — Cormorant Garamond | 동일 | 2 face · 73.5 KB |
| — Gowun Batang | 동일 | 42 face · 647.8 KB |
| — IBM Plex Sans KR | 동일 | 84 face · 1,096.4 KB |
| 서브셋 전환 후 용량 | **추정** | **~190 KB (추정)** — 8 face 기준 |
| 서브셋 전환 후 요청 수 | 계산 | 8 (CSS 1 + 128 → 8) |

### 파일 크기 (실측)

| 파일 | 크기 |
|---|---|
| index.html | 32,411 B |
| platform.html | 22,487 B |
| curriculum.html | 29,486 B |
| 404.html | 4,967 B |
| _headers | 2,587 B |
| sitemap.xml | 598 B |

### 링크·구조 (로컬 스크립트)

| 항목 | 방법 | 결과 |
|---|---|---|
| 깨진 내부 링크·앵커 | 정규식 전수 검사 (확장자 없는 경로 해석 포함) | 0건 |
| 블록 태그 열림/닫힘 | 동일 | 0건 |
| h1 개수 / 빈 링크 텍스트 | 동일 | 0건 |

---

## 4. 변경 상세

| 항목 | 변경 | 커밋 | 검증 |
|---|---|---|---|
| 정규 URL | sitemap loc·canonical·og:url을 확장자 없는 형태로. 내부 링크 15곳 교체 | `d47a180` | curl 200 ×4, 전수 링크 검사 0건 |
| CSP | `script-src`에 `static.cloudflareinsights.com`, `connect-src`에 `cloudflareinsights.com` 추가 | `ef24438` | curl -sI로 헤더 반영 확인 + 브라우저에서 RUM 전송 1건 |
| sitemap lastmod | 2026-08-04 → 2026-08-11 | `46aaeee` | XML 파싱 |
| DAW 트랙 | W2 「진행과 감정」, W3 「탑라인」. 중복된 W6은 「가사 작법」으로 | `46aaeee` | 브라우저에서 12주 목록 확인 |
| Suno 트랙 | 12주 신규 + 트랙 전환 탭 (role=tablist, ←→ 키, no-JS 폴백) | `af281af` | 클릭·키보드 전환, 원본 HTML의 hidden 속성 확인 |
| 카피 v3 | 서사체 제거, 헤드/본문 분리, 수치 우선 | `105eab3` | 금지표현 grep 0건 |
| README | 공개 주소 표 + 308 주의, MEDIA kind 4종 사용법 | `da193ef` | — |

---

## 5. 미해결·리스크

| # | 항목 | 원인 | 권장조치 |
|---|---|---|---|
| 1 | Lighthouse 미측정 | node 없음 + PSI 무키 공용 쿼터 초과 | 결정 1번. 키 확보 후 3페이지 측정 |
| 2 | 스크린샷 미캡처 | 브라우저 패널이 표시되지 않아 합성 프레임 없음 | 시각 확인이 필요하면 두호가 직접 3뷰포트 확인 |
| 3 | Analytics 대시보드 미확인 | RUM 전송은 확인했으나 집계 화면은 볼 수 없음 | Cloudflare 대시보드에서 데이터 유입 확인 |
| 4 | MEDIA 0개 | fakeREAL 영상·트랙 주소 미확보 | 주소 전달 |
| 5 | 커리큘럼 내용 미검증 | 12주 주차 문구는 브랜드 톤 기반으로 내가 작성. 실제 강의 계획과 대조된 적 없음 | 두호가 대조 |
| 6 | Vol.08 장르 표기 | 「국악 크로스오버」는 추정값 | 확정 시 `PROJECTS` 수정 |
| 7 | TTFB 단일 측정 | 1회 측정, 단일 위치 | 필요 시 다지점·반복 측정 |
| 8 | `'unsafe-inline'` CSP | 인라인 CSS·JS 구조상 필요. 해시 방식은 수정마다 깨짐 | 현 구조에선 유지. 외부 스크립트 주입은 여전히 차단됨 |

---

## 6. 다음 세션 큐

| # | 항목 | 선행조건 |
|---|---|---|
| 1 | Lighthouse 4개 지표 3페이지 측정 | **두호 결정 1번** (PSI 키 또는 Node) |
| 2 | Analytics 데이터 유입 확인 후 기록 | 없음 (대시보드 확인은 두호) |
| 3 | og:image 제작·삽입 | **두호 결정 3번** |
| 4 | MEDIA 항목 입력 | fakeREAL 영상·트랙 주소 |
| 5 | 커리큘럼 DAW W6 확정 반영 | **두호 결정 5번** |
| 6 | 폰트 서브셋 전환 | **두호 결정 2번** (권장은 보류) |
