# 배포 가이드 — 처음부터 끝까지

bonandgyeol-site를 인터넷에 올리는 전체 절차입니다. **웹 개발 처음이어도 따라올 수 있게** 클릭 위치까지 적었습니다.

---

## 먼저 알아둘 것

### 지금 상태

| 항목 | 상태 |
|---|---|
| 웹사이트 파일 (HTML 3개) | ✅ 완성 |
| GitHub 저장소 | ✅ 업로드됨 |
| 자동 배포 설정 파일 | ✅ 있음 |
| **Cloudflare 프로젝트** | ❌ **없음 ← 지금 만들 것** |
| **비밀번호 2개 등록** | ❌ **없음 ← 지금 등록할 것** |
| 도메인 연결 | ❌ 나중에 |

지금 `git push`를 해도 배포가 **실패**합니다. Cloudflare에 로그인할 열쇠가 없기 때문입니다. 이 문서가 그 열쇠를 만드는 과정입니다.

### 용어 3개만

| 용어 | 뜻 |
|---|---|
| **Cloudflare Pages** | 웹사이트 파일을 올려두면 인터넷에 보여주는 무료 서비스 |
| **API 토큰** | GitHub이 Cloudflare에 자동 로그인할 때 쓰는 비밀번호 |
| **Secrets** | GitHub에 비밀번호를 안전하게 숨겨두는 금고 |

### 🔒 보안 규칙 (중요)

- API 토큰은 **비밀번호와 같습니다.**
- 토큰을 **채팅창·메모장·코드 파일에 붙여넣지 마세요.**
- 오직 **GitHub Secrets 입력칸**에만 붙여넣습니다.
- 토큰은 생성 직후 **딱 한 번만** 화면에 보입니다. 창을 닫으면 다시 못 봅니다.

### 총 소요 시간

| 단계 | 시간 |
|---|---|
| 1~6단계 (배포까지) | 약 20~30분 |
| 7~9단계 (도메인 연결) | 약 15분 + **대기 최대 24시간** |

---

# 1부. 사이트를 인터넷에 올리기

## 1단계 — Cloudflare 계정 만들기

이미 계정이 있으면 2단계로 건너뛰세요.

1. https://dash.cloudflare.com/sign-up 접속
2. 이메일과 비밀번호 입력 → **Sign Up** 클릭
3. 받은 메일함에서 인증 메일의 링크 클릭

> ⚠️ 비밀번호는 직접 입력하세요. 계정 생성은 본인만 할 수 있습니다.

---

## 2단계 — Pages 프로젝트 만들기

**이 단계를 건너뛰면 배포가 실패합니다.** 자동 배포는 "이미 존재하는 프로젝트"에만 파일을 올릴 수 있습니다.

1. https://dash.cloudflare.com 로그인
2. 왼쪽 메뉴에서 **Workers & Pages** 클릭
   - (한글 표시: **Workers 및 Pages**)
3. **Create application** 버튼 클릭
   - (한글: **애플리케이션 생성**)
4. 상단 탭에서 **Pages** 선택
5. **Upload assets** 또는 **Drag and drop your files** 클릭
   - ⚠️ **"Connect to Git"을 누르지 마세요.** GitHub 연결은 필요 없습니다. 우리는 GitHub Actions로 배포합니다.
6. 프로젝트 이름 칸에 정확히 입력:
   ```
   bonandgyeol
   ```
   - ⚠️ 오타 주의. 설정 파일에 이 이름이 적혀 있어서 다르면 실패합니다.
7. 파일 업로드를 요구하면 → 아무 파일이나 하나 올리거나, 이 폴더의 `index.html`을 끌어다 놓습니다.
   - 어차피 다음에 GitHub이 전체를 다시 올립니다. **자리만 만드는 것**입니다.
8. **Deploy site** 클릭

✅ **확인:** 화면에 `bonandgyeol.pages.dev` 같은 주소가 보이면 성공입니다.

---

## 3단계 — Account ID 복사하기

1. https://dash.cloudflare.com 에서 아무 페이지나 열기
2. **주소창(URL)** 을 봅니다:
   ```
   https://dash.cloudflare.com/abc123def456.../workers-and-pages
                              └─────┬─────┘
                            이게 Account ID
   ```
3. `dash.cloudflare.com/` 바로 뒤의 **32자리 영문+숫자**를 복사

> 💡 다른 방법: **Workers & Pages** 화면 오른쪽 사이드바에 **Account ID**가 표시되고 복사 버튼이 있습니다.

📋 이 값을 잠시 메모장에 붙여두세요. (Account ID는 비밀번호가 아니라서 괜찮습니다)

---

## 4단계 — API 토큰 만들기

1. 오른쪽 위 **프로필 아이콘** 클릭 → **My Profile** 선택
   - 또는 바로 접속: https://dash.cloudflare.com/profile/api-tokens
