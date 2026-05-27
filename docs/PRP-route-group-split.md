# Path-Based Isolation Refactor (Option A)

## Context
You are working on aurasense-platform, a Next.js 16 monorepo at C:\Users\milky\Downloads\atlas-api-integration-pass\aurasense-platform-git that currently serves three product surfaces from one entangled src/app/ tree:

- **Nursing rehearse** (`/rehearse`, `/rehearse/nurse`) — Hong Kong nursing simulation sandbox
- **ATLAS dashboard** (`/dashboard/*`) — enterprise drone fleet operations console
- **Public marketing + playground** (`/`, `/playground`, `/pricing`, etc.)

All three surfaces import from the same `src/components/`, `src/lib/`, and `src/app/` files. Bugs in one surface ripple to the others. Symptoms observed today:

- A duplicate `return (` in `/login` (latent since commit d9a1699) silently broke after the Next 16 middleware→proxy migration started redirecting more routes to `/login`
- Cherry-picking the login fix between branches concatenated two component versions instead of replacing
- pnpm dev warnings from chore/next16-migration leak into every feature branch
- 313 lint errors and an audit-chain writer bug compound every PR review

### Goal
Reorganize the file tree into route-group-isolated directories so each surface is reviewable, testable, and reverteable independently — **without changing a single user-facing URL**.

#### Success criteria:
- https://auras.ai/rehearse still works (now resolved by `src/app/(nursing)/rehearse/page.tsx`)
- https://auras.ai/dashboard still works (now resolved by `src/app/(atlas)/dashboard/page.tsx`)
- https://auras.ai/login, /portal, /account still work (stay at root as shared routes)
- `pnpm exec tsc --noEmit` exits with zero errors
- `pnpm dev` starts with no new warnings beyond what main already has
- All existing routes under `/api/*` continue to respond identically
- Single commit per logical move (so `git log --follow` works for blame archaeology)

### Hard Constraints
- **No URL changes.** Route groups `(...)` do not appear in URLs. Verify by smoke-testing every URL from the list below.
- **No duplicate route conflicts.** Only one `/login`, one `/portal`, one `/account` at any time. Do NOT create `(nursing)/login` AND `(atlas)/login` — Next.js will throw "two parallel pages resolve to the same path."
- `src/app/api/*` stays unchanged. API routes have no route-group equivalent and don't need one.
- `src/app/layout.tsx` and `src/app/page.tsx` stay at root. Root layout is shared; landing page is the marketing root.
- **Don't run inside pnpm dev.** Stop the dev server first. Windows file locks on .next will break git mv.
- **All file moves use git mv, not Move-Item** — this preserves Git history and makes `git log --follow` traceable across the rename.

---

## Step 0 — Pre-flight (do NOT skip)
```powershell
Set-Location 'C:\Users\milky\Downloads\atlas-api-integration-pass\aurasense-platform-git'

# 1. Working tree must be clean
git status --short
# If anything modifies, STOP. Stash or commit first.

# 2. Sync with origin
git checkout main
git pull origin main

# 3. Confirm no other PRs are blocking
git log --oneline -n 5
git branch --all | Select-Object -First 20

# 4. Create the refactor branch off main (NOT off any feature branch)
git checkout -b chore/route-group-split

# 5. Stop dev server if running (Ctrl+C in any open pnpm dev terminal)
# 6. Clear Next.js cache to force fresh module resolution
if (Test-Path '.next') { Remove-Item -Recurse -Force '.next' }
```

---

## Step 1 — Final inventory snapshot
```powershell
Set-Location 'C:\Users\milky\Downloads\atlas-api-integration-pass\aurasense-platform-git'

Write-Host "`n=== current routes under src\app (top-level) ==="
Get-ChildItem 'src\app' -Directory | Sort-Object Name | Select-Object Name

Write-Host "`n=== current components folders ==="
Get-ChildItem 'src\components' -Directory | Sort-Object Name | Select-Object Name

Write-Host "`n=== current lib folders ==="
Get-ChildItem 'src\lib' -Directory | Sort-Object Name | Select-Object Name

Write-Host "`n=== root-level lib files ==="
Get-ChildItem 'src\lib' -File | Sort-Object Name | Select-Object Name

Write-Host "`n=== save full file list for diff later ==="
git ls-files src/ | Out-File 'docs/route-split-files-before.txt'
# Commit the inventory file so post-split comparisons are possible:
git add docs/route-split-files-before.txt
git commit -m "chore(route-split): snapshot file list before reorganization"
```

---

## Step 2 — Move app routes into route groups
Three groups: (nursing), (atlas), (public). Routes that serve multiple tiers stay at root.

```powershell
Set-Location 'C:\Users\milky\Downloads\atlas-api-integration-pass\aurasense-platform-git'

