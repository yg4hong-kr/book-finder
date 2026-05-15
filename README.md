# 📚 글로벌 도서 탐험가 (Global Book Explorer)

사용자의 연령, 취향, 작가 선호도에 맞춰 실제 도서 데이터를 찾아주고 상세 정보와 현지화된 가격을 제공하는 스마트 도서 추천 플랫폼입니다.

## ✨ 주요 기능

- **🌐 글로벌 언어 지원**: 한국어와 영어를 지원하며, 언어 설정에 따라 원화(₩) 및 달러($) 가격 정보가 실시간으로 변환됩니다.
- **👶 연령대 맞춤 추천**: 초등학생부터 성인까지, 선택한 연령대에 가장 적합한 도서를 AI가 선별하여 추천합니다.
- **🔍 초고속 직접 검색**: 찾고 있는 책 제목이 있다면 장르 선택 과정 없이 즉시 상세 정보로 이동할 수 있습니다.
- **📈 베스트셀러 모드**: 특정 작가를 입력하지 않고 탐험을 시작하면 해당 장르 및 연령대의 현재 인기 도서 10권을 보여줍니다.
- **📖 상세 줄거리 요약**: 실제 도서의 핵심 줄거리를 요약하여 구매 결정에 도움을 줍니다.

## 🚀 탐험 규칙 (사용 방법)

1. **시작**: 홈 화면에서 원하는 언어(한국어/English)를 선택하고 '책 추천 받기'를 누릅니다.
2. **연령대 선택**: 자신의 현재 교육 과정이나 연령대를 선택합니다.
3. **탐험 방식 결정**:
   - **작가 기반**: 관심 있는 장르를 고르고, 작가 이름을 입력하여 해당 작가의 도서 리스트를 확인합니다.
   - **베스트셀러**: 작가 이름을 비워두면 현재 가장 인기 있는 책 10권이 나타납니다.
   - **직접 검색**: 상단 검색창에 책 제목을 입력하면 즉시 상세 페이지로 이동합니다.
4. **상세 확인**: 리스트에서 책을 클릭하여 상세한 줄거리와 정확한 가격 정보를 확인하세요.
5. **처음으로**: 언제든지 상단의 '나가기' 버튼을 눌러 홈 화면으로 돌아갈 수 있습니다.

## 🛠 기술 스택

- **Frontend**: React 19, Vite, Tailwind CSS, Motion (Animations), Lucide React (Icons)
- **Backend**: Node.js, Express
- **AI**: Google Gemini 1.5 Flash (via @google/genai)
- **Deployment**: Google Cloud Run

## ⚠️ 배포 및 문제 해결 (Troubleshooting)

배포 후 AI 기능(도서 추천, 검색)이 작동하지 않는다면 다음 사항을 확인하세요:

1. **API 키 설정**: 이 앱은 서버 측에서 AI 기능을 처리합니다. 배포 환경의 환경 변수(Environment Variables)에 `GEMINI_API_KEY`라는 이름으로 [Google AI Studio](https://aistudio.google.com/)에서 발급받은 키를 등록해야 합니다.
2. **AI Studio 내 배포 시**: 우측 **'Secrets'** 패널에서 `GEMINI_API_KEY`가 올바르게 입력되어 있는지 확인하세요.
3. **외부 서버 배포 시**: 사용 중인 호스팅 서비스(Vercel, AWS, Cloud Run 등)의 관리자 페이지에서 환경 변수를 설정해야 합니다.

## ☁️ Netlify 배포 가이드 (Netlify Deployment)

이 앱은 **Netlify Functions**를 사용하여 백엔드(AI 기능)를 처리하도록 설정되어 있습니다.

1.  **환경 변수 설정 (중요)**:
    *   Netlify 프로젝트 **Site configuration > Environment variables**로 이동합니다.
    *   `GEMINI_API_KEY`: Google AI Studio에서 복사한 API 키를 입력합니다.
2.  **빌드 설정 확인**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
    *   **Functions directory**: `netlify/functions` (함께 생성된 `netlify.toml`에 이미 설정되어 있습니다.)
3.  **파일 구성**:
    *   배포 시 루트에 있는 `netlify.toml` 파일이 포함되어야 `/api/*` 경로가 서버리스 함수로 올바르게 연결됩니다.

---
**만든이**: 홍윤기 (Hong Yoon-gi)
