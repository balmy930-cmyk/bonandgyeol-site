# 본&결 화원 공식 사이트

정적 사이트. 빌드 없음 — HTML 파일을 직접 수정합니다.

## 페이지

| 파일 | 공개 주소 | 내용 |
|---|---|---|
| `index.html` | `/` | 작동 방식 · 크레딧 · 계약 · 케어 · 교육 · fakeREAL · 소개 · 문의 |
| `platform.html` | `/platform` | 모집 중인 곡, 스태프 지원 |
| `curriculum.html` | `/curriculum` | 12주 과정 (Suno·DAW 2트랙) |
| `404.html` | (미매칭 경로) | Cloudflare Pages가 자동 사용 |

> Cloudflare Pages는 `.html`을 벗긴 주소로 **308 리다이렉트**합니다.
> 내부 링크·canonical·sitemap은 모두 확장자 없는 형태(`/platform`)를 씁니다.
> `.html`로 링크하면 리다이렉트가 한 번 더 발생합니다.

## 배포

`main`에 push → GitHub Actions → Cloudflare Pages. 실측 30~60초.

최초 설정은 [DEPLOY.md](DEPLOY.md) 참고.

```bash
git add -A
git commit -m "수정 내용"
git push
```

### 배포되는 파일

허용목록 방식 — [.github/workflows/deploy.yml](.github/workflows/deploy.yml)의 `Stage public files` 단계.

- **올라감**: `.html` `.txt` `.xml` `.json` `.png` `.jpg` `.svg` `.webp` `.ico`, `assets/`, `_headers`, `_redirects`
- **안 올라감**: `.md` 문서(README·REPORT·DEPLOY·CLAUDE), `.github/`

새 `.html`은 워크플로 수정 없이 자동 포함됩니다.

---

## 구글폼 주소

접수는 구글폼 2종. 주소를 바꾸면 **아래 위치를 전부** 고쳐야 합니다.

| 폼 | 용도 | 들어간 위치 |
|---|---|---|
| A | 곡 등록 | `index.html` 히어로 CTA · 함께하기 「곡 등록」 door<br>`platform.html` 히어로 CTA · 함께하기 「곡 등록 폼」 |
| B | 스태프 지원 | `index.html` 함께하기 「스태프 지원」 door<br>`platform.html` 히어로 CTA · 함께하기 「스태프 지원 폼」 · script `STAFF_FORM` 상수(카드 버튼) |

```bash
grep -n "docs.google.com/forms" *.html
```

폼 링크는 모두 `target="_blank" rel="noopener"` + `.sr-only` "(새 창에서 열림)"를 붙입니다.
같은 문구의 링크가 서로 다른 폼을 가리킬 때는 `.sr-only`로 목적지를 구분합니다.

> ⚠️ 폼 **편집 URL**(`/forms/d/<id>/edit`)은 저장소에 넣지 마세요. 공개 저장소라 링크를 아는 사람이 폼을 수정할 수 있습니다. 응답 URL(`/forms/d/e/<id>/viewform`)만 둡니다.

---

## 곡 추가 (platform.html)

`PROJECTS` 배열에 객체 하나를 추가합니다.

```js
{
  name: '프로젝트명',
  genre: '장르',
  key: 'Bm', bpm: '100', meter: '12/8 굿거리',
  roles: ['편곡', '믹싱', '보컬'],
  status: '스태프 모집 중',
  state: 'open',                              // open | soon | done
  embed: { type:'soundcloud', src:'...' }     // 없으면 null
}
```

음원은 직접 호스팅하지 않고 SoundCloud/YouTube 임베드만 씁니다.

## 영상·게시물 추가 (index.html)

`MEDIA` 배열에 객체를 넣습니다. **배열이 비면 기록 블록 전체가 숨겨집니다.**
표시 위치는 `#fakereal` 섹션 안입니다.

| kind | 필수 필드 | 렌더 방식 |
|---|---|---|
| `youtube` | `id` | iframe · `youtube-nocookie.com/embed/{id}?rel=0` · 16:9 |
| `soundcloud` | `url` | iframe · `w.soundcloud.com/player` · 높이 166px |
| `instagram` | `url` | 링크 카드 「Instagram에서 보기 ↗」 |
| `x` | `url` | 링크 카드 「X에서 보기 ↗」 |

`title`·`desc`는 선택. 형식이 맞지 않는 항목은 조용히 건너뜁니다.

