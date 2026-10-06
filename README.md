# SEHS Exam Simulator (IB)

Practice tests for IB SEHS Paper 1: nervous and musculoskeletal systems (A.1.1.1 + B.1.1–B.1.3). 689 questions, 319 of them with pictures.

**Stack:** Vite · React 19 · TypeScript · Tailwind v4 · Motion · components based on React Bits (`src/components/reactbits`).

## Deploy on Vercel

1. Import this repo in Vercel (it detects Vite on its own).
2. **Settings → Environment Variables** → add `SITE_PASSWORD` with the password you want.
3. Redeploy.

The password is checked on the server (`api/login.ts`), which sets an HttpOnly cookie for 30 days. The questions live in `api/_bank.ts` and are only sent to signed-in visitors (`api/questions.ts`), so they are not in the public JavaScript. Changing `SITE_PASSWORD` signs everyone out.

## Local development

```bash
npm install
echo "SITE_PASSWORD=test" > .env.local
npm run dev
```

`vite.config.ts` runs the `api/` functions inside the dev server, so the password screen works locally too.

## Features

- Mixed (40% pictures), pictures only, text only, quick 20, and practice by topic.
- Questions you haven't seen yet come first; tests rotate across all topics.
- **Exam conditions**: 72 s per question countdown, no feedback until the end, you can skip and go back.
- **Review mistakes**: every wrong answer is kept until you answer it right.
- **Topic mastery** across all tests, with a "my 3 weakest" shortcut.
- Keyboard: `1`–`4` / `A`–`D` to answer, `Enter` for next. Click a figure to enlarge it.
- Progress is saved per device in `localStorage`.

## Editing questions

`api/_bank.ts` holds one question per line:

```
[topic, image name or null, question, [options], correct index, explanation, optional 1 = keep option order]
```

Images live in `public/img/<name>.jpg`. `source/` has the original generators (`gen.py`, `old.json`, `build.py`) from the single-file version.
