# Spec — CheckMates: Multiplayer Chess with Engine-Powered Analysis

## 1. Overview

**CheckMates** is a two-player chess web application, played via a room link (no accounts, no public matchmaking), with a game-analysis phase powered entirely by a chess engine (Stockfish) — no external AI/LLM services involved.

The project has three declared goals, all equally important:
1. Deliver a fully working chess game, playable via link, end to end.
2. Serve as a guided learning project on how to integrate a chess engine into a real application, with no shortcuts that hand over a finished result all at once.
3. Serve as applied practice of **Domain-Driven Design** (Eric Evans) and **Clean Architecture** (Robert C. Martin) concepts — the person owns physical copies of both books and wants the implementation to be a vehicle for learning those concepts, not just for producing a working result.

## 2. Instructions for whoever implements this spec

This spec must be executed in a **guided, incremental** way, regardless of which AI or tool is driving the work:

- Work on **one roadmap item at a time** (sections 8, 9, and 10). Never implement more than one deliverable ahead without confirmation.
- For each deliverable: briefly explain the technical reasoning for that step, write the test first when it makes sense (TDD), implement the minimum needed to make it pass, refactor if needed, and then **stop and wait for explicit confirmation** from the person that they've seen the acceptance criterion working in practice before moving to the next item.
- Do not skip roadmap steps or get ahead of a future phase, even if it seems more efficient.
- Whenever a technical decision isn't covered by this spec, explain the options and ask for the person's preference before deciding unilaterally.
- **Whenever plausible, connect an implementation decision to a specific Domain-Driven Design or Clean Architecture concept** (e.g., "this is a Value Object because it has no identity of its own," "this boundary follows Clean Architecture's Dependency Rule"), naming the concept and briefly explaining why the connection holds, to reinforce theoretical learning alongside the practice. Don't force a reference where none genuinely applies — only connect concepts when the parallel is real. Never quote literal passages from the books; refer only to concepts and terminology.
- The person's stated goal is to learn the process, not just to get the final result — prioritize clarity of explanation over speed of delivery.

## 3. Scope by phase

### Phase 1 — Real-time game
- Create a room, generate a link, invite the second player.
- A complete chess game (legal moves, check, checkmate, stalemate).
- Draw by mutual consent (proposal + accept/reject).
- Reconnection after a page refresh via a token stored in the browser.
- Blocking a third person from joining the room.
- Game state kept in memory on the server (no database).
- No clock/time control.
- No automatic disconnect-abandonment detection.

### Phase 2 — Objective engine-based analysis
- Evaluation of every move in the game via the Stockfish engine.
- Move classification into categories (best, good, neutral, inaccuracy, mistake, blunder) based on the evaluation swing.
- Display of the classified move list at the end of the game.

### Phase 3 — Move-suggestion retrospective and win probability
- A post-game retrospective summary: for every move classified as a mistake or blunder, an entry describing what the best alternative move would have been (e.g. "when Black played Nf6, the best move was e5").
- Win/draw/loss (WDL) probability for each player, recalculated and displayed after every move of the game.
- An interactive post-game replay, similar to chess.com's game review: the frontend can step through the entire game move by move, reconstructing the board at each point, with an arrow overlay pointing to the ideal move for the position currently shown.
- All of the above are produced entirely from Stockfish's own output (best move, principal variation, and WDL statistics) — no external AI service is used at any point in this project.

## 4. Technical stack

| Layer | Choice |
|---|---|
| Language | TypeScript (frontend and backend) |
| Backend | Node.js + `ws` (WebSocket) |
| Frontend | React + `react-chessboard` |
| Chess rules logic | `chess.js`, wrapped behind a domain port |
| Analysis engine (Phases 2 and 3) | Stockfish (via WASM/Node binding) |
| Testing | Vitest (unit and integration), React Testing Library (components) |
| CI | GitHub Actions (lint + typecheck + tests on every push/PR) |
| Hosting | Render (static frontend and Node/WebSocket backend, both on the free tier) |
| Repositories | Two separate repositories: `checkmates-backend` and `checkmates-frontend` |

Stockfish is free, open-source software that runs locally on the same server as the backend — unlike a hosted API, it has no usage quota, no API key, and no cost of any kind. The only practical constraint is CPU/RAM on Render's free tier, which is addressed by keeping the engine's search depth/time bounded (see Phase 2, item 1).

## 5. Architecture principles