```js
const MEDIA = [
  { kind:'youtube',    id:'abc123',                          title:'Vol.08 MV', desc:'설명' },
  { kind:'soundcloud', url:'https://soundcloud.com/계정/트랙', title:'마스터',    desc:'' },
  { kind:'instagram',  url:'https://www.instagram.com/p/ID/', title:'작업 과정', desc:'' },
  { kind:'x',          url:'https://x.com/계정/status/ID',     title:'',          desc:'' },
];
```

- **파일 직접 호스팅 없음** — 임베드 또는 링크만
- **외부 위젯 스크립트 금지** — Instagram·X는 링크 카드로만
- iframe에 `title`·`loading="lazy"`·`referrerpolicy`가 자동으로 붙습니다
- 새 임베드 도메인은 [`_headers`](_headers)의 CSP `frame-src`에 추가해야 합니다

---

## 카피 작성 규칙

**한 자리에 하나만** — 헤드는 캐치(짧게), 본문은 설명(사실만). 한 문장에 섞지 않습니다.

| 금지 | 예 |
|---|---|
| 비유·은유 | 자란다 / 무늬 / 뿌리 / 결실 / 문은 하나 |
| "A가 아니라 B" 대구 | "번아웃은 재능의 문제가 아니라 구조의 문제입니다" |
| 회사가 주어인 헤드 | "저희는 …합니다" → 사용자 주어로 |
| 형용사 나열 | — |
| 없는 실적 | 수강생 수·참여자 수·발매 실적·수상·만족도 |
| 수강료·개강일·정원 | 미확정이므로 표기하지 않음 |

**쓸 것**: 명사구 또는 사실 진술, 숫자 우선 (12주 / 4가지 / 10~25%).

공개 가능한 확정 수치 — 매칭 수수료 0% · 매니지먼트 수수료 10~25% · 월 1회 세션 · 연 4주 안식 · 실전 6주 상한 · 페르소나 자율.

검사:

```bash
grep -nE '자란다|자라는|무늬|뿌리|결실|아니라' *.html
```

---

## 수정 시 주의사항

| 항목 | 주의 |
|---|---|
| **`.wrap`과 다른 클래스 병용** | 뒤에 오는 규칙이 `padding`을 덮어씁니다. `.dict{padding:90px 24px}`처럼 좌우값을 반드시 유지 (실제로 여백이 0이 된 사고 있었음) |
| **`html.js` 게이팅** | `.reveal`·모바일 네비는 **기본이 보이는 상태**이고 `html.js`가 붙을 때만 애니메이션·드롭다운이 켜집니다. 기본값을 숨김으로 바꾸면 JS 없는 환경에서 백지가 됩니다 |
| **`[hidden]`** | `.nav-links a`의 `display:flex`가 `hidden` 속성을 덮어써서 `[hidden]{display:none !important}`가 필요합니다 |
| **Cloudflare Analytics** | beacon이 HTML에만 자동 주입됩니다. CSP `script-src`·`connect-src`에 cloudflareinsights가 있어야 하며, 없으면 조용히 차단돼 수집이 0건이 됩니다 |
| **curl로 안 보이는 것** | beacon 주입은 브라우저 요청에만 붙습니다. 배포 확인은 curl + 브라우저 콘솔 둘 다 봐야 합니다 |
| **한글 폰트 서브셋** | Google Fonts는 한글을 글자 단위 서브셋으로 나눕니다. og.png 렌더처럼 폰트를 직접 쓸 때는 글자마다 맞는 서브셋을 받아야 합니다(안 그러면 두부 □) |
| **og.png** | 1200×630, 저장소에 자체 호스팅. 워드마크를 바꾸면 다시 렌더해야 합니다 |

---

## 디자인 규칙

| 항목 | 값 |
|---|---|
| 팔레트 | `#5C7348` (대나무) / `#22231F` (먹) / `#EDEBE3` (한지) |
| 서체 | Cormorant Garamond · Gowun Batang · IBM Plex Sans KR |
| 제약 | 단일 HTML 파일, 인라인 CSS/JS, 외부 이미지 CDN 없음, 빌드 도구·프레임워크 없음 |
| 접근성 | 클릭 영역 44px+, focus-visible, 대비 4.5:1, prefers-reduced-motion, Escape로 메뉴 닫기 |

로고(`.logo .amp`, `.wordmark-ko .ko-accent`)의 대비 4.40은 WCAG 로고타입 예외로 유지합니다.

## 문서

| 파일 | 내용 |
|---|---|
| [CLAUDE.md](CLAUDE.md) | 상시 규칙 — 금지선·카피 규칙·검증 절차·확정 결정 |
| [DEPLOY.md](DEPLOY.md) | 배포 설정 절차 (초보자용) |
| [REPORT.md](REPORT.md) | 세션별 작업 보고서 |