# Create the group directories (Next.js auto-recognizes parens-prefixed dirs)
New-Item -ItemType Directory -Force -Path 'src\app\(nursing)' | Out-Null
New-Item -ItemType Directory -Force -Path 'src\app\(atlas)' | Out-Null
New-Item -ItemType Directory -Force -Path 'src\app\(public)' | Out-Null

# === ATLAS group ===
$atlasMoves = @(
  @{ from='src\app\dashboard'; to='src\app\(atlas)\dashboard' },
  @{ from='src\app\drone';     to='src\app\(atlas)\drone' },
  @{ from='src\app\attas';     to='src\app\(atlas)\attas' },
  @{ from='src\app\robotics';  to='src\app\(atlas)\robotics' }
)
foreach ($m in $atlasMoves) {
  if (Test-Path $m.from) { git mv $m.from $m.to; Write-Host "moved: $($m.from) -> $($m.to)" }
}

# === Nursing group ===
$nursingMoves = @(
  @{ from='src\app\rehearse';    to='src\app\(nursing)\rehearse' },
  @{ from='src\app\rehearse-3d'; to='src\app\(nursing)\rehearse-3d' }
)
foreach ($m in $nursingMoves) {
  if (Test-Path $m.from) { git mv $m.from $m.to; Write-Host "moved: $($m.from) -> $($m.to)" }
}

# === Public group ===
$publicMoves = @(
  @{ from='src\app\playground';      to='src\app\(public)\playground' },
  @{ from='src\app\pricing';         to='src\app\(public)\pricing' },
  @{ from='src\app\privacy';         to='src\app\(public)\privacy' },
  @{ from='src\app\terms';           to='src\app\(public)\terms' },
  @{ from='src\app\request-access';  to='src\app\(public)\request-access' }
)
foreach ($m in $publicMoves) {
  if (Test-Path $m.from) { git mv $m.from $m.to; Write-Host "moved: $($m.from) -> $($m.to)" }
}

# === STAYING AT ROOT (do not move) ===
# login, register, logout, portal, account, auth, api, layout.tsx, page.tsx

git status --short | Select-Object -First 30

git commit -m "chore(route-split): move tier-specific app routes into route groups

Routes moved:
- (atlas)/dashboard, /drone, /attas, /robotics
- (nursing)/rehearse, /rehearse-3d
- (public)/playground, /pricing, /privacy, /terms, /request-access

Stays at root (shared across tiers):
- /login, /register, /logout, /portal, /account, /auth, /api
- layout.tsx, page.tsx (root layout + landing)

Route groups in Next.js App Router are denoted by parentheses and
do NOT appear in the URL. All public URLs (e.g. /dashboard, /rehearse)
resolve unchanged.

Refs: chore/route-group-split — phase 1 of 3"
```

---

## Step 3 — Move components into tier folders
```powershell
Set-Location 'C:\Users\milky\Downloads\atlas-api-integration-pass\aurasense-platform-git'

# Create tier folders (atlas already exists)
New-Item -ItemType Directory -Force -Path 'src\components\nursing' | Out-Null
New-Item -ItemType Directory -Force -Path 'src\components\shared' | Out-Null

# === Nursing components ===
if (Test-Path 'src\components\rehearse') {
  git mv 'src\components\rehearse' 'src\components\nursing\rehearse'
}

# === ATLAS components ===
# src/components/atlas/ already exists with sections/, shells/ — leave in place
if (Test-Path 'src\components\drone') {
  git mv 'src\components\drone' 'src\components\atlas\drone'
}

# === Shared primitives stay where they are ===
# src/components/shell/ (Button, Card, Field) — shared, leave at root
# src/components/ui/ (shadcn primitives) — shared, leave at root
# src/components/playground/ — used by /playground only, but stays at root for now
# src/components/auth-button.tsx — shared, leave at root

# === Ambiguous, do NOT auto-move; flag for human review ===
# src/components/nepa-agent.tsx       — has Button-not-defined errors per audit
# src/components/world-model-section.tsx — used by marketing landing AND dashboard?
# src/components/ten-stage-section.tsx — marketing landing only
# src/components/membership-drawer.tsx — used by nav-bar.tsx (shared)
# src/components/nav-bar.tsx          — shared top nav across tiers
# Leave these at root; sort in a follow-up "components-rationalize" PR.

git status --short | Select-Object -First 20

git commit -m "chore(route-split): move tier-specific components into tier folders

Moved:
- src/components/rehearse -> src/components/nursing/rehearse
- src/components/drone    -> src/components/atlas/drone

Stays at root (shared or ambiguous, sort in follow-up):
- src/components/shell/, ui/, playground/
- nav-bar.tsx, nepa-agent.tsx, world-model-section.tsx,
  ten-stage-section.tsx, membership-drawer.tsx, auth-button.tsx