The pattern adopted throughout the application is **Ports and Adapters (hexagonal architecture)**, aligned with Clean Architecture's **Dependency Rule**: code dependencies always point inward, from the outer layers (frameworks, UI, database/infra) toward the inner ones (business rules), never the other way around. This replaces the traditional Controller/Service/Repository layering, which tends to blur responsibilities when there are multiple external actors of different natures — here, the WebSocket connection, the chess engine, and in-memory storage. Each of these actors becomes a **port** (interface) in the domain/application layer, with a concrete **adapter** in infrastructure.

### 5.1 Backend

- **Layers**, mapped to Clean Architecture's circles: `domain` (equivalent to *Entities* — the most general and stable business rules, with no framework dependencies, e.g. `Board`, `Move`, `Room`), `application` (equivalent to *Use Cases*/*Interactors* — orchestrate the domain through ports, e.g. `CreateRoomUseCase`, `MakeMoveUseCase`, `AnalyzeGameUseCase`), `infrastructure` (equivalent to *Frameworks & Drivers* — concrete adapters: the WebSocket server, the `chess.js` adapter, in-memory storage, the Stockfish adapter), `interface` (equivalent to *Interface Adapters* — handlers that translate WebSocket messages into use-case calls).
- **Dependency rule**: the inner layers (`domain`, `application`) never import anything from `infrastructure` or `interface`.
- **SOLID applied pragmatically**: one use case per responsibility (Single Responsibility); dependencies injected via ports in the constructor (Dependency Inversion); adapters that can be swapped without changing the code that consumes them (Open/Closed).
- **Tactical Domain-Driven Design modeling** applied to domain entities: explicitly distinguish **Entities** (have their own identity over time, e.g. `Room`/an ongoing game, identified by its ID) from **Value Objects** (fully defined by their value, with no identity of their own, e.g. a board `Position`, or `Move` itself); evaluate whether `Room` should be modeled as the **Aggregate Root** — the entity responsible for guaranteeing the consistency of everything inside it (players, board, move history), acting as the single entry point for modifications; consider **Domain Events** for relevant state transitions (e.g. `MoveMade`, `GameEnded`, `DrawProposed`) as an explicit way to communicate state changes, especially useful when the same event needs to notify both players via WebSocket and, later on, the analysis step.
- **Repository, in the DDD sense**: the `RoomRepositoryPort` isn't just plain data access — it exists to give the impression of an in-memory collection of Aggregates, hiding the details of how state is persisted (even though, at this stage, it's only an in-memory map).
- **Strict TypeScript typing**: `strict: true` in `tsconfig`, no implicit `any`, explicit types/interfaces for every domain entity and every WebSocket message contract.
- **Error handling**: domain errors (e.g. "invalid move") represented as explicit types or a dedicated error class, distinct from programming errors — avoid using generic exceptions for expected business flows.
- **Dependency management**: lockfile (`package-lock.json`) always committed; dependency versions pinned, avoiding wide ranges (`^`/`~`) for critical packages; vulnerability auditing (`npm audit`) run as part of CI; dependency surface kept minimal, preferring small, well-maintained libraries (as already the case with `chess.js` and `ws`) over heavy frameworks unnecessary for the project's scope.
- **Testing**: TDD for everything in `domain` and `application`, using fakes of the ports; integration tests for the `infrastructure` adapters; end-to-end tests of the full WebSocket flow.

### 5.2 Frontend

- **Layers**: `domain`/shared client-side types, `application` (hooks that encapsulate client use cases, e.g. `useGameConnection`, `useMakeMove`), `infrastructure` (WebSocket client, `localStorage` access for the reconnection token), `ui` (purely presentational React components).
- **One component per file**, named in `PascalCase`, with its matching test file placed alongside it.
- **Use of Fragments (`<>...</>`)** instead of unnecessary wrapping `div`s around groups of elements that don't need a real DOM container.
- **Small, single-responsibility components**, mirroring the same Single Responsibility principle applied to the backend: game-connection/state logic lives in custom hooks, not inside visual components — components receive already-prepared data and callbacks via props. This separation also echoes the **Humble Object** pattern described in Clean Architecture: isolating testable logic (hooks) from code that's hard to test (rendering/DOM), keeping the latter as "dumb" as possible.
- **Explicitly typed props** via `interface`, with no implicit types.
- **Hooks named with the `use` prefix**, following React convention, and tested in isolation from the component tree when they encapsulate non-trivial logic.
- **Behavior-driven tests** with React Testing Library, testing what the user sees and does (clicks, conditional rendering), not the internal implementation details of components.

### 5.3 Project's ubiquitous language