2. 왼쪽 메뉴 **API Tokens** 클릭
3. **Create Token** 버튼 클릭
4. 목록 맨 아래 **Create Custom Token** 오른쪽의 **Get started** 클릭

   > ⚠️ 위쪽 템플릿 중 **"Edit Cloudflare Workers"를 고르지 마세요.**
   > Pages 권한이 없어서 배포가 인증 오류로 실패합니다.

5. **Token name** 칸에 아무 이름이나 입력 (예: `bonandgyeol-deploy`)

6. **Permissions** 항목에서 드롭다운 3개를 이렇게 맞춥니다:

   | 칸 | 선택할 값 |
   |---|---|
   | 1번째 (범위) | **Account** |
   | 2번째 (대상) | **Cloudflare Pages** |
   | 3번째 (권한) | **Edit** |

7. **Account Resources** 에서 본인 계정이 선택되어 있는지 확인
8. 맨 아래 **Continue to summary** 클릭
9. 요약 화면에서 **Create Token** 클릭

10. 🔑 **토큰이 화면에 표시됩니다.**
    - **복사 버튼을 눌러 복사하세요.**
    - ⚠️ **이 창을 닫으면 다시 볼 수 없습니다.**
    - ⚠️ 어디에도 저장하지 말고, **바로 다음 5단계로 가서 붙여넣으세요.**

---

## 5단계 — GitHub에 비밀번호 2개 등록

1. https://github.com/balmy930-cmyk/bonandgyeol-site 접속
2. 상단 탭 **Settings** 클릭 (톱니바퀴 아이콘)
3. 왼쪽 메뉴에서 **Secrets and variables** 클릭 → 펼쳐지면 **Actions** 클릭
4. 초록색 **New repository secret** 버튼 클릭

**첫 번째 등록 — 토큰**

| 칸 | 입력할 값 |
|---|---|
| Name | `CLOUDFLARE_API_TOKEN` |
| Secret | 4단계에서 복사한 토큰 붙여넣기 |

→ **Add secret** 클릭

**두 번째 등록 — 계정 ID**

다시 **New repository secret** 클릭

| 칸 | 입력할 값 |
|---|---|
| Name | `CLOUDFLARE_ACCOUNT_ID` |
| Secret | 3단계에서 복사한 32자리 |

→ **Add secret** 클릭

✅ **확인:** 목록에 이름 2개가 보이면 성공입니다. (값은 `***`로 가려집니다. 정상입니다)

> ⚠️ 이름의 **대소문자와 밑줄(`_`)까지 정확히** 같아야 합니다. 오타가 가장 흔한 실패 원인입니다.

---

## 6단계 — 배포 실행하기

1. https://github.com/balmy930-cmyk/bonandgyeol-site 접속
2. 상단 탭 **Actions** 클릭
3. 왼쪽 목록에서 **Deploy to Cloudflare Pages** 클릭
4. 오른쪽 **Run workflow** 버튼 클릭 → 다시 초록색 **Run workflow** 클릭
5. 잠시 후 목록에 새 줄이 생깁니다. 클릭해서 진행 상황을 봅니다.

**결과 보는 법**

| 표시 | 뜻 |
|---|---|
| 🟡 노란 점 | 진행 중 (1~2분) |
| ✅ 초록 체크 | **성공** |
| ❌ 빨간 X | 실패 → 아래 문제 해결 표 참고 |

✅ **성공하면:** 브라우저에서 `https://bonandgyeol.pages.dev` 접속 → 사이트가 보입니다.

> 💡 정확한 주소는 Cloudflare → Workers & Pages → bonandgyeol 프로젝트에서 확인할 수 있습니다.

---

## 🔧 문제 해결

| 오류 메시지 | 원인 | 해결 |
|---|---|---|
| `Authentication error [code: 10000]` | 토큰 권한 부족 | 4단계를 다시 — **Custom Token**으로 **Cloudflare Pages · Edit** 선택 |
| `Project not found` | 프로젝트 이름 불일치 | 2단계 이름이 정확히 `bonandgyeol`인지 확인 |
| `A request to the Cloudflare API failed` | Account ID 오타 | 3단계 32자리를 다시 복사해 Secret 재등록 |
| `Input required and not supplied: apiToken` | Secret 이름 오타 | 5단계 이름이 `CLOUDFLARE_API_TOKEN`인지 확인 (대소문자 포함) |
| 사이트는 뜨는데 내용이 옛날 것 | 브라우저 캐시 | `Ctrl + Shift + R` (강력 새로고침) |

> Secret은 등록 후 값을 볼 수 없습니다. 의심되면 **덮어쓰기**하세요 — 같은 이름으로 다시 등록하면 교체됩니다.

---

# 2부. 도메인 연결하기 (bonandgyeol.com)

1부가 성공한 뒤에 진행하세요.

> ⚠️ **먼저 확인:** bonandgyeol.com으로 **이메일을 받고 있거나** 다른 서비스를 연결해 두었다면, 네임서버를 바꿀 때 그 설정이 끊길 수 있습니다. 현재 가비아 DNS 설정을 **스크린샷으로 남겨두세요.**