Refs: chore/route-group-split — phase 2 of 3"
```

---

## Step 4 — Move lib folders into tier helpers
```powershell
Set-Location 'C:\Users\milky\Downloads\atlas-api-integration-pass\aurasense-platform-git'

# Create tier folders
New-Item -ItemType Directory -Force -Path 'src\lib\nursing' | Out-Null
New-Item -ItemType Directory -Force -Path 'src\lib\shared' | Out-Null
# src/lib/atlas/ already exists with hooks-ardupilot.ts, view-models-ardupilot.ts

# === Nursing lib ===
$nursingLibMoves = @(
  @{ from='src\lib\rehearsal'; to='src\lib\nursing\rehearsal' },
  @{ from='src\lib\rehearse';  to='src\lib\nursing\rehearse' }
)
foreach ($m in $nursingLibMoves) {
  if (Test-Path $m.from) { git mv $m.from $m.to; Write-Host "moved: $($m.from) -> $($m.to)" }
}

# === ATLAS lib ===
$atlasLibMoves = @(
  @{ from='src\lib\mission';        to='src\lib\atlas\mission' },
  @{ from='src\lib\mock';           to='src\lib\atlas\mock' },
  @{ from='src\lib\world';          to='src\lib\atlas\world' },
  @{ from='src\lib\signature-map';  to='src\lib\atlas\signature-map' },
  @{ from='src\lib\agents';         to='src\lib\atlas\agents' }
)
foreach ($m in $atlasLibMoves) {
  if (Test-Path $m.from) { git mv $m.from $m.to; Write-Host "moved: $($m.from) -> $($m.to)" }
}

# === Shared lib (stays at src/lib root) ===
# auth/        — shared (domain-router used by both surfaces)
# billing/     — shared
# supabase/    — shared
# runtime/     — shared NEPA runtime adapters
# orchestrator/ — shared
# nepa/        — shared
# api/         — shared (newly added swr.ts)
# hooks/       — shared (newly added atlas hooks — may split later)
# types/       — shared
# nepa.ts, audit-chain.ts, audit.ts, cn.ts, copy.ts, edge-client.ts,
#   edge.ts, hmac.ts, nepa-bus.ts, playground-types.ts, pose.ts,
#   runtime.ts, share.ts, signals.ts, utils.ts, yolo.ts, audio.ts,
#   capture-frame.ts, atlas-nav.ts
# All stay at src/lib/ root for now. Tier-classification can happen
# in a follow-up PR if needed.

git status --short | Select-Object -First 30

git commit -m "chore(route-split): move tier-specific lib helpers into tier folders

Moved to nursing:
- src/lib/rehearsal -> src/lib/nursing/rehearsal
- src/lib/rehearse  -> src/lib/nursing/rehearse

Moved to atlas:
- src/lib/mission         -> src/lib/atlas/mission
- src/lib/mock            -> src/lib/atlas/mock
- src/lib/world           -> src/lib/atlas/world
- src/lib/signature-map   -> src/lib/atlas/signature-map
- src/lib/agents          -> src/lib/atlas/agents

Stays at src/lib/ (shared):
- auth/, billing/, supabase/, runtime/, orchestrator/, nepa/,
  api/, hooks/, types/, all top-level .ts files

Refs: chore/route-group-split — phase 3 of 3"
```

---

## Step 5 — Rewrite all stale imports via regex pass
This is the most error-prone step. Run it carefully.

```powershell
Set-Location 'C:\Users\milky\Downloads\atlas-api-integration-pass\aurasense-platform-git'
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Map of old import paths -> new import paths
$rewrites = @(
  # Nursing lib
  @{ old = "@/lib/rehearsal";       new = "@/lib/nursing/rehearsal" },
  @{ old = "@/lib/rehearse";        new = "@/lib/nursing/rehearse" },
  # Atlas lib
  @{ old = "@/lib/mission";         new = "@/lib/atlas/mission" },
  @{ old = "@/lib/mock";            new = "@/lib/atlas/mock" },
  @{ old = "@/lib/world";           new = "@/lib/atlas/world" },
  @{ old = "@/lib/signature-map";   new = "@/lib/atlas/signature-map" },
  @{ old = "@/lib/agents";          new = "@/lib/atlas/agents" },
  # Components
  @{ old = "@/components/rehearse"; new = "@/components/nursing/rehearse" },
  @{ old = "@/components/drone";    new = "@/components/atlas/drone" }
)

# Scope: all .ts/.tsx files under src/
$files = Get-ChildItem -Recurse -File -Include *.ts,*.tsx 'src' -ErrorAction SilentlyContinue

