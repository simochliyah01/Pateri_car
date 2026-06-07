# Contributing to Pateri Car

Thank you for contributing to Pateri Car. This document describes the Git workflow,
commit conventions, and code review process used in this project.

---

## 1. Branch Strategy

We follow a simplified **Gitflow** model:

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. Only merged from `develop` via a reviewed PR. |
| `develop` | Integration branch. All feature work is merged here first. |
| `feature/<name>` | New features (e.g., `feature/vehicle-catalog`, `feature/user-profile`). |
| `fix/<name>` | Bug fixes (e.g., `fix/image-upload-500`, `fix/cors-header`). |
| `docs/<name>` | Documentation changes only (e.g., `docs/api-readme`). |
| `chore/<name>` | Maintenance tasks: CI, dependencies, build config (e.g., `chore/update-angular`). |

**Rules:**
- Never commit directly to `main` or `develop`.
- Branch off `develop` for all new work.
- Delete your feature branch after merging.

---

## 2. Conventional Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org) specification:

```
<type>(<scope>): <short description>

[optional body]
```

### Allowed types

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons — no logic change |
| `refactor` | Code restructuring without adding features or fixing bugs |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, CI/CD config |
| `ci` | Changes to CI configuration files (GitHub Actions, etc.) |
| `build` | Changes that affect the build system (Maven, npm) |
| `perf` | Performance improvements |

### Examples for this project

```
feat(backend): add PUT /auth/profile endpoint for user profile updates
fix(frontend): resolve 500 error on profile save by handling DataIntegrityViolationException
feat(catalog): display vehicles from database with real images via /api/vehicles/{id}/image
chore(docker): add multi-stage Dockerfile for Spring Boot production build
docs(contributing): add branch strategy and conventional commit guidelines
chore(github): add pull request template and bug report issue template
refactor(auth): extract UpdateProfileRequest into dedicated DTO class
fix(template): replace arrow function with signal.set() to fix NG5002 parser error
```

### Rules
- Use the **imperative mood**: "add endpoint" not "added endpoint".
- Keep the description under **72 characters**.
- Reference an issue when relevant: `fix(backend): handle null phone field (#42)`.

---

## 3. Pull Request Workflow

### Feature → Develop
1. Create your branch from `develop`:
   ```bash
   git checkout develop && git pull origin develop
   git checkout -b feature/your-feature-name
   ```
2. Make your commits (following Conventional Commits).
3. Push and open a PR targeting `develop`:
   ```bash
   git push -u origin feature/your-feature-name
   ```
4. Fill in the PR template completely.
5. Request a review if working in a team.
6. Merge using **"Squash and merge"** or **"Merge commit"** — no fast-forward merges.
7. Delete the feature branch after merge.

### Develop → Main (release)
- Only the project lead opens a PR from `develop` → `main`.
- At least **1 reviewer approval** is required before merging.
- Add a release tag after merge:
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0"
  git push origin --tags
  ```

---

## 4. Commit Attribution

Before making your first commit, configure Git with your real name and email
so commits are correctly attributed:

```bash
git config user.name "Your Full Name"
git config user.email "your.email@example.com"
```

To apply globally (all projects):
```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```

Verify:
```bash
git config --list | grep user
```

---

## 5. Code Review Checklist

When reviewing a Pull Request, verify that:

- [ ] All existing tests pass locally (`mvn test` / `ng test`)
- [ ] New code follows Conventional Commits and naming conventions
- [ ] No secrets, API keys, or credentials are committed
- [ ] The `.gitignore` covers any new generated files
- [ ] The backend compiles: `mvn compile -q`
- [ ] The frontend compiles: `npm run build`
- [ ] The `docker compose up` command still works
- [ ] The README or documentation is updated if behavior changed
- [ ] PR description is filled in (description, type, checklist)
