# RxJS SearchLab

A focused lab to practice **real-world RxJS patterns** using a search/autocomplete use case.

## 🎯 Purpose

Search is a great problem to model with streams because it requires:
- Debouncing user input
- Cancelling in-flight requests
- Managing loading/error/empty states
- Preventing race conditions (stale responses)
- Composing async flows predictably

This project is intentionally UI-light and pattern-heavy.

## 🧠 RxJS Concepts Demonstrated

- `debounceTime` + `distinctUntilChanged`
- Cancellation with `switchMap`
- Error handling with `catchError`
- Loading state with `startWith` / `tap`
- Response shaping with `map`
- Side effects boundaries with `tap`
- Stream sharing when needed (`shareReplay`) *(only when justified)*

## 🛠 Tech Stack

- TypeScript
- RxJS
- (Angular if applicable)

## ✅ What to look for

- Clear stream ownership (input → query → request → state)
- No nested subscriptions
- Predictable state transitions (loading/success/error/empty)
- Avoiding stale responses and race conditions

## ▶️ Run

```bash
npm install
npm start
