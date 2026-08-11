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

`main` 브랜치에 push → GitHub Actions → Cloudflare Pages 자동 배포.

**최초 설정은 [DEPLOY.md](DEPLOY.md)를 따라가세요.** 클릭 단위로 정리되어 있습니다.

설정이 끝난 뒤에는:

```bash
git add -A
git commit -m "수정 내용"
git push
```

### 배포되는 파일

허용목록 방식입니다. [.github/workflows/deploy.yml](.github/workflows/deploy.yml)의 `Stage public files` 단계 참고.

- **올라감**: `.html` `.txt` `.xml` `.json` `.png` `.jpg` `.svg` `.webp` `.ico`, `assets/` 폴더
- **안 올라감**: `.md` 문서(README·REPORT·DEPLOY), `.github/`

새 `.html` 페이지는 워크플로 수정 없이 자동 포함됩니다.

## 곡 추가 (platform.html)

`platform.html` 하단 `PROJECTS` 배열에 객체 하나를 추가합니다.

```js
{
  name: '프로젝트명',
  genre: '장르',
  key: 'Bm', bpm: '100', meter: '12/8 굿거리',
  roles: ['편곡', '믹싱', '보컬'],
  status: '스태프 모집 중',
  state: 'open',                    // open | soon | done
  embed: { type:'soundcloud', src:'...' }   // 없으면 null
}
```

음원은 직접 호스팅하지 않고 SoundCloud/YouTube 임베드만 사용합니다.

## 구글폼 주소

접수는 구글폼 2종으로 받습니다. 주소를 바꾸면 **아래 위치를 전부** 고쳐야 합니다.

| 폼 | 용도 | 들어간 위치 |
|---|---|---|
| A | 곡 등록 | `index.html` 히어로 CTA · 함께하기 「곡 등록」 door<br>`platform.html` 히어로 CTA · 함께하기 「곡 등록 폼」 |
| B | 스태프 지원 | `index.html` 함께하기 「스태프 지원」 door<br>`platform.html` 히어로 CTA · 함께하기 「스태프 지원 폼」 · script `STAFF_FORM` 상수(카드 버튼) |

찾는 법:

```bash
grep -n "docs.google.com/forms" *.html
```

폼 링크는 모두 `target="_blank" rel="noopener"` + `.sr-only` "(새 창에서 열림)" 안내를 붙입니다.

> ⚠️ 폼 **편집 URL**(`/forms/d/<id>/edit`)은 이 저장소에 넣지 마세요. 공개 저장소라 링크를 아는 사람이 폼을 수정할 수 있습니다. 저장소에는 응답 URL(`/forms/d/e/<id>/viewform`)만 둡니다.

## 영상·게시물 추가 (index.html)

`index.html` 하단 script의 `MEDIA` 배열에 객체를 넣습니다.
**배열이 비어 있으면 기록 블록 전체가 숨겨집니다** (없는 실적 표기 금지).
표시 위치는 `#fakereal` 섹션 안입니다.

| kind | 필수 필드 | 렌더 방식 |
|---|---|---|
| `youtube` | `id` (영상 ID) | iframe · `youtube-nocookie.com/embed/{id}?rel=0` · 16:9 |
| `soundcloud` | `url` (트랙 주소) | iframe · `w.soundcloud.com/player` · 높이 166px |
| `instagram` | `url` (게시물 주소) | 링크 카드 「Instagram에서 보기 ↗」 |
| `x` | `url` (포스트 주소) | 링크 카드 「X에서 보기 ↗」 |

`title`·`desc`는 모든 kind에서 선택입니다. 형식이 맞지 않는 항목은 조용히 건너뜁니다.

```js
const MEDIA = [
  { kind:'youtube',    id:'abc123',                          title:'Vol.08 MV', desc:'설명' },
  { kind:'soundcloud', url:'https://soundcloud.com/계정/트랙', title:'마스터',    desc:'' },
  { kind:'instagram',  url:'https://www.instagram.com/p/ID/', title:'작업 과정', desc:'' },
  { kind:'x',          url:'https://x.com/계정/status/ID',     title:'',          desc:'' },
];
```

규칙:

- **파일 직접 호스팅 없음** — 임베드 또는 링크만
- **외부 위젯 스크립트 금지** — Instagram·X는 링크 카드로만 (추적 스크립트 회피)
- iframe에는 `title` · `loading="lazy"` · `referrerpolicy`가 자동으로 붙습니다
- 새 임베드 도메인을 쓰려면 [`_headers`](_headers)의 CSP `frame-src`에 추가해야 합니다

## 디자인 규칙

| 항목 | 값 |
|---|---|
| 팔레트 | `#5C7348` (대나무) / `#22231F` (먹) / `#EDEBE3` (한지) |
| 서체 | Cormorant Garamond · Gowun Batang · IBM Plex Sans KR |
| 제약 | 단일 HTML 파일, 인라인 CSS/JS, 외부 이미지 없음 |
| 접근성 | 클릭 영역 44px+, focus-visible, 대비 4.5:1, prefers-reduced-motion |

없는 실적(참여자 수·수강생 수·성사 건수)은 표기하지 않습니다.

## 문서

| 파일 | 내용 |
|---|---|
| [DEPLOY.md](DEPLOY.md) | 배포 설정 전체 절차 (초보자용) |
| [REPORT.md](REPORT.md) | 작업 리포트 · 측정 결과 · 미해결 항목 |
