# 본&결 화원 공식 사이트

정적 사이트. 빌드 없음 — HTML 파일을 직접 수정합니다.

## 페이지

| 파일 | 내용 |
|---|---|
| `index.html` | 메인 (철학·2트랙·계약 원칙·케어·문의) |
| `platform.html` | 창작자 플랫폼 (프로젝트 카드·스태프 지원) |
| `curriculum.html` | 12주 작곡 커리큘럼 |

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
