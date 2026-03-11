# 무한의 계단 (Infinite Stairs)

HTML5 Canvas로 만든 레트로 픽셀 아트 계단 오르기 게임입니다.

---

## 웹에서 실행하는 방법

이 게임은 **ES Module**을 사용하므로, **로컬 웹 서버**로 띄워야 합니다.  
`index.html`을 더블클릭해서 `file://`로 열면 동작하지 않을 수 있습니다.

### 방법 1: npx serve (추천)

1. 터미널(또는 PowerShell)을 열고 **게임 폴더**로 이동합니다.
   ```bash
   cd game
   ```
2. 다음 명령을 실행합니다.
   ```bash
   npx serve . -p 3000
   ```
3. 브라우저에서 아래 주소로 접속합니다.
   ```
   http://localhost:3000
   ```

### 방법 2: Python이 있을 때

**Python 3:**
```bash
cd game
python -m http.server 8080
```
→ 브라우저에서 `http://localhost:8080` 으로 접속합니다.

**Python 2:**
```bash
cd game
python -m SimpleHTTPServer 8080
```
→ `http://localhost:8080` 으로 접속합니다.

### 방법 3: VS Code Live Server

1. VS Code에서 **Live Server** 확장을 설치합니다.
2. `game` 폴더를 연 뒤, `index.html`에서 우클릭 → **Open with Live Server**를 선택합니다.
3. 자동으로 브라우저가 열리며 게임이 실행됩니다.

### 방법 4: Node.js로 serve 패키지 전역 설치 후 실행

```bash
npm install -g serve
cd game
serve . -p 3000
```
→ `http://localhost:3000` 으로 접속합니다.

---

## 조작법

| 동작         | 키보드    | 화면        |
|--------------|-----------|-------------|
| **오르기**   | 스페이스  | 오른쪽 버튼 |
| **방향 전환**| A         | 왼쪽 버튼   |
| **재시작**   | R         | 게임오버 후 재시작 버튼 |

- 다음 계단이 **오른쪽**이면 **오르기(스페이스)** 만 눌러야 하고, **왼쪽**이면 **방향 전환(A)** 만 눌러야 합니다.  
  잘못된 키를 누르면 즉시 게임오버입니다.

---

## 테스트 실행

```bash
cd game
npm install
npm run test
```
