# song2du.github.io

Next.js(정적 export) 기반 개인 홈페이지 겸 블로그예요. `master`에 push하면 GitHub Actions가 빌드해서 GitHub Pages에 배포해요.

## 로컬 실행

```bash
npm install
npm run dev     # http://localhost:3000 — draft도 보여요
npm run build   # out/ 에 정적 사이트 생성 — draft는 빠져요
```

## 어디에 뭘 쓰나요

| 내용 | 위치 |
|---|---|
| 이름, 소개, 링크, News | `src/lib/site.ts` |
| 블로그 글 | `src/content/blog/<slug>.mdx` |
| 논문 | `src/content/publications/<slug>.mdx` |
| 프로젝트 | `src/content/projects/<slug>.mdx` |
| 인터랙티브 데모 | `src/content/demos/<id>.json` |
| 이미지 | `public/images/...` → `/images/...` 로 참조 |

파일 이름이 곧 URL이에요. 예를 들어 `blog/my-post.mdx`는 `/blog/my-post/`가 돼요. frontmatter에 `draft: true`를 넣으면 개발 서버에서만 보여요.

### 블로그 글

```yaml
---
title: "글 제목"
description: "목록과 미리보기에 나오는 한 줄 요약"
date: 2026-10-23
category: reflections        # reflections | paper-review
tags: [llm, negotiation]
# 논문 리뷰일 때만:
paper:
  title: "Attention Is All You Need"
  authors: "Vaswani et al."
  venue: "NeurIPS 2017"
  url: "https://arxiv.org/abs/1706.03762"
---
```

#### 한국어판 (선택)

같은 폴더에 `<slug>.ko.mdx`를 두면 그 글의 한국어판이 돼요. `/blog/<slug>/ko/`에 올라가고, 글 상단에 `English · 한국어` 전환 버튼이 생겨요. 한국어판에는 `title`(과 `description`)만 쓰면 되고, 날짜·카테고리·태그·draft는 원본을 따라가요.

```yaml
---
title: "글 제목"
description: "한 줄 요약"
---
```

번역 없이 한국어로만 쓰는 글은 원본 frontmatter에 `lang: ko`를 넣으세요. 반대로 한국어 원본에 영어판을 붙이려면 `<slug>.en.mdx`를 두면 돼요.

카테고리 목록은 `src/lib/categories.ts`에 있어요. 태그는 자유롭게 달면 돼요. `/blog/?category=paper-review&tag=llm`처럼 필터 상태가 URL에 남아서 공유할 수 있어요.

`paper-review-template.mdx`(draft)에 수식(KaTeX), 코드 하이라이트, `<Callout>` 예시가 들어 있어요.

### 논문 / 프로젝트

`publications/sample-paper.mdx`와 `projects/secondhand-negotiation-agent.mdx`(둘 다 draft)를 참고하세요. `selected: true`를 넣으면 홈에도 나와요. `links`에는 `paper`, `code`, `demo`, `project`, `video`, `slides`, `poster`를 쓸 수 있어요.

## 데모

MDX 어디서든 이렇게 넣으면 돼요.

```mdx
<AgentDemo id="sample-negotiation" />
```

`src/content/demos/sample-negotiation.json`이 형식 예시예요(타입은 `src/lib/demo-types.ts`).

- **Replay**: `replay` 배열의 대화를 한 턴씩 재생해요. `thought`(에이전트의 내부 추론)와 `annotations`(제안 가격 등)는 선택 항목이에요. 실험 로그를 이 형식으로 변환해서 넣으면 돼요.
- **Try it live (BYOK)**: `live`가 있으면 탭이 생겨요. 방문자가 자기 Anthropic API 키를 넣고, 사람 역할(`human`)로 에이전트(`agent`)와 직접 대화해요. 키는 브라우저 탭(sessionStorage)에만 저장되고 api.anthropic.com으로만 전송돼요. 기본 모델은 `claude-opus-5-5`, effort는 `medium`이고, 데모 JSON의 `live.model` / `live.effort`로 바꿀 수 있어요. 안전 분류기가 거절하면 Anthropic이 권장하는 fallback 모델로 자동 재시도해요(`server-side-fallback-2026-07-01` 베타).

## 배포

처음 한 번만 GitHub 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿔 주세요. 그다음부터는 `master`에 push할 때마다 `.github/workflows/deploy.yml`이 자동으로 배포해요.
