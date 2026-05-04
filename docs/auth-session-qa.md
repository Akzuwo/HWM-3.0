# Auth Session QA

HWM 3 uses Flask session cookies as the only project auth mechanism for protected app APIs. Bearer tokens and cached frontend roles are not used for login or permissions.

Manual checks:

1. Student login -> normal API works, for example `/api/me` returns `200` with role `student`.
2. Student login -> Admin API, for example `/api/admin/users`, returns `403` with `message: "forbidden"`.
3. Admin login -> Admin API returns `200`.
4. Change a user from `student` to `admin` -> reload or login again -> frontend calls `/api/me`, receives `admin`, and the admin area works without localStorage edits.
5. Not logged in -> protected API, for example `/api/me`, returns `401` with `message: "not_authenticated"`.
6. Old localStorage/sessionStorage keys such as `token`, `authToken`, `role`, `userRole`, or `hm.session` exist -> app removes or ignores them and uses `/api/me`.
