# 브릿지캠프 교육 과정 안내 · 프론트엔드 (Level 1)

가상 IT·AI 교육 회사 **브릿지캠프**의 교육 과정 안내 **모바일 웹앱**입니다.
수강 희망자가 링크 하나로 "언제, 얼마, 어떻게, 나에게 맞는지"를 한눈에 확인할 수 있게 만들었습니다.

> AX Campus 1기 · 빌더트랙 1차 과제 Level 1 (보고 등록하기). 모든 회사·과정 정보는 가상 데이터입니다.

- 기획서: [기획서.md](./기획서.md)
- 백엔드 저장소: [bridgecamp-level1-backend](https://github.com/kimdo127-cloud/bridgecamp-level1-backend)

## 화면

| 모드 | 화면 | 주소 |
| --- | --- | --- |
| 사용자 (수강 희망자) | 과정 목록 (곧 개강 / 모집 중 / 준비 중) | `/` |
| 사용자 (수강 희망자) | 과정 상세 (핵심 정보, 추천 대상, 커리큘럼, 기수 일정, FAQ) | `/courses/:id` |
| 운영 (운영 매니저) | 과정 관리: 사용자 목록과 같은 화면 + 과정 등록·기수 추가 버튼 | `/admin` |
| 운영 (운영 매니저) | 과정 상세: 사용자 상세와 같은 화면 + 기수 추가 버튼 | `/admin/courses/:id` |
| 운영 (운영 매니저) | 과정 등록 (대표 사진 포함) | `/admin/courses/new` |
| 운영 (운영 매니저) | 과정 수정 | `/admin/courses/:id/edit` |
| 운영 (운영 매니저) | 기수 추가 | `/admin/courses/:id/cohorts/new` |
| 운영 (운영 매니저) | 기수 수정 (개강 전 기수만) | `/admin/courses/:id/cohorts/:cohortId/edit` |

- **운영 모드는 주소 앞에 `/admin`을 붙여 들어갑니다.** 사용자 화면에는 운영 기능이나 링크를 두지 않았습니다. Level 1은 로그인이 없어서 주소로만 구분합니다.
- 휴대폰 화면 기준으로 만들었고, 컴퓨터에서는 가운데에 휴대폰 폭으로 보입니다.

## 기술
- Next.js (App Router), TypeScript, Tailwind CSS
- 데이터는 백엔드(NestJS) API에서 받아옵니다: `src/lib/api.ts`

## 설정값

| 이름 | 뜻 | 예 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | 백엔드 주소 | 로컬 `http://localhost:4100` / 배포 `https://<백엔드>.onrender.com` |

## 로컬에서 실행

```bash
npm install
cp .env.example .env.local   # 백엔드 주소 확인
npm run dev -- -p 3100       # http://localhost:3100
```

백엔드를 먼저 켜 두어야 데이터가 보입니다.

## 배포 (Vercel)
1. Vercel → Add New → Project → 이 저장소 선택
2. Environment Variables에 `NEXT_PUBLIC_API_URL` = Render 백엔드 주소
3. Deploy
