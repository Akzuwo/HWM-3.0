<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title data-i18n="home.pageTitle">Homework Manager</title>
  <link rel="icon" type="image/png" href="media/logo.png" />
  <link rel="stylesheet" href="utils/css/style.css" />
  <link rel="stylesheet" href="utils/css/home.css" />
  <link rel="stylesheet" href="assets/page-transitions.css" />
</head>
<body class="home-page">
  <div id="pageContent">
    <main class="home-main" id="main">
    <aside class="home-callout" role="status">
      <div class="home-callout__icon" aria-hidden="true">🛠️</div>
      <div class="home-callout__content">
        <h2 class="home-callout__title" data-i18n="home.status.title">Work in Progress</h2>
        <p data-i18n="home.status.body">
          Homework Manager 2.0 is still under active development, so a few areas may not work perfectly just yet.
        </p>
      </div>
    </aside>
    <aside class="home-callout home-callout--milestone" role="note">
      <div class="home-callout__icon" aria-hidden="true">🎯</div>
      <div class="home-callout__content">
        <h2 class="home-callout__title" data-i18n="home.releaseGoal.title">Release goal</h2>
        <p data-i18n="home.releaseGoal.body">Notice: The 2.0 release has been moved to July 2026 due to limited capacity and quality assurance.</p>
      </div>
    </aside>
    <section class="home-grid">
      <article class="home-card home-card--intro">
        <header class="home-card__header">
          <span class="home-card__icon" aria-hidden="true">📚</span>
          <h1 data-i18n="home.heroTitle">Homework Manager 2.0</h1>
        </header>
        <p data-i18n="home.description.lead">
          Homework Manager was built to share homework, exams and projects transparently with the entire class.
        </p>
        <p data-i18n="home.description.body">
          Instead of scattered chats and forgotten notes, the platform unifies schedules, reminders and handy utilities in one clear interface – available at any time and designed for teamwork.
        </p>
      </article>

      <article class="home-card home-card--release">
        <header class="home-card__header">
          <span class="home-card__icon" aria-hidden="true">🚀</span>
          <h2 data-i18n="home.release.title">Release 2.0</h2>
        </header>
        <p class="home-card__meta" data-i18n="home.release.date">
          Notice: The 2.0 release has been moved to July 2026 due to limited capacity and quality assurance.
        </p>
        <p data-i18n="home.release.summary">
          Release 2.0 focuses on classroom essentials – a redesigned interface, powerful event tools, smarter overviews, and role-aware accounts.
        </p>
        <ul>
          <li data-i18n="home.release.highlights.design">Redesigned dark theme with finely tuned typography.</li>
          <li data-i18n="home.release.highlights.animations">Smooth animations keep every transition fluid.</li>
          <li data-i18n="home.release.highlights.events">Event feature for spontaneous gatherings, clubs, and special dates.</li>
          <li data-i18n="home.release.highlights.upcoming">Upcoming events page keeps plans crystal clear.</li>
          <li data-i18n="home.release.highlights.privacy">Privacy notice woven right into the experience.</li>
          <li data-i18n="home.release.highlights.accounts">Account system with roles, permissions, and email verification.</li>
          <li data-i18n="home.release.highlights.imprint">Legal notice (imprint) now included.</li>
          <li data-i18n="home.release.highlights.holidays">Holidays and vacations live inside the calendar.</li>
          <li data-i18n="home.release.highlights.multiClass">Plan events and breaks for multiple classes simultaneously.</li>
          <li data-i18n="home.release.highlights.contact">Direct support now lives at <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="4b383e3b3b24393f0b2a20313e3c24652823">[email&#160;protected]</a>.</li>
          <li data-i18n="home.release.highlights.dayView">Day overview unites assignments, exams, and events.</li>
        </ul>
        <a class="home-button" href="changelog.html">
          <span aria-hidden="true">📄</span>
          <span data-i18n="home.release.cta">Learn more</span>
        </a>
      </article>

      <article class="home-card home-card--guide">
        <header class="home-card__header">
          <span class="home-card__icon" aria-hidden="true">🧭</span>
          <h2 data-i18n="home.guide.title">User guide</h2>
        </header>
        <p data-i18n="home.guide.summary">Step-by-step guidance for teachers, students, and class admins in one place.</p>
        <ul>
          <li data-i18n="home.guide.points.teachers">Plan lessons, post assignments, and schedule events.</li>
          <li data-i18n="home.guide.points.students">Track homework, remember dates, and follow the daily feed.</li>
          <li data-i18n="home.guide.points.admins">Manage roles, connect classes, and coordinate holidays.</li>
        </ul>
        <a class="home-button" href="help.html">
          <span aria-hidden="true">📘</span>
          <span data-i18n="home.guide.cta">Open the guide</span>
        </a>
      </article>
    </section>
  </main>

  <footer class="site-footer">
    <span data-i18n="common.footer.copyright">©️ Timo Wigger 2025</span>
    <span aria-hidden="true">|</span>
    <a href="/cdn-cgi/l/email-protection#50232520203f222410313b2a25273f7e3338" data-i18n="common.footer.contact"><span class="__cf_email__" data-cfemail="15666065657a676155747e6f60627a3b767d">[email&#160;protected]</span></a>
    <span aria-hidden="true">|</span>
    <a href="changelog.html" data-i18n="common.footer.changelog">Changelog</a>
    </footer>
  </div>
  <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script type="module" src="utils/js/header.js"></script>
  <script src="assets/page-transitions.js" defer></script>
  <script src="utils/js/i18n.js" defer></script>
  <script src="utils/js/i18n-anim.js" defer></script>
  <script src="utils/js/overlay.js" defer></script>
  <script src="utils/js/toast.js" defer></script>
  <script src="utils/js/footer.js" defer></script>
  <script src="utils/js/home.js" defer></script>
  <script src="utils/js/auth.js" defer></script>
<!-- Cloudflare Pages Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "fc25eaa7652d417bafd91af6aac466d6"}'></script><!-- Cloudflare Pages Analytics --></body>
</html>
