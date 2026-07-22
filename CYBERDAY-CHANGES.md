# Cyber Day customisations to this Juice Shop clone

This is a stock clone of **OWASP Juice Shop v20.1.1** with a few additions for
the Snyk × RMIT Cyber Day workshop. Nothing about the app's vulnerabilities was
changed — we only **seeded fictional "crown jewels" data** so the exploits reveal
something relatable to an RMIT audience.

## What was added / changed

1. **`ftp/rmit_student_records_CONFIDENTIAL.csv`** *(new file)*
   16 fictional student records (name, student ID, DOB, address, GPA,
   financial-aid & welfare notes, and **plaintext portal passwords**).
   Lives in the deliberately-exposed `/ftp` folder → stolen via the
   **Sensitive Data Exposure** exploit using the poison-null-byte trick:
   `GET /ftp/rmit_student_records_CONFIDENTIAL.csv%2500.md`

2. **`data/static/users.yml`** *(appended)*
   10 fictional student accounts (emails `s39xxxxx@student.rmit.edu.au`),
   marked with a `WORKSHOP ADDITIONS` comment block. Key points:
   - `customDomain: true` keeps the literal `@student.rmit.edu.au` login email.
   - Their passwords **match the plaintext passwords in the CSV above** — so the
     attack chain works: SQLi leaks the hashes → the CSV leaks the plaintext →
     the plaintext actually logs in (password-reuse lesson).
   - `s3844219` is given `role: admin` (an over-privileged "research assistant"
     account) for a privilege-escalation talking point.
   - These accounts appear in the **SQLi user-table dump** (attack 2) and are
     reachable via **IDOR** (attack 4).

3. **`config/cyberday.yml`** *(new, optional)*
   Cosmetic + port: a workshop welcome banner, purple theme, and `server.port: 3001`.
   Enable with `NODE_ENV=cyberday npm start`.

4. **Resilience hardening** *(two small source edits, then rebuilt)*
   Because we hammer the app with attacks live, two spots that would otherwise
   crash the Node process were hardened:
   - `app.ts` — added a `process.on('unhandledRejection', …)` guard so a stray
     rejected promise logs instead of killing the demo target.
   - `routes/verify.ts` — added a `.catch()` to the `osaft.reload()` in
     `changeProductChallenge` (a failed reload after a UNION SQLi was the actual
     crash we hit).
   After editing, the server was recompiled with `npm run build:server`.

## How to restore the pristine Juice Shop

```bash
git checkout data/static/users.yml app.ts routes/verify.ts
rm -f ftp/rmit_student_records_CONFIDENTIAL.csv config/cyberday.yml
npm run build:server        # recompile after reverting the source edits
```

The database re-seeds from these files on every start, so a restart is all that's
needed to pick up changes (or to reset the data between workshop groups).

> All seeded data is invented for this workshop. No real personal information is
> used anywhere.
