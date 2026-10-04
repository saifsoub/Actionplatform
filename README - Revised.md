# Actionplatform — plain-language README

## What this is
A ready-made starter for building a web app. It includes a Python back end (the part that stores and serves data), a React website, a PostgreSQL database and user login. It is a copy of the open-source "Full Stack FastAPI Template".

## Who it's for
A developer who wants a working web-app skeleton to build on. What Seif plans to build on it is not yet confirmed. The current `README.md` is still the original template's text.

## What it does today
It has the template's built-in features:
- Sign up, log in and reset a forgotten password by email.
- An admin dashboard to manage users, plus a sample "items" list.
- A dark mode.
- Automatic web pages documenting the back end's web addresses.
- Automated tests for the back end (Pytest) and the website (Playwright, which clicks through it like a user).
- A setup that runs everything together with Docker Compose. Docker Compose starts several programs with one command.

No custom features beyond the template are confirmed yet.

## How to run it
You need Docker installed.

1. Open the `.env` file. Before running it anywhere public, change at least `SECRET_KEY`, `FIRST_SUPERUSER_PASSWORD` and `POSTGRES_PASSWORD`. They are set to `changethis`. To make a strong value, run:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
2. Start everything:
   ```bash
   docker compose watch
   ```
   See `development.md` for the exact local addresses and options.

More detail:
- Back end: `backend/README.md`
- Website: `frontend/README.md`
- Putting it online: `deployment.md`

## Current status and known gaps
- Many issues are open in this repo.
- Open critical security alerts:
  - PyJWT (the login-token library) up to 2.13.0 can let someone fake a login. Upgrading to 2.14.0 fixes it.
  - There is also a critical alert for the anyio library.
- The badges, screenshots and update instructions in `README.md` still point to the original template, not this repo.
- What this project is for: not yet confirmed.

## Where things live
| Folder / file | What's in it |
|---|---|
| `backend/` | Python back end (FastAPI) and its tests |
| `frontend/` | React website and its tests |
| `.env` | Settings (change the default passwords) |
| `development.md`, `deployment.md` | How to develop and how to put it online |
| `release-notes.md` | Change history of the original template |

License: MIT, from the original template.