## 7단계 — Cloudflare에 도메인 등록

1. https://dash.cloudflare.com 접속
2. 왼쪽 메뉴 **Websites** 클릭 (한글: **웹사이트**)
3. **Add a site** 클릭 (한글: **사이트 추가**)
4. 입력칸에 입력 후 **Continue**:
   ```
   bonandgyeol.com
   ```
5. 요금제 선택 화면 → 맨 아래 **Free** 선택 → **Continue**
6. 기존 DNS 기록을 스캔합니다 → **Continue**
7. 📋 **네임서버 2개가 표시됩니다.** 이런 형태입니다:
   ```
   xxxx.ns.cloudflare.com
   yyyy.ns.cloudflare.com
   ```
   → 이 두 줄을 메모장에 복사해두세요.

---

## 8단계 — 가비아에서 네임서버 변경

1. https://www.gabia.com 로그인
2. 우측 상단 **My가비아** 클릭
3. 왼쪽 메뉴 **서비스 관리** → **도메인** 클릭
4. `bonandgyeol.com` 오른쪽의 **관리** 버튼 클릭
   - (또는 도메인 왼쪽 체크박스 선택 후 상단 **네임서버 설정**)
5. **네임서버 설정** 메뉴 진입
6. 기존 값(가비아 네임서버)을 **지우고**, 7단계에서 복사한 값을 입력:

   | 칸 | 입력 |
   |---|---|
   | 1차 네임서버 | `xxxx.ns.cloudflare.com` |
   | 2차 네임서버 | `yyyy.ns.cloudflare.com` |

7. **적용** 또는 **저장** 클릭 (본인 인증을 요구할 수 있습니다)

⏳ **대기:** 보통 10분~2시간, 최대 24시간 걸립니다. Cloudflare에서 도메인 상태가 **Active**로 바뀌면 완료입니다. (완료되면 Cloudflare가 메일로 알려줍니다)

---

## 9단계 — Pages에 도메인 붙이기

Cloudflare에서 도메인이 **Active**가 된 뒤에 진행합니다.

1. Cloudflare → **Workers & Pages** → **bonandgyeol** 프로젝트 클릭
2. 상단 탭 **Custom domains** 클릭 (한글: **사용자 지정 도메인**)
3. **Set up a custom domain** 클릭
4. 입력:
   ```
   bonandgyeol.com
   ```
5. **Continue** → **Activate domain** 클릭

Cloudflare가 DNS 기록을 자동으로 만들고 **HTTPS 인증서**도 자동 발급합니다 (몇 분 소요).

✅ **완료:** https://bonandgyeol.com 접속 → 사이트가 보이고 주소창에 🔒 자물쇠가 뜹니다.

> 💡 `www.bonandgyeol.com`도 쓰려면 4번 단계를 `www.bonandgyeol.com`으로 한 번 더 반복하세요.

---

# 3부. 이후 사용법

## 사이트 수정하는 법

파일을 고치고 아래 3줄이면 끝입니다. 5단계~6단계는 **다시 할 필요 없습니다.**

```bash
git add -A
git commit -m "수정 내용 설명"
git push
```

푸시하면 GitHub Actions가 자동으로 배포합니다. 1~2분 뒤 사이트에 반영됩니다.

## 배포되는 파일 / 안 되는 파일

| 올라감 | 안 올라감 |
|---|---|
| `.html` `.txt` `.xml` `.json` | `.md` (README·REPORT·DEPLOY) |
| `.png` `.jpg` `.svg` `.webp` `.ico` | `.github/` 설정 폴더 |
| `assets/` 폴더 전체 | 그 외 모든 것 |

설정 위치: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)의 `Stage public files` 단계.
**허용목록 방식**이라 여기 없는 확장자는 절대 공개되지 않습니다. 새 `.html` 페이지는 자동 포함됩니다.

> 참고: 저장소의 `.assetsignore` 파일은 예전 방식의 잔재입니다. Pages 지원 여부가 문서상 불명확해서,
> 지금은 위 허용목록이 실제로 문서를 막고 있습니다. `.assetsignore`는 있어도 해가 없지만 의존하지 않습니다.

## 배포 상태 확인하는 곳

| 보고 싶은 것 | 위치 |
|---|---|
| 배포 성공/실패 | GitHub → **Actions** 탭 |
| 실제 올라간 파일 | Cloudflare → Workers & Pages → bonandgyeol → **Deployments** |
| 접속 통계 | Cloudflare → 프로젝트 → **Analytics** (설정 후) |

---

## 다음에 할 만한 것

| 항목 | 왜 |
|---|---|
| Cloudflare Web Analytics | 방문자 수·유입 경로 확인. 무료, 쿠키 배너 불필요 |
| og:image | 카톡·X에 링크 공유할 때 썸네일 표시 |
| Lighthouse 측정 | 배포 후 실제 URL에서 성능·접근성 점수 확인 |