Following Domain-Driven Design's **Ubiquitous Language** concept, the terms used in code must mirror exactly the terms used when talking about the chess and application domain, in both directions — class names, methods, and events should be the same terms used in conversations about the product (`Room`, `Move`, `Draw Proposal`, `Checkmate`), avoiding generic technical terms (like `Manager`, a generic `Handler`, `Data`) that mean nothing within the chess domain itself.

## 6. Repository structure

### `checkmates-backend`
```
/src
  /domain
  /application
  /infrastructure
  /interface
/tests
/.github/workflows
```

### `checkmates-frontend`
```
/src
  /domain
  /application
  /infrastructure
  /ui
/tests
/.github/workflows
```

A shared WebSocket message contract (TypeScript types for the events exchanged between client and server) must be defined and kept manually in sync between the two repositories at this stage of the project, since there is no monorepo or published shared package.

## 7. Testing and CI strategy

- **Unit tests**: domain and use cases, always TDD-driven, using fakes of the ports instead of real infrastructure.
- **Integration tests**: concrete adapters (in-memory repository, `chess.js` adapter, Stockfish adapter) and the full WebSocket flow in a test environment.
- **Component tests** (frontend): behavior of key components and hooks.
- **Pipeline (GitHub Actions)**, one workflow per repository: on every push and pull request — install dependencies → lint → typecheck → unit tests → integration tests. Pull requests can only be merged with a green pipeline.

## 8. Roadmap — Phase 1: Real-time game

Each item is an isolated, verifiable deliverable before moving to the next.

1. **Backend project setup**: folder structure, TypeScript configured with strict typing, Vitest running a trivial test, GitHub Actions running that test on every push. *Criterion: green pipeline on GitHub.*
2. **Board domain (no UI, no server yet)**: basic chess entities with tests written via TDD — board representation, starting position, a `ChessEnginePort` with a simple fake. A natural moment to distinguish Entities from Value Objects (DDD) in practice within the chess domain. *Criterion: domain tests passing locally and in CI.*
3. **Real rules-engine adapter**: implementation of `ChessEnginePort` using `chess.js`, with integration tests covering legal moves, illegal moves, check, checkmate, and stalemate. *Criterion: green test suite covering these rules.*
4. **"Create Room" use case (no WebSocket yet)**: pure logic that generates a room ID and the initial state, TDD-tested. A natural moment to discuss whether `Room` should be the game's Aggregate Root. *Criterion: use-case test passing.*
5. **Frontend project setup**: folder structure, TypeScript, Vitest + React Testing Library configured, GitHub Actions with a trivial test. *Criterion: green pipeline on GitHub.*
6. **Landing screen (frontend)**: "Create room" button, no backend integration yet. *Criterion: opening the app in the browser and seeing the button.*
7. **Basic WebSocket server**: connection accepted, "create room" event returns a room ID/link. *Criterion: via a test client (script or a tool like Postman), create a room and receive an ID.*
8. **Frontend → backend integration for room creation**: clicking the button creates a real room and navigates to `/room/:id`. *Criterion: clicking the button changes the room's URL in the browser.*
9. **Room screen with the starting board**: entering `/room/:id` shows the board at the starting position (no moves yet). *Criterion: the full board visual appears on screen.*
10. **Second player joins the room via link**: "Join room" use case, available-seat validation. *Criterion: opening the link in a second tab/browser also shows the board and is recognized as the black player.*
11. **Blocking a third person**: a third connection to the same room receives a "game already in progress" message. *Criterion: opening the link in a third tab shows the message, with no access to the board.*
12. **Making a move (one direction, no turn alternation yet)**: "Make Move" use case with rule validation, reflected on both clients via WebSocket. A good moment to introduce a `MoveMade` Domain Event as an explicit way to propagate the state change. *Criterion: moving a piece in one tab updates the board on the other tab in real time.*
13. **Turn alternation**: blocking moves out of turn, visual indication of "your turn"/"opponent's turn". *Criterion: playing out of turn is rejected; the UI indicates whose turn it is.*
14. **End-of-game detection via checkmate/stalemate**: the game ends automatically and both clients are notified, possibly via a `GameEnded` Domain Event. *Criterion: forcing a checkmate in a test shows the end-of-game message to both players.*
15. **Draw proposal and acceptance**: "propose draw" button, notification to the opponent, accept/reject. *Criterion: the full flow is manually testable across two tabs.*
16. **Reconnection token**: a token generated on entry, stored in `localStorage`, used to reconnect after a page refresh without losing the room seat. *Criterion: refreshing the page mid-game keeps the player in the same seat, with the board in the correct state.*