$totalChanges = 0
$changedFiles = @()

foreach ($f in $files) {
  $text = [System.IO.File]::ReadAllText($f.FullName)
  $original = $text
  $fileChanges = 0

  foreach ($r in $rewrites) {
    # Match the import string when followed by /, ', or "
    # This prevents @/lib/mock matching @/lib/mock-extra etc.
    $pattern = "(['\""])$([regex]::Escape($r.old))([/'\""])
    $replacement = "`$1$($r.new)`$2"
    $newText = [regex]::Replace($text, $pattern, $replacement)
    if ($newText -ne $text) {
      $fileChanges += ([regex]::Matches($text, $pattern)).Count
      $text = $newText
    }
  }

  if ($text -ne $original) {
    [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBom)
    $rel = $f.FullName.Replace((Resolve-Path '.').Path, '').TrimStart('\')
    $changedFiles += $rel
    $totalChanges += $fileChanges
  }
}

Write-Host "`n=== rewrite summary ==="
Write-Host "files changed: $($changedFiles.Count)"
Write-Host "total imports rewritten: $totalChanges"
Write-Host "`n=== first 30 changed files ==="
$changedFiles | Select-Object -First 30

# After the rewrite, verify visually:
# Spot-check a few likely files
git diff --stat | Select-Object -First 30

# Search for any LEFT-OVER stale imports (must return empty)
Write-Host "`n=== leftover stale imports (must be empty) ==="
Get-ChildItem -Recurse -File -Include *.ts,*.tsx 'src' -ErrorAction SilentlyContinue |
  Select-String -Pattern "from\s+['\"]@/lib/(mission|mock|world|signature-map|agents|rehearsal|rehearse)['\"]|from\s+['\"]@/components/(rehearse|drone)['\"]" |
  Select-Object Path, LineNumber, Line | Select-Object -First 20
# If the leftover check prints anything, the regex missed something. Stop and inspect those lines before committing.

git add -u
git status --short | Measure-Object -Line
git diff --cached --stat | Select-Object -Last 1

git commit -m "chore(route-split): rewrite import paths after tier folder moves

Pure regex pass over src/**/*.ts and src/**/*.tsx replacing:
  @/lib/mock          -> @/lib/atlas/mock
  @/lib/mission       -> @/lib/atlas/mission
  @/lib/world         -> @/lib/atlas/world
  @/lib/signature-map -> @/lib/atlas/signature-map
  @/lib/agents        -> @/lib/atlas/agents
  @/lib/rehearsal     -> @/lib/nursing/rehearsal
  @/lib/rehearse      -> @/lib/nursing/rehearse
  @/components/rehearse -> @/components/nursing/rehearse
  @/components/drone    -> @/components/atlas/drone

No behavioral changes. Patterns match import strings with quote +
trailing slash/quote to prevent collisions (e.g. @/lib/mock matching
hypothetical @/lib/mock-extra).

Refs: chore/route-group-split — phase 3.5"
```

---

## Step 6 — Typecheck and fix residual errors
```powershell
Set-Location 'C:\Users\milky\Downloads\atlas-api-integration-pass\aurasense-platform-git'

# Use the scoped dashboard typecheck config we already have
pnpm exec tsc --noEmit 2>&1 | Tee-Object 'tsc-split.log'

# Count errors
$errors = (Get-Content 'tsc-split.log' | Select-String -Pattern '^src/.*\.ts.* error TS').Count
Write-Host "`n=== tsc error count: $errors ==="

# Show first 50 errors so we know what to fix
Get-Content 'tsc-split.log' | Select-String -Pattern '^src/.*\.ts.* error TS' | Select-Object -First 50
```
Expected outcome: 0–10 errors. Most will be cases where:
- An import string used unusual quoting the regex missed
- A relative import (from '../mock/...') survived because the rewrite only targeted absolute @/ imports
- A type-only import lost its type keyword

For each error, do a targeted file fix. Do NOT use sed/regex bulk replacement at this stage — each one needs human inspection.

If you hit > 20 errors, the regex pass was too broad. Revert with `git reset --hard HEAD~1` and refine the patterns.

---

## Step 7 — Smoke test in browser
```powershell
Set-Location 'C:\Users\milky\Downloads\atlas-api-integration-pass\aurasense-platform-git'

if (Test-Path '.next') { Remove-Item -Recurse -Force '.next' }
pnpm dev
```
In a fresh Incognito browser tab, visit and confirm each URL renders without 404 or 500:

| URL                        | Expected                | Group   |
|----------------------------|------------------------|---------|
| http://localhost:3000/     | Marketing landing      | root    |
| http://localhost:3000/login| Magic-link form        | root    |
| ...                        | ...                    | ...     |

---

**End of implementation prompt.**
