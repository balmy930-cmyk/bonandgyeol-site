# 본&결 화원 공식 사이트

정적 1페이지. `index.html` 하나만 수정하면 됨.

## 배포
`main` 브랜치에 push → GitHub Actions → Cloudflare Pages 자동 배포.

## 최초 1회 설정
1. GitHub 저장소 생성 후 이 폴더 push
2. Cloudflare 대시보드 → Workers 및 Pages → 프로젝트명 `bonandgyeol` 생성
3. GitHub 저장소 → Settings → Secrets and variables → Actions
   - `CLOUDFLARE_API_TOKEN` (Cloudflare My Profile → API Tokens → **Create Custom Token**
     → 권한: **Account · Cloudflare Pages · Edit** / 계정 리소스: 본인 계정 선택)
   - `CLOUDFLARE_ACCOUNT_ID` (Cloudflare 대시보드 우측 또는 URL에서 확인)
4. 가비아 네임서버를 Cloudflare 지정 네임서버로 변경
5. Cloudflare Pages → 사용자 설정 도메인 → bonandgyeol.com 연결

## 수정 방법
`index.html` 수정 → commit → push. 끝.