## 9. Roadmap — Phase 2: Objective engine-based analysis

Prerequisite: Phase 1 complete, with a finished game's move history available at the end.

1. **Isolated Stockfish adapter**: given a FEN (position), returns an evaluation and the best move. Tested in isolation. *Criterion: an integration test calls the adapter with a known position and gets a plausible evaluation.*
2. **"Analyze Game" use case**: walks through the move history of a finished game, calls the adapter before/after each move, and returns the raw list of per-move evaluations. *Criterion: a use-case test with a fixed game returns a list of per-move evaluations.*
3. **Move classification**: a rule that turns the evaluation swing between moves into a category (best/good/neutral/inaccuracy/mistake/blunder), with defined and tested thresholds. *Criterion: tests covering each category with known positions.*
4. **Frontend display**: post-game analysis screen, listing each move with its category. *Criterion: after a game ends, the list of classified moves appears on screen.*

## 10. Roadmap — Phase 3: Move-suggestion retrospective and win probability

Prerequisite: Phase 2 complete.

1. **WDL extension of the Stockfish adapter**: given a FEN, the adapter also returns win/draw/loss probability for the side to move, in addition to the evaluation and best move it already returns. Tested in isolation. *Criterion: an integration test with a known position returns plausible WDL percentages.*
2. **Extend "Analyze Game" to capture WDL per move**: the use case built in Phase 2 now also stores the WDL statistics returned by the adapter for the position after each move, for both players. *Criterion: a use-case test with a fixed game returns WDL values alongside the evaluation for every move.*
3. **"Build Move-Suggestion Retrospective" use case**: for every move already classified as a mistake or blunder (Phase 2), produce a summary entry describing what the best alternative move would have been, using the best move/principal variation the engine already returns — e.g. "when Black played Nf6, the best move was e5." Each entry must include the best move's origin and destination squares (not just its algebraic notation), since the frontend will need them to draw an arrow on the board. *Criterion: a use-case test with a fixed game returns the correct list of retrospective entries, including origin/destination squares.*
4. **Frontend: WDL indicator per move**: the post-game analysis screen shows, for each move, the updated win/draw/loss probability for both players (e.g. as a small bar or chart next to the move list). *Criterion: stepping through the move list updates the WDL indicator accordingly.*
5. **Frontend: retrospective summary panel**: a dedicated section of the analysis screen lists every retrospective entry produced in item 3. *Criterion: after a finished game, the retrospective summary is visible and matches the moves that were classified as mistakes or blunders.*
6. **Frontend: interactive game replay**: a board component that reconstructs and displays the game's position at any ply, with previous/next navigation (and, ideally, jump-to-move). Position reconstruction uses the move history already available from the finished game, replayed via the same `ChessEnginePort`/`chess.js` used elsewhere in the frontend. *Criterion: navigating through the replay with previous/next correctly shows the board at each point of the game, matching what actually happened move by move.*
7. **Frontend: best-move arrow overlay**: for whichever position is currently shown in the replay, draw an arrow on the board from the origin to the destination square of the engine's suggested best move (using the origin/destination data from item 3), mirroring the visual style of chess.com's post-game review. *Criterion: navigating the replay to a move classified as a mistake or blunder shows an arrow pointing from the ideal move's origin square to its destination square.*
8. **Frontend: link retrospective entries to replay navigation**: clicking an entry in the retrospective summary panel (item 5) jumps the replay (item 6) directly to that move, with its arrow overlay (item 7) shown. *Criterion: clicking a retrospective entry moves the replay board to the corresponding position and shows the suggested move's arrow.*

## 11. Project premises and decisions

- No time control.
- Game ends only via checkmate, stalemate (standard chess rule), or a mutually agreed draw.
- No disconnect-timeout abandonment detection.
- Game state kept in memory on the server, no database.
- A third person accessing the room link receives a blocking message, never becomes a spectator.
- Hosting fully on Render (frontend and backend), on the free tier.
- Separate repositories for frontend and backend, no monorepo.
- Analysis in Phases 2 and 3 is powered entirely by the Stockfish engine, run locally on the backend server; no external AI/LLM service is used anywhere in this project, and no model is trained or fine-tuned.
- Hexagonal architecture (Ports and Adapters) throughout the application, with TDD, SOLID, and Clean Code as mandatory practices for every deliverable.
- Throughout implementation, Domain-Driven Design (Eric Evans) and Clean Architecture (Robert C. Martin) concepts should be explicitly referenced whenever plausible, as part of the project's learning goal.
