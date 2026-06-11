(function (global) {
  const translations = {
    de: {
      common: {
        appName: 'Homework Manager',
        nav: {
          home: 'Startseite',
          calendar: 'Kalender',
          upcoming: 'Anstehend',
          weeklyPreview: 'Wochenvorschau',
          grades: 'Notenrechner',
          currentSubject: 'Aktuelles Fach',
          logout: 'Abmelden',
          primary: 'Hauptnavigation',
          toggle: 'Navigationsmenü umschalten',
          language: 'Sprache ändern',
          mobileNotice: 'Mobile-Version noch in Entwicklung – es können noch Fehler auftreten.',
        },
        footer: {
          copyright: '©️ Timo Wigger 2025',
          contact: 'support@akzuwo.ch',
          imprint: 'Impressum',
          privacy: 'Datenschutz',
          changelog: 'Changelog',
          navigation: 'Footer-Navigation',
        },
        language: {
          menuLabel: 'Sprache auswählen',
        },
      },
      home: {
        pageTitle: 'Homework Manager',
        heroTitle: 'Homework Manager 2.0',
        description: {
          lead:
            'Der Homework Manager entstand, um Hausaufgaben, Prüfungen und Projekte transparent für die ganze Klasse bereitzustellen.',
          body:
            'Statt verstreuter Chats und vergessener Notizen bündelt die Plattform Termine, Erinnerungen und praktische Werkzeuge in einer klaren Oberfläche – jederzeit verfügbar und gemeinsam nutzbar.',
        },
        status: {
          title: 'Hinweis: Work in Progress',
          body:
            'Homework Manager 2.0 wird noch aktiv entwickelt. Manche Bereiche funktionieren daher noch nicht immer wie erwartet.',
        },
        releaseGoal: {
          title: 'Release-Ziel',
          body: 'Hinweis: Der Release von 2.0 wurde aufgrund mangelnder Kapazitäten und Qualitätssicherung auf Juli 2026 verschoben.',
        },
        release: {
          title: 'Release 2.0',
          date:
            'Hinweis: Der Release von 2.0 wurde aufgrund mangelnder Kapazitäten und Qualitätssicherung auf Juli 2026 verschoben.',
          summary:
            'Release 2.0 bündelt alles, was den Schulalltag leichter macht – von der neuen Oberfläche über Events bis hin zu Rollen, Datenschutz und frischen Übersichten.',
          highlights: {
            design: 'Rundum neu gestaltetes Dark-Theme mit präziser Typografie.',
            animations: 'Sanfte Animationen sorgen für flüssige Übergänge.',
            events: 'Event-Feature für spontane Termine, AGs und Aktionen.',
            upcoming: 'Neue Seite für anstehende Ereignisse schafft Überblick.',
            privacy: 'Datenschutzhinweis direkt integriert.',
            accounts: 'Account-System mit Rollen, Rechten und E-Mail-Verifikation.',
            imprint: 'Impressum ergänzt die rechtlichen Infos.',
            holidays: 'Ferien und Feiertage erscheinen im Kalender.',
            multiClass: 'Events und Ferien für mehrere Klassen planbar.',
            contact: 'Direkter Support per E-Mail an support@akzuwo.ch.',
            dayView: 'Tagesübersicht vereint Aufgaben, Prüfungen und Events.',
          },
          cta: 'Mehr erfahren',
        },
        guide: {
          title: 'Bedienungsanleitung',
          summary:
            'Die wichtigsten Schritte für Lehrkräfte, Schüler:innen und Klassen-Admins auf einen Blick.',
          points: {
            teachers: 'Unterricht vorbereiten, Aufgaben posten und Events teilen.',
            students: 'Aufgaben finden, Termine merken und Tagesfeed nutzen.',
            admins: 'Rollen verwalten, Klassen koppeln und Ferien planen.',
          },
          cta: 'Zur Anleitung',
        },
      },
      changelog: {
        pageTitle: 'Changelog',
        title: 'Changelog',
        subtitle:
          'Hier findest du die Release-Notizen zum Homework Manager – inklusive der Highlights aus Version 2.0 und früheren Updates.',
        back: '← Zurück zur Übersicht',
        release: {
          title: 'Release 2.0',
          date: 'Oktober 2025',
          summary:
            'Homework Manager 2.0 liefert ein vollständig erneuertes Erlebnis mit frischen Funktionen. Das sind die Highlights des Releases.',
          items: {
            design:
              'Rundum neu gestaltete Benutzeroberfläche mit harmonischem Dark-Theme und präziser Typografie.',
            animations: 'Flüssige Mikro-Animationen lassen Seiten und Panels noch weicher wirken.',
            events: 'Frisches „Event“-Feature für spontane Veranstaltungen, AGs und besondere Termine.',
            upcoming: 'Neue Seite für anstehende Ereignisse bringt Klarheit in die Planung.',
            privacy: 'Datenschutzhinweis direkt integriert.',
            accounts: 'Neues Account-System mit Rollen, Rechten und E-Mail-Verifikation.',
            imprint: 'Impressum nahtlos in die Plattform eingebettet.',
            holidays: 'Ferien und Feiertage erscheinen jetzt direkt im Kalender.',
            multiClass: 'Events und Ferien lassen sich für mehrere Klassen gleichzeitig planen.',
            contact: 'Support-Anfragen erreichen uns ab sofort per E-Mail an support@akzuwo.ch.',
            dayView: 'Neue Tagesübersicht bündelt Aufgaben, Prüfungen und Events in einem fokussierten Feed.',
          },
        },
        archive: {
          title: 'Frühere Versionen',
          release171: {
            title: 'Release 1.7.1',
            summary:
              'Release 1.7.1 sorgt für mehr Tempo im Kalender und poliert das Interface mit gezielten Verbesserungen.',
            items: {
              calendar: 'Admins können Kalendereinträge direkt anlegen und bei Bedarf sofort bearbeiten.',
              uiFixes: 'Mehrere Darstellungsfehler im UI wurden behoben.',
              formatting: 'Aufgabenbeschreibungen unterstützen jetzt Fett- und Kursivformatierungen.',
            },
            patch01: {
              title: 'Patch 0x01',
              items: {
                overlayButton: 'Der Schließen-Button der Kalender-Overlays wird wieder korrekt dargestellt.',
                uiTweaks: 'Weitere visuelle Feinschliffe an UI-Elementen – ohne Änderungen an ihren Funktionen.',
              },
            },
            patch02: {
              title: 'Patch 0x02',
              items: {
                scheduleUi: 'Stundenplan-Ansicht optisch überarbeitet.',
              },
            },
          },
        },
      },
      calendar: {
        pageTitle: 'Kalender',
        heading: '📅 Kalender',
        description: 'Behalte Hausaufgaben, Prüfungen und Events in einer dunklen, klar strukturierten Ansicht im Blick.',
        header: {
          eyebrow: 'Planungsboard',
          badge: 'Kalender-Board',
          subtitle: 'Live-Überblick für Aufgaben, Prüfungen und Events.',
          status: 'Live synchronisiert',
          menuLabel: 'Kalender Navigation',
          actions: {
            help: 'Hilfe & Support',
            upcoming: 'Anstehend',
          },
        },
        status: {
          loading: 'Kalender wird geladen …',
          error: 'Fehler beim Laden der Kalendereinträge!',
          unauthorized: 'Bitte melde dich an und stelle sicher, dass du einer Klasse zugeordnet bist, um den Kalender zu sehen.',
        },
        views: {
          month: 'Monat',
          week: 'Woche',
          day: 'Tag',
        },
        viewSwitch: {
          label: 'Kalenderansicht wechseln',
        },
        monthNav: {
          label: 'Monatsnavigation',
          previous: 'Vorheriger Monat',
          next: 'Nächster Monat',
          current: 'Aktueller Monat',
          today: 'Heute',
        },
        classSelector: {
          label: 'Klasse',
          placeholder: 'Klasse auswählen',
        },
        actions: {
          create: {
            label: 'Neuer Eintrag',
            tooltip: 'Neuen Kalendereintrag erstellen',
            disabled: 'Bitte melde dich an, um persönliche ToDos zu erstellen.',
          },
          export: {
            label: 'Exportieren',
            tooltip: 'Kalender als ICS exportieren',
            loading: 'Exportieren …',
            success: 'Kalender erfolgreich exportiert.',
            error: 'Fehler beim Exportieren des Kalenders.',
            fileName: 'homework-calendar.ics',
            unauthorized: 'Melde dich an und lass dich einer Klasse zuordnen, um den Kalender zu exportieren.',
          },
          back: {
            label: 'Zur Übersicht',
            tooltip: 'Zurück zur Startseite',
          },
        },
        actionBar: {
          label: 'Kalender Aktionen',
        },
        weekStrip: {
          label: 'Kalenderwochen',
          week: 'KW',
        },
        legend: {
          homework: 'Hausaufgabe',
          exam: 'Prüfung',
          event: 'Event',
          holiday: 'Ferien & Feiertage',
          todo: 'ToDo',
        },
        formMessages: {
          invalidDate: 'Bitte gib ein gültiges Datum im Format TT.MM.JJJJ ein.',
          invalidEnd: 'Die Endzeit darf nicht vor der Startzeit liegen.',
          missingSubject: 'Bitte wähle ein Fach aus.',
          missingEventTitle: 'Bitte gib einen Event-Titel ein.',
        },
        modal: {
          viewTitle: 'Kalender-Eintrag',
          noDescription: '<em>Keine Beschreibung vorhanden.</em>',
          close: 'Schließen',
          createTitle: '📝 Neuen Eintrag erstellen',
          labels: {
            type: 'Typ',
            subject: 'Fach',
            eventTitle: 'Event-Titel',
            date: 'Datum',
            dateWithFormat: 'Datum (TT.MM.JJJJ)',
            start: 'Startzeit',
            end: 'Endzeit',
            endDate: 'Enddatum',
            description: 'Beschreibung',
            descriptionOptional: 'Beschreibung (optional)',
          },
          placeholders: {
            subject: '– bitte wählen –',
            eventTitle: 'Name des Events',
            description: 'Details zum Eintrag',
            descriptionShort: 'Kurzbeschreibung',
            date: '18.09.2025',
          },
          hints: {
            eventTitle: 'Pflichtfeld für Events.',
          },
          buttons: {
            cancel: 'Abbrechen',
            close: 'Schließen',
            save: 'Speichern',
            saveLoading: 'Speichern …',
            delete: 'Löschen',
            deleteLoading: 'Löschen …',
            add: 'Hinzufügen',
            addLoading: 'Hinzufügen …',
          },
          deleteConfirm: {
            title: 'Eintrag löschen?',
            message: 'Möchtest du diesen Eintrag wirklich löschen?',
          },
          confirmDelete: 'Möchtest du diesen Eintrag wirklich löschen?',
          messages: {
            saveError: 'Fehler beim Speichern.',
            deleteError: 'Fehler beim Löschen.',
            deleteSuccess: 'Eintrag wurde gelöscht.',
            saveSuccess: 'Eintrag wurde erfolgreich gespeichert!',
            saveRetry:
              'Der Eintrag konnte nach mehreren Versuchen nicht gespeichert werden. Bitte versuche es später noch einmal.',
          },
        },
      },
      contact: {
        title: 'Kontakt aufnehmen',
        description: 'Schreibe uns eine Nachricht – wir melden uns so schnell wie möglich.',
        name: 'Name',
        email: 'E-Mail-Adresse',
        subject: 'Betreff',
        message: 'Nachricht',
        attachment: 'Datei anhängen (optional)',
        attachmentHint: 'Max. 2 MB',
        privacy: 'Mit dem Absenden stimme ich der Verarbeitung meiner Angaben zu.',
        submit: 'Nachricht senden',
        cancel: 'Abbrechen',
        success: 'Vielen Dank! Deine Nachricht wurde erfolgreich verschickt.',
        error: 'Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut.',
        errorValidation: 'Bitte überprüfe die markierten Felder.',
        fallbackTitle: 'Alternativ kannst du uns auch per E-Mail erreichen:',
        fallbackCta: 'E-Mail schreiben',
        close: 'Schließen',
      },
      help: {
        pageTitle: 'Bedienungsanleitung',
        back: '← Zurück zur Startseite',
        title: 'Bedienungsanleitung',
        subtitle: 'Praktische Tipps, damit jede Rolle sofort loslegen kann.',
        note: 'Diese Anleitung folgt dem neuen Dark-Theme und den Scroll-Animationen.',
        teacher: {
          title: 'Für Lehrkräfte',
          summary: 'Plane Einträge und halte deine Klasse informiert.',
          steps: {
            create: 'Klicke den gewünschten Tag im Kalender, wähle Typ und Zeiten, dann speichere den Eintrag.',
            format: 'Verwende *TEXT* in der Beschreibung, um wichtige Details fett hervorzuheben.',
            attachments: 'Anhänge werden nicht unterstützt – teile Links oder Hinweise direkt in der Beschreibung.',
            overview: 'Sieh dir anstehende Aufgaben in der Tagesübersicht an, sobald ein Stundenplan-.json eingereicht wurde.',
          },
        },
        students: {
          title: 'Für Schüler:innen',
          summary: 'Behalte Räume, Fristen und Aufgaben auf jedem Gerät im Blick.',
          steps: {
            dayView:
              'Die Tagesübersicht listet Aufgaben, Prüfungen und Events, sobald eure Klasse den Stundenplan als .json eingereicht hat.',
            currentSubject: 'Die Seite „Aktuelles Fach“ zeigt, wo die nächste Unterrichtsstunde stattfindet.',
            calendar: 'Tippe im Kalender auf einen Tag, um Details zu lesen und Events schnell zu finden.',
            questions: 'Wenn etwas unklar ist, schreibe an support@akzuwo.ch.',
          },
        },
        admins: {
          title: 'Für Klassen-Admins',
          summary: 'Verwalte Rollen, Stundenpläne und Einträge.',
          steps: {
            schedule:
              'Stelle sicher, dass jemand aus der Klasse den Stundenplan als .json einreicht, damit Tagesübersicht und aktuelles Fach freigeschaltet werden.',
            create: 'Lege Einträge selbst an, indem du den passenden Tag im Kalender auswählst.',
            privacy: 'Verweise auf die Datenschutzseite für Details.',
            support:
              'Du brauchst Hilfe? E-Mail an support@akzuwo.ch – diese Adresse ist nur für Supportanfragen.',
          },
        },
        callout: {
          title: 'Gut zu wissen',
          schedule: 'Tagesübersicht und aktuelles Fach sind erst verfügbar, wenn ein Stundenplan als .json vorliegt.',
          contactForm: 'Support läuft ausschließlich über support@akzuwo.ch.',
          privacy: 'Mehr zum Datenschutz findest du auf der Datenschutzseite.',
          support: 'Noch Fragen? Schreib an den Support.',
        },
      },
      profile: {
        title: 'Profil',
        pageTitle: 'Profil',
        eyebrow: 'Account',
        subtitle: 'Verwalte deine persönlichen Daten, Klassenzuordnung und Sicherheit.',
        overviewLabel: 'Übersicht',
        overviewTitle: 'Account-Übersicht',
        overviewDescription: 'Deine wichtigsten Profildaten auf einen Blick.',
        userId: 'User-ID',
        email: 'E‑Mail',
        class: 'Klasse',
        classId: 'Klassen-ID',
        accountAge: 'Accountalter',
        accountCreated: 'Erstellt am',
        lastClassChange: 'Letzter Klassenwechsel',
        classLabel: 'Klasse',
        classTitle: 'Klasse ändern',
        classHint: 'Klassenwechsel sind nur einmal pro Monat möglich.',
        classInputLabel: 'Klassen-ID',
        classPlaceholder: 'z. B. 12',
        changeClass: 'Klasse ändern',
        classChangeReady: 'Klassenwechsel ist aktuell möglich.',
        classCooldown: 'Klasse kann erst in {days} Tagen erneut geändert werden.',
        classCooldownOne: 'Klasse kann in 1 Tag erneut geändert werden.',
        classChangeMissing: 'Bitte gib eine Klassen-ID an.',
        classChangeSuccess: 'Klasse erfolgreich geändert.',
        classChangeError: 'Klasse konnte nicht geändert werden.',
        classChangeInvalid: 'Ungültige Klassen-ID.',
        classChangeNotFound: 'Klasse wurde nicht gefunden.',
        classChangeCooldownError: 'Du kannst die Klasse erst nach Ablauf der Wartezeit ändern ({days} Tage).',
        securityLabel: 'Sicherheit',
        passwordTitle: 'Passwort ändern',
        passwordDescription: 'Aktualisiere dein Passwort. Nach erfolgreicher Änderung senden wir eine Bestätigungs-Mail.',
        currentPassword: 'Aktuelles Passwort',
        newPassword: 'Neues Passwort',
        confirmPassword: 'Passwort bestätigen',
        passwordHint: 'Mindestens 8 Zeichen.',
        passwordChangeButton: 'Passwort aktualisieren',
        passwordMismatch: 'Die neuen Passwörter stimmen nicht überein.',
        passwordChangeSuccess: 'Passwort wurde aktualisiert.',
        passwordChangeWeak: 'Das Passwort ist zu schwach.',
        passwordChangeInvalidCurrent: 'Das aktuelle Passwort ist falsch.',
        passwordChangeUnchanged: 'Bitte wähle ein anderes Passwort.',
        passwordChangeError: 'Passwort konnte nicht geändert werden.',
        passwordEmailSuccess: 'Wir haben dir eine Bestätigungs-E-Mail gesendet.',
        passwordEmailFailure: 'Passwort geändert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden.',
        passwordMissing: 'Bitte alle Passwortfelder ausfüllen.',
        dangerZone: 'Gefahrenzone',
        deleteTitle: 'Account löschen',
        deleteWarning: 'Diese Aktion löscht dein Benutzerkonto unwiderruflich.',
        deleteButton: 'Account löschen',
        deleteConfirm: 'Möchtest du deinen Account dauerhaft löschen?',
        deleteSuccess: 'Account gelöscht.',
        deleteError: 'Account konnte nicht gelöscht werden.',
        loadError: 'Profil konnte nicht geladen werden.',
        loadUnavailable: 'Der Profilservice ist derzeit nicht verfügbar.',
        unknownValue: '–',
        ageDay: '1 Tag',
        ageDays: '{count} Tage',
      },
      auth: {
        pageTitle: 'Login - Homework Manager',
        logoAlt: 'Logo',
        verificationRequired: 'E-Mail-Bestätigung erforderlich',
        verificationRequiredBody:
          'Bitte bestätige deine E-Mail-Adresse über den Link in deiner Nachricht. Der Versand kann ein paar Minuten dauern. Du kannst hier eine neue E-Mail anfordern.',
        verificationResendLink: 'Bestätigungsmail erneut senden',
        accountButton: 'Account',
        accountProfile: 'Profil',
        adminNavButton: 'Adminbereich',
        authStatusGuest: 'Nicht angemeldet',
        authStatusSignedIn: 'Angemeldet als {role}',
        close: 'Schließen',
        cooldownWarning: 'Bitte warte einen Moment, bevor du es erneut versuchst.',
        emailLabel: 'E-Mail-Adresse',
        emailNotVerified: 'Bitte bestätige zuerst deine E-Mail-Adresse.',
        emailPlaceholder: 'name@example.com',
        emailRequired: 'Bitte gib eine E-Mail-Adresse ein.',
        forgotPassword: 'Passwort vergessen?',
        forgotPasswordMissingEmail: 'Bitte gib zuerst deine E-Mail-Adresse ein.',
        genericError: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
        guestButton: 'Als Gast fortfahren',
        guestInfo: 'Fortfahren ohne Konto',
        hide: 'Passwort verbergen',
        inactive: 'Dein Konto wurde deaktiviert. Bitte kontaktiere eine Lehrkraft oder den Administrator.',
        invalidCredentials: 'E-Mail oder Passwort ist falsch.',
        loginButton: 'Anmelden',
        logoutButton: 'Abmelden',
        newBadge: 'NEU',
        passwordLabel: 'Passwort',
        passwordPlaceholder: 'Passwort',
        passwordRequired: 'Bitte gib ein Passwort ein.',
        passwordResetCancel: 'Zurück zum Login',
        passwordResetCodeHint: 'Der Code ist 10 Minuten gültig. Prüfe auch deinen Spam-Ordner.',
        passwordResetCodeLabel: 'Reset-Code',
        passwordResetCodePlaceholder: '8-stelliger Code',
        passwordResetCodeRequired: 'Bitte gib den Reset-Code ein.',
        passwordResetConfirmLabel: 'Neues Passwort bestätigen',
        passwordResetError: 'Zurücksetzen nicht möglich. Versuche es später noch einmal.',
        passwordResetInvalidCode: 'Der eingegebene Code ist ungültig oder abgelaufen.',
        passwordResetNewPasswordLabel: 'Neues Passwort',
        passwordResetNewPasswordPlaceholder: 'Neues Passwort',
        passwordResetPasswordMismatch: 'Die Passwörter stimmen nicht überein.',
        passwordResetPasswordRequired: 'Bitte gib ein neues Passwort ein.',
        passwordResetPasswordWeak: 'Das neue Passwort muss mindestens 8 Zeichen lang sein.',
        passwordResetRequest: 'Reset-Code anfordern',
        passwordResetRequestError: 'Reset-Code konnte nicht angefordert werden. Bitte versuche es später erneut.',
        passwordResetRequestLoading: 'Wird angefordert …',
        passwordResetRequestSuccess: 'Falls ein Konto existiert, haben wir dir einen Reset-Code geschickt.',
        passwordResetSubmit: 'Passwort ändern',
        passwordResetSubmitLoading: 'Passwort wird geändert …',
        passwordResetSubtitle: 'Gib den Code aus der E-Mail ein und wähle ein neues Passwort.',
        passwordResetSuccess: 'Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt anmelden.',
        passwordResetTitle: '🔁 Passwort zurücksetzen',
        registerClassLabel: 'Klasse (optional)',
        registerClassNotFound: 'Diese Klasse wurde nicht gefunden.',
        registerClassPlaceholder: 'z.B. L23a/ Lehrpersonen dieses Feld bitte leer lassen',
        registerEmailExists: 'Für diese E-Mail-Adresse existiert bereits ein Konto.',
        registerEmailInvalid: 'Bitte verwende deine @sluz.ch-E-Mail-Adresse.',
        registerGenericError: 'Registrierung derzeit nicht möglich. Bitte versuche es später erneut.',
        registerPasswordConfirmLabel: 'Passwort bestätigen',
        registerPasswordMismatch: 'Die Passwörter stimmen nicht überein.',
        registerSubmit: 'Registrieren',
        registerSubmitLoading: 'Registrieren …',
        registerSubtitle: 'Registriere dich mit deiner Schul-E-Mail-Adresse.',
        registerSuccess: 'Fast geschafft! Gib jetzt den Code aus der E-Mail ein.',
        registerTitle: '🆕 Konto erstellen',
        registerWeakPassword: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
        resendError: 'Die E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.',
        resendSuccess: 'Falls ein Konto existiert, haben wir den Code erneut gesendet. Der Versand kann ein paar Minuten dauern.',
        show: 'Passwort anzeigen',
        submit: 'Anmelden',
        submitLoading: 'Anmelden …',
        switchToLogin: 'Schon registriert? Anmelden',
        switchToRegister: 'Neu hier? Konto erstellen',
        title: '🔒 Login',
        verificationCodeHint: '⚠️ Der Versand der E-Mail kann bis zu 2 Minuten dauern.',
        verificationCodeInvalid: 'Der Code ist ungültig oder abgelaufen.',
        verificationCodeLabel: 'Bestätigungscode',
        verificationCodePlaceholder: '8-stelliger Code',
        verificationCodeResend: 'Code erneut senden',
        verificationCodeResendLoading: 'Wird gesendet…',
        verificationCodeSubmit: 'Code bestätigen',
        verificationCodeSubmitLoading: 'Wird geprüft…',
        verificationCodeSuccess: 'Geschafft! Deine E-Mail-Adresse wurde bestätigt. Du kannst dich jetzt anmelden.',
        verificationStepSubtitle: 'Bestätige noch deine E-Mail, dann geht’s los.',
        verificationStepTitle: 'Du bist fast startklar!',
        roleLabels: {
          admin: 'Administrator',
          teacher: 'Lehrkraft',
          class_admin: 'Klassen-Admin',
          student: 'Schüler',
          guest: 'Gast',
        },
      },
      gradeCalculator: {
        pageTitle: 'Notenrechner',
        title: 'Notenrechner',
        add: {
          title: 'Note hinzufügen',
          gradeLabel: 'Note',
          gradePlaceholder: 'z. B. 5.5',
          weightLabel: 'Gewichtung',
          weightPlaceholder: 'z. B. 1',
          addButton: 'Hinzufügen',
        },
        table: {
          number: 'Nr.',
          grade: 'Note',
          weight: 'Gewichtung',
          actions: 'Aktionen',
        },
        summary: {
          average: 'Schnitt',
        },
        target: {
          title: 'Ziel-Schnitt berechnen',
          targetLabel: 'Ziel-Schnitt',
          targetPlaceholder: 'z. B. 5',
          nextWeightLabel: 'Gewichtung der nächsten Note',
          nextWeightPlaceholder: 'z. B. 1',
          calculateButton: 'Berechnen',
          required: 'Benötigte Note: –',
        },
        back: 'Zurück',
        messages: {
          invalidNumber: 'Bitte gültige Zahlen eingeben.',
          required: 'Bitte dieses Feld ausfüllen.',
          gradeRange: 'Die Note muss zwischen 1 und 6 liegen.',
          weightPositive: 'Die Gewichtung muss grösser als 0 sein.',
          targetRange: 'Der Ziel-Schnitt muss zwischen 1 und 6 liegen.',
          nextWeight: 'Die Gewichtung der nächsten Note muss grösser als 0 sein.',
          requiredGradeLabel: 'Benötigte Note',
          unachievable: 'Nicht erreichbar',
          unachievableDetail: 'Ziel nicht erreichbar (max. {max})',
          deleteAction: 'Note löschen',
          editAction: 'Note bearbeiten',
          saveAction: 'Änderungen speichern',
          cancelAction: 'Bearbeitung abbrechen',
        },
      },
      dayOverview: {
        pageTitle: 'Tagesübersicht',
        title: '📅 Tagesübersicht',
        classLabel: 'Klasse',
        classPlaceholder: 'Klasse wählen',
        back: '◀️ Zurück',
        loading: 'Lade Daten…',
        unauthorized:
          'Bitte melde dich an und stelle sicher, dass du einer Klasse zugeordnet bist, um die Tagesübersicht zu sehen.',
        featureUnavailable: 'Dieses Feature ist für deine Klasse noch nicht verfügbar.',
        table: {
          time: 'Uhrzeit',
          subject: 'Fach',
          room: 'Raum',
          empty: 'Keine Einträge',
        },
        error: 'Fehler beim Laden der Daten.',
        classLoading: 'Klassen werden geladen …',
        classError: 'Klassen konnten nicht geladen werden.',
        classChangeError: 'Klasse konnte nicht gewechselt werden.',
        classRequired: 'Bitte wähle eine Klasse, um dieses Feature zu nutzen.',
      },
      upcoming: {
        pageTitle: 'Bevorstehende Ereignisse',
        title: '🔔 Bevorstehende Ereignisse',
        lead: 'Bleibe über anstehende Schul-Events informiert und plane deine Woche mühelos.',
        notice: 'Dieses Feature wird aktuell umgebaut.',
        loading: 'Lade Daten…',
        back: '◀️ Zur Übersicht',
        backLabel: 'Zurück zur Startseite',
        unauthorized:
          'Bitte melde dich an und stelle sicher, dass du einer Klasse zugeordnet bist, um die anstehenden Events zu sehen.',
        empty: 'Keine bevorstehenden Events gefunden.',
        eventBadge: 'EVENT',
        subjectLabel: 'Fach {subject}',
        subjectMissing: 'Kein Fach angegeben',
        allDay: 'Ganztägig',
        noDescription: '– Keine Beschreibung –',
        cardLabel: 'Event {subject}am {date}{time}',
        error: 'Fehler beim Laden der Daten.',
      },
      weeklyPreview: {
        pageTitle: 'Wochenvorschau',
        title: '🧠 Wochenvorschau',
        lead: 'KI-Zusammenfassung für Aufgaben und Ereignisse der nächsten 7 Tage.',
        loading: 'Vorschau wird erstellt…',
        refresh: 'Neu generieren',
        back: '◀️ Zur Übersicht',
        unauthorized: 'Bitte melde dich an und stelle sicher, dass du einer Klasse zugeordnet bist.',
        empty: 'Keine Einträge in den nächsten 7 Tagen.',
        error: 'Die Wochenvorschau konnte aktuell nicht erstellt werden.',
        classLabel: 'Klasse',
        classPlaceholder: 'Klasse wählen',
        classLoading: 'Klassen werden geladen …',
        classError: 'Klassen konnten nicht geladen werden.',
        classChangeError: 'Klasse konnte nicht gewechselt werden.',
        classRequired: 'Bitte wähle eine Klasse.',
        meta: {
          text: 'Aktualisiert: {time} · Quelle: {source}',
          cached: 'aus Cache',
          fresh: 'neu generiert',
        },
      },
      currentSubject: {
        pageTitle: 'Aktuelles Fach',
        title: 'Aktuelles Fach',
        classLabel: 'Klasse',
        classPlaceholder: 'Klasse wählen',
        loading: 'Lade aktuelle Daten …',
        countdownLabel: 'Verbleibende Zeit',
        currentLesson: {
          title: 'Aktuelle Stunde',
          empty: 'Aktuell findet keine Stunde statt.',
        },
        nextLesson: {
          title: 'Nächste Stunde',
          empty: 'Keine weiteren Stunden heute.',
        },
        labels: {
          start: 'Start',
          end: 'Ende',
          room: 'Raum',
          subject: 'Fach',
        },
        actions: {
          dayOverview: 'Tagesübersicht',
          back: 'Zurück',
        },
        progressLabel: 'Fortschritt der Lektion',
        freeSlot: 'Frei',
        error: 'Fehler beim Laden der Daten.',
        unauthorized:
          'Bitte melde dich an und stelle sicher, dass du einer Klasse zugeordnet bist, um das aktuelle Fach zu sehen.',
        featureUnavailable: 'Dieses Feature ist für deine Klasse noch nicht verfügbar.',
        classLoading: 'Klassen werden geladen …',
        classError: 'Klassen konnten nicht geladen werden.',
        classChangeError: 'Klasse konnte nicht gewechselt werden.',
        classRequired: 'Bitte wähle eine Klasse, um dieses Feature zu nutzen.',
      },
      admin: {
        pageTitle: 'Admin-Dashboard - Homework Manager',
        noscript: 'Bitte aktiviere JavaScript, um das Admin-Dashboard zu verwenden.',
      },
      privacy: {
        pageTitle: 'Datenschutzerklärung · Homework Manager',
        main: `<header class="legal-header">
      <h1 class="legal-title">Datenschutzerklärung</h1>
      <p class="legal-subtitle">Wie wir mit personenbezogenen Daten im Homework Manager umgehen.</p>
    </header>

    <section class="legal-section">
      <h2>Verantwortliche Stelle</h2>
      <article class="legal-card">
        <dl>
          <div>
            <dt>Name</dt>
            <dd>Timo Wigger</dd>
          </div>
          <div>
            <dt>Projekt</dt>
            <dd>Homework Manager</dd>
          </div>
          <div>
            <dt>E-Mail</dt>
            <dd><a class="hm-footer__link" href="mailto:support@akzuwo.ch">support@akzuwo.ch</a></dd>
          </div>
          <div>
            <dt>Postanschrift</dt>
            <dd>Wird auf Anfrage im Rahmen der gesetzlichen Vorgaben mitgeteilt.</dd>
          </div>
        </dl>
        <p class="legal-note">Verantwortlich für die Datenbearbeitung im Sinne des schweizerischen RevD-DSG sowie, soweit anwendbar, Art. 4 Nr. 7 DSGVO.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Welche Daten wir verarbeiten</h2>
      <article class="legal-card">
        <p>Wir verarbeiten ausschließlich die Informationen, die du aktiv im Homework Manager speicherst. Dazu gehören unter anderem Aufgaben, Fächer, Noten und Termine. Zusätzlich werden technische Metadaten wie das Datum der letzten Anmeldung gespeichert, um dein Konto zu schützen.</p>
        <p>Wir setzen keine Tracking- oder Analyse-Dienste von Drittanbietern ein. Deine Daten verbleiben auf unseren Systemen und werden nicht zu Werbezwecken weitergegeben.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Cookies &amp; Web Storage</h2>
      <article class="legal-card">
        <p>Wir verwenden ein technisch erforderliches Session-Cookie, um dich nach der Anmeldung zu authentifizieren. Das Session-Cookie wird nur während der laufenden Sitzung gespeichert und verfällt automatisch, sobald du dich abmeldest oder den Browser schließt.</p>
        <p>Zusätzlich nutzen wir <code>sessionStorage</code>, um Zwischenspeicher wie Formularzustände oder deine E-Mail-Adresse für die Dauer der Sitzung bereitzuhalten. Diese Daten bleiben lokal in deinem Browser und werden beim Schließen des Tabs gelöscht.</p>
        <p>Wir setzen keine Tracking- oder Analyse-Cookies ein.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Zwecke und Rechtsgrundlagen</h2>
      <article class="legal-card">
        <p>Wir nutzen deine Daten, um den Homework Manager bereitzustellen, deine Inhalte zu synchronisieren und bei Supportanfragen reagieren zu können. Die Datenbearbeitung erfolgt auf Basis unserer berechtigten Interessen an einem funktionsfähigen Dienst sowie, sofern ein Benutzerkonto besteht, zur Erfüllung (vor)vertraglicher Pflichten.</p>
        <p class="legal-note">Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. b und f DSGVO sowie die entsprechenden Bestimmungen des RevD-DSG.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Empfänger/Auftragsverarbeiter</h2>
      <article class="legal-card">
        <p>Wir setzen ausgewählte Dienstleister ein, die personenbezogene Daten in unserem Auftrag verarbeiten. Dabei bleiben die Daten geschützt und wir schließen entsprechende Auftragsverarbeitungsverträge ab.</p>
        <ul>
          <li>Webhost: Cloudflare.com (Hosting)</li>
          <li>Backend: Render.com (Serverbetrieb und Datenspeicherung)</li>
          <li>E‑Mail-Versand: Brevo.com (Support- und Systemnachrichten)</li>
        </ul>
        <p class="legal-note"><em>Diese Angaben dienen ausschließlich der Transparenz und stellen keine Bewerbung der Anbieter dar.</em></p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Server-Logs &amp; Sicherheit</h2>
      <article class="legal-card">
        <p>Beim Aufruf des Homework Managers verarbeiten wir IP-Adressen und Request-Metadaten (z.&nbsp;B. Zeitstempel, aufgerufene URL, User-Agent). Diese Daten benötigen wir, um den technischen Betrieb sicherzustellen, Fehler zu analysieren, Rate-Limits umzusetzen und Missbrauch zu verhindern.</p>
        <p>Server-Logs werden in der Regel bis zu 30 Tage gespeichert und anschließend gelöscht oder anonymisiert, sofern keine sicherheitsrelevanten Vorfälle eine längere Aufbewahrung erfordern.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Drittlandübermittlung</h2>
      <article class="legal-card">
        <p>Eine Verarbeitung außerhalb der Schweiz oder der EU findet nicht statt. Alle Daten werden ausschließlich innerhalb der EU oder der Schweiz verarbeitet; es erfolgen keine Übermittlungen in Drittländer.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Speicherdauer und Sicherheit</h2>
      <article class="legal-card">
        <p>Wir speichern deine Daten nur so lange, wie es für die Nutzung des Homework Managers erforderlich ist. Wenn du dein Konto löschen lässt oder uns zur Löschung aufforderst, entfernen wir deine personenbezogenen Daten, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
        <p>Aktuelle Sicherheitsmaßnahmen wie verschlüsselte Verbindungen und rollenbasierte Zugriffe schützen deine Informationen vor unbefugtem Zugriff.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Deine Rechte</h2>
      <article class="legal-card">
        <p>Du kannst jederzeit deine Rechte im Hinblick auf deine personenbezogenen Daten wahrnehmen. Dazu zählen insbesondere:</p>
        <ul>
          <li>Auskunft über die gespeicherten Daten zu deiner Person,</li>
          <li>Berichtigung unrichtiger oder unvollständiger Daten,</li>
          <li>Löschung deiner Daten, sofern keine gesetzlichen Vorgaben entgegenstehen,</li>
          <li>Einschränkung der Verarbeitung sowie Widerspruch gegen bestimmte Verarbeitungen,</li>
          <li>Übertragbarkeit der Daten in einem strukturierten, gängigen Format.</li>
        </ul>
      </article>
    </section>

    <section class="legal-section">
      <h2>Beschwerderecht</h2>
      <article class="legal-card">
        <p>Du hast das Recht, dich bei einer Aufsichtsbehörde über die Verarbeitung deiner personenbezogenen Daten zu beschweren. Zuständig in der Schweiz ist der Eidgenössische Datenschutz- und Öffentlichkeitsbeauftragte (EDÖB).</p>
        <p>Sofern die DSGVO anwendbar ist, kannst du dich zudem an eine Aufsichtsbehörde in der EU wenden, insbesondere an deinem gewöhnlichen Aufenthaltsort, Arbeitsplatz oder am Ort des mutmaßlichen Verstoßes.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Fragen zum Datenschutz</h2>
      <article class="legal-card">
        <p>Für Anliegen oder Fragen rund um den Datenschutz erreichst du uns unter der oben genannten Kontaktadresse. Bitte gib im Betreff deiner Nachricht „Datenschutzanfrage\" an, damit wir dein Anliegen schneller zuordnen können.</p>
      </article>
    </section>`,
      },
      imprint: {
        pageTitle: 'Impressum · Homework Manager',
        main: `<header class="legal-header">
      <h1 class="legal-title">Impressum</h1>
      <p class="legal-subtitle">Rechtliche Angaben und Kontaktinformationen zum Homework Manager.</p>
    </header>

    <section class="legal-section">
      <h2>Verantwortliche Stelle</h2>
      <article class="legal-card">
        <dl>
          <div>
            <dt>Name</dt>
            <dd>Timo Wigger</dd>
          </div>
          <div>
            <dt>Projekt</dt>
            <dd>Homework Manager</dd>
          </div>
          <div>
            <dt>E-Mail</dt>
            <dd><a class="hm-footer__link" href="mailto:support@akzuwo.ch">support@akzuwo.ch</a></dd>
          </div>
          <div>
            <dt>Postanschrift</dt>
            <dd>Wird auf Anfrage im Rahmen der gesetzlichen Vorgaben mitgeteilt.</dd>
          </div>
        </dl>
        <p class="legal-note">Verantwortlich für den Inhalt nach Art. 14 Abs. 1 RevD-DSG sowie § 18 Abs. 2 MStV.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Kontakt</h2>
      <article class="legal-card">
        <p>Allgemeine Anfragen zum Projekt, Support oder Hinweise zu Inhalten nehmen wir bevorzugt per E-Mail an <a class="hm-footer__link" href="mailto:support@akzuwo.ch">support@akzuwo.ch</a> entgegen. Eine Rückmeldung erfolgt in der Regel innerhalb von zwei Werktagen.</p>
        <p class="legal-note">Für Datenschutzanfragen verwende bitte ebenfalls die oben genannte Kontaktadresse und gib den Betreff „Datenschutz\" an.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Haftungshinweise</h2>
      <article class="legal-card">
        <p>Alle Inhalte wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr. Als Diensteanbieter sind wir für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich, nicht jedoch verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
        <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine entsprechende Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Urheberrecht</h2>
      <article class="legal-card">
        <p>Die durch den Betreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem schweizerischen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
      </article>
    </section>`,
      },
    },
    en: {
      common: {
        appName: 'Homework Manager',
        nav: {
          home: 'Dashboard',
          calendar: 'Calendar',
          upcoming: 'Upcoming',
          weeklyPreview: 'Weekly Preview',
          grades: 'Grade Calculator',
          currentSubject: 'Current Subject',
          logout: 'Log out',
          primary: 'Main navigation',
          toggle: 'Toggle navigation menu',
          language: 'Change language',
          mobileNotice: 'Mobile edition is in development and may still have a few bugs.',
        },
        footer: {
          copyright: '©️ Timo Wigger 2025',
          contact: 'support@akzuwo.ch',
          imprint: 'Legal notice',
          privacy: 'Privacy policy',
          changelog: 'Changelog',
          navigation: 'Footer navigation',
        },
        language: {
          menuLabel: 'Select language',
        },
      },
      home: {
        pageTitle: 'Homework Manager',
        heroTitle: 'Homework Manager 2.0',
        description: {
          lead:
            'Homework Manager was built to share homework, exams and projects transparently with the entire class.',
          body:
            'Instead of scattered chats and forgotten notes, the platform unifies schedules, reminders and handy utilities in one clear interface – available at any time and designed for teamwork.',
        },
        status: {
          title: 'Heads-up: Work in Progress',
          body:
            'Homework Manager 2.0 is still under active development, so a few areas may not work perfectly just yet.',
        },
        releaseGoal: {
          title: 'Release goal',
          body: 'Notice: The 2.0 release has been moved to July 2026 due to limited capacity and quality assurance.',
        },
        release: {
          title: 'Release 2.0',
          date: 'Notice: The 2.0 release has been moved to July 2026 due to limited capacity and quality assurance.',
          summary:
            'Release 2.0 focuses on classroom essentials – a redesigned interface, powerful event tools, smarter overviews, and role-aware accounts.',
          highlights: {
            design: 'Redesigned dark theme with finely tuned typography.',
            animations: 'Smooth animations keep every transition fluid.',
            events: 'Event feature for spontaneous gatherings, clubs, and special dates.',
            upcoming: 'Upcoming events page keeps plans crystal clear.',
            privacy: 'Privacy notice woven right into the experience.',
            accounts: 'Account system with roles, permissions, and email verification.',
            imprint: 'Legal notice (imprint) now included.',
            holidays: 'Holidays and vacations live inside the calendar.',
            multiClass: 'Plan events and breaks for multiple classes simultaneously.',
            contact: 'Direct support now lives at support@akzuwo.ch.',
            dayView: 'Day overview unites assignments, exams, and events.',
          },
          cta: 'Learn more',
        },
        guide: {
          title: 'User guide',
          summary:
            'Step-by-step guidance for teachers, students, and class admins in one place.',
          points: {
            teachers: 'Plan lessons, post assignments, and schedule events.',
            students: 'Track homework, remember dates, and follow the daily feed.',
            admins: 'Manage roles, connect classes, and coordinate holidays.',
          },
          cta: 'Open the guide',
        },
      },
      changelog: {
        pageTitle: 'Changelog',
        title: 'Changelog',
        subtitle:
          'Explore the Homework Manager release notes featuring the highlights of version 2.0 and earlier updates.',
        back: '← Back to overview',
        release: {
          title: 'Release 2.0',
          date: 'October 2025',
          summary:
            'Homework Manager 2.0 delivers a fully refreshed experience packed with new capabilities. Here are the headline improvements.',
          items: {
            design:
              'Completely redesigned interface with a cohesive dark theme and refined typography.',
            animations: 'Fluid micro-animations make every page feel smoother.',
            events: 'Brand-new “Event” feature to capture club meetings, outings, and special occasions.',
            upcoming: 'Upcoming events page delivers a clearer overview.',
            privacy: 'Privacy notice is built right into the experience.',
            accounts: 'New account system with roles, permissions, and email verification.',
            imprint: 'Legal notice (imprint) now ships with the platform.',
            holidays: 'Holidays and vacations appear directly inside the calendar.',
            multiClass: 'Plan events and breaks for multiple classes at once.',
            contact: 'Need help? Reach the team via support@akzuwo.ch.',
            dayView: 'Day overview gathers assignments, exams, and events into one focused stream.',
          },
        },
        archive: {
          title: 'Earlier versions',
          release171: {
            title: 'Release 1.7.1',
            summary:
              'Release 1.7.1 keeps the calendar moving forward and polishes established workflows.',
            items: {
              calendar: 'Admins can now create calendar entries on the spot and edit them immediately.',
              uiFixes: 'Resolved several visual glitches across the interface.',
              formatting: 'Task descriptions now support bold and italic formatting for richer storytelling.',
            },
            patch01: {
              title: 'Patch 0x01',
              items: {
                overlayButton: 'Fixed the close button alignment on calendar overlays.',
                uiTweaks: 'Additional fine-tuning of UI components without changing their behavior.',
              },
            },
            patch02: {
              title: 'Patch 0x02',
              items: {
                scheduleUi: 'Updated the timetable view with refreshed styling.',
              },
            },
          },
        },
      },
      calendar: {
        pageTitle: 'Calendar',
        heading: '📅 Calendar',
        description: 'Keep homework, exams and events in view with a cohesive dark experience.',
        header: {
          eyebrow: 'Planning board',
          badge: 'Calendar hub',
          subtitle: 'Real-time overview for homework, exams and events.',
          status: 'Live synced',
          menuLabel: 'Calendar navigation',
          actions: {
            help: 'Help & support',
            upcoming: 'Upcoming',
          },
        },
        status: {
          loading: 'Loading calendar …',
          error: 'Unable to load calendar entries!',
          unauthorized: 'Please sign in and make sure you are assigned to a class to view the calendar.',
        },
        views: {
          month: 'Month',
          week: 'Week',
          day: 'Day',
        },
        viewSwitch: {
          label: 'Switch calendar view',
        },
        monthNav: {
          label: 'Month navigation',
          previous: 'Previous month',
          next: 'Next month',
          current: 'Current month',
          today: 'Today',
        },
        classSelector: {
          label: 'Class',
          placeholder: 'Select class',
        },
        actions: {
          create: {
            label: 'New entry',
            tooltip: 'Create a new calendar entry',
            disabled: 'Please sign in to create personal todos.',
          },
          export: {
            label: 'Export',
            tooltip: 'Export calendar as ICS',
            loading: 'Exporting …',
            success: 'Calendar exported successfully.',
            error: 'Failed to export the calendar.',
            fileName: 'homework-calendar.ics',
            unauthorized: 'Please sign in and make sure you are assigned to a class to export the calendar.',
          },
          back: {
            label: 'Back to overview',
            tooltip: 'Go back to the dashboard',
          },
        },
        actionBar: {
          label: 'Calendar actions',
        },
        weekStrip: {
          label: 'Calendar weeks',
          week: 'W',
        },
        legend: {
          homework: 'Homework',
          exam: 'Exam',
          event: 'Event',
          holiday: 'Holidays & breaks',
          todo: 'ToDo',
        },
        formMessages: {
          invalidDate: 'Please enter a valid date (DD.MM.YYYY).',
          invalidEnd: 'The end time must not be before the start time.',
          missingSubject: 'Please choose a subject.',
          missingEventTitle: 'Please enter an event title.',
        },
        modal: {
          viewTitle: 'Calendar entry',
          noDescription: '<em>No description provided.</em>',
          close: 'Close',
          createTitle: '📝 Create new entry',
          labels: {
            type: 'Type',
            subject: 'Subject',
            eventTitle: 'Event title',
            date: 'Date',
            dateWithFormat: 'Date (DD.MM.YYYY)',
            start: 'Start time',
            end: 'End time',
            endDate: 'End date',
            description: 'Description',
            descriptionOptional: 'Description (optional)',
          },
          placeholders: {
            subject: '– select –',
            eventTitle: 'Event name',
            description: 'Entry details',
            descriptionShort: 'Short description',
            date: '09/18/2025',
          },
          hints: {
            eventTitle: 'Required for events.',
          },
          buttons: {
            cancel: 'Cancel',
            close: 'Close',
            save: 'Save',
            saveLoading: 'Saving …',
            delete: 'Delete',
            deleteLoading: 'Deleting …',
            add: 'Add entry',
            addLoading: 'Adding …',
          },
          deleteConfirm: {
            title: 'Delete entry?',
            message: 'Do you really want to delete this entry?',
          },
          confirmDelete: 'Do you really want to delete this entry?',
          messages: {
            saveError: 'Unable to save the entry.',
            deleteError: 'Unable to delete the entry.',
            deleteSuccess: 'Entry deleted successfully!',
            saveSuccess: 'Entry saved successfully!',
            saveRetry: 'We could not save the entry after several attempts. Please try again later.',
          },
        },
      },
      contact: {
        title: 'Get in touch',
        description: 'Send us a message and we will get back to you as soon as possible.',
        name: 'Name',
        email: 'Email address',
        subject: 'Subject',
        message: 'Message',
        attachment: 'Attach file (optional)',
        attachmentHint: 'Max. 2 MB',
        privacy: 'By submitting you agree to the processing of your data.',
        submit: 'Send message',
        cancel: 'Cancel',
        success: 'Thank you! Your message has been sent successfully.',
        error: 'We could not send your message. Please try again later.',
        errorValidation: 'Please review the highlighted fields.',
        fallbackTitle: 'You can also reach us via email:',
        fallbackCta: 'Write an email',
        close: 'Close',
      },
      help: {
        pageTitle: 'User guide',
        back: '← Back to the homepage',
        title: 'User guide',
        subtitle: 'Practical tips so every role can get started right away.',
        note: 'This guide follows the refreshed dark theme and scroll animations.',
        teacher: {
          title: 'For teachers',
          summary: 'Plan entries and keep your class informed.',
          steps: {
            create: 'Click the desired day in the calendar, choose the type and times, then save the entry.',
            format: 'Use *TEXT* inside the description to highlight important details in bold.',
            attachments: 'Attachments are not supported—share links or references directly in the description.',
            overview: 'Review upcoming work in the day overview once a timetable .json has been submitted.',
          },
        },
        students: {
          title: 'For students',
          summary: 'Track rooms, deadlines, and assignments on any device.',
          steps: {
            dayView:
              'The day overview lists homework, exams, and events once your class has submitted its timetable .json.',
            currentSubject: 'The “Current subject” page shows where your next lesson will take place.',
            calendar: 'Tap a day in the calendar to read entry details and find events quickly.',
            questions: 'If anything is unclear, email support@akzuwo.ch for help.',
          },
        },
        admins: {
          title: 'For class admins',
          summary: 'Keep roles, timetables, and entries organised.',
          steps: {
            schedule:
              'Make sure someone from your class submits the timetable .json so the day overview and current subject unlock.',
            create: 'Create entries yourself by clicking the appropriate day in the calendar.',
            privacy: 'Point people to the privacy page for detailed information.',
            support: 'Need a hand? Email support@akzuwo.ch—this address is dedicated to support requests only.',
          },
        },
        callout: {
          title: 'Good to know',
          schedule: 'Day overview and current subject become available only after a timetable has been provided in .json format.',
          contactForm: 'Support is handled exclusively via support@akzuwo.ch.',
          privacy: 'For more about privacy, read the dedicated privacy page.',
          support: 'Still curious? Reach out to support.',
        },
      },
      profile: {
        title: 'Profile',
        pageTitle: 'Profile',
        eyebrow: 'Account',
        subtitle: 'Manage your personal details, class assignment, and security.',
        overviewLabel: 'Overview',
        overviewTitle: 'Account overview',
        overviewDescription: 'Your current account details at a glance.',
        userId: 'User ID',
        email: 'Email',
        class: 'Class',
        classId: 'Class ID',
        accountAge: 'Account age',
        accountCreated: 'Created on',
        lastClassChange: 'Last class change',
        classLabel: 'Class',
        classTitle: 'Class assignment',
        classHint: 'You can change your class once per month.',
        classInputLabel: 'Class ID',
        classPlaceholder: 'e.g. 12',
        changeClass: 'Change class',
        classChangeReady: 'You can change your class now.',
        classCooldown: 'You can change your class again in {days} days.',
        classCooldownOne: 'You can change your class again in 1 day.',
        classChangeMissing: 'Please enter a class ID.',
        classChangeSuccess: 'Class updated successfully.',
        classChangeError: 'Could not update the class.',
        classChangeInvalid: 'Please enter a valid class ID.',
        classChangeNotFound: 'Class not found.',
        classChangeCooldownError: 'You can change your class again in {days} days.',
        securityLabel: 'Security',
        passwordTitle: 'Change password',
        passwordDescription: 'Update your password and receive a confirmation email once the change succeeds.',
        currentPassword: 'Current password',
        newPassword: 'New password',
        confirmPassword: 'Confirm password',
        passwordHint: 'Use at least 8 characters.',
        passwordChangeButton: 'Update password',
        passwordMismatch: 'The new passwords do not match.',
        passwordChangeSuccess: 'Password updated successfully.',
        passwordChangeWeak: 'The password is too weak.',
        passwordChangeInvalidCurrent: 'Current password is incorrect.',
        passwordChangeUnchanged: 'Please choose a different password.',
        passwordChangeError: 'Could not change the password.',
        passwordEmailSuccess: 'We sent you a confirmation email.',
        passwordEmailFailure: 'Password updated, but we could not send the confirmation email.',
        passwordMissing: 'Please fill in all password fields.',
        dangerZone: 'Danger zone',
        deleteTitle: 'Delete account',
        deleteWarning: 'This will permanently remove your account.',
        deleteButton: 'Delete account',
        deleteConfirm: 'Do you really want to permanently delete your account?',
        deleteSuccess: 'Account deleted.',
        deleteError: 'Could not delete the account.',
        loadError: 'Could not load your profile.',
        loadUnavailable: 'The profile service is temporarily unavailable.',
        unknownValue: '–',
        ageDay: '1 day',
        ageDays: '{count} days',
      },
      auth: {
        pageTitle: 'Login - Homework Manager',
        logoAlt: 'Logo',
        verificationRequired: 'Email verification required',
        verificationRequiredBody:
          'Please confirm your email address via the link in your inbox. Delivery can take a few minutes. You can request a new email here.',
        verificationResendLink: 'Resend verification email',
        accountButton: 'Account',
        accountProfile: 'Profile',
        adminNavButton: 'Admin',
        authStatusGuest: 'Not signed in',
        authStatusSignedIn: 'Signed in as {role}',
        close: 'Close',
        cooldownWarning: 'Please wait a moment before trying again.',
        emailLabel: 'Email address',
        emailNotVerified: 'Please verify your email address first.',
        emailPlaceholder: 'name@example.com',
        emailRequired: 'Please enter an email address.',
        forgotPassword: 'Forgot password?',
        forgotPasswordMissingEmail: 'Please enter your email address first.',
        genericError: 'Something went wrong while signing in. Please try again later.',
        guestButton: 'Continue as guest',
        guestInfo: 'Continue without an account',
        hide: 'Hide password',
        inactive: 'Your account has been deactivated. Please contact an administrator.',
        invalidCredentials: 'The email or password is incorrect.',
        loginButton: 'Log in',
        logoutButton: 'Log out',
        newBadge: 'NEW',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Password',
        passwordRequired: 'Please enter a password.',
        passwordResetCancel: 'Back to login',
        passwordResetCodeHint: 'The code is valid for 10 minutes. Please also check your spam folder.',
        passwordResetCodeLabel: 'Reset code',
        passwordResetCodePlaceholder: '8-digit code',
        passwordResetCodeRequired: 'Please enter the reset code.',
        passwordResetConfirmLabel: 'Confirm new password',
        passwordResetError: 'Reset is currently unavailable. Please try again later.',
        passwordResetInvalidCode: 'The code is invalid or has expired.',
        passwordResetNewPasswordLabel: 'New password',
        passwordResetNewPasswordPlaceholder: 'New password',
        passwordResetPasswordMismatch: 'The passwords do not match.',
        passwordResetPasswordRequired: 'Please enter a new password.',
        passwordResetPasswordWeak: 'Your new password must contain at least 8 characters.',
        passwordResetRequest: 'Request reset code',
        passwordResetRequestError: 'We could not request a reset code. Please try again later.',
        passwordResetRequestLoading: 'Requesting…',
        passwordResetRequestSuccess: 'If an account exists, we just sent you a reset code.',
        passwordResetSubmit: 'Change password',
        passwordResetSubmitLoading: 'Updating password…',
        passwordResetSubtitle: 'Enter the code from your email and choose a new password.',
        passwordResetSuccess: 'Your password has been updated. You can sign in now.',
        passwordResetTitle: '🔁 Reset password',
        registerClassLabel: 'Class (optional)',
        registerClassNotFound: 'We could not find this class.',
        registerClassPlaceholder: 'e.g. L23a / Teachers: leave this blank',
        registerEmailExists: 'An account already exists for this email address.',
        registerEmailInvalid: 'Please use your @sluz.ch email address.',
        registerGenericError: 'Registration is currently unavailable. Please try again later.',
        registerPasswordConfirmLabel: 'Confirm password',
        registerPasswordMismatch: 'Passwords do not match.',
        registerSubmit: 'Register',
        registerSubmitLoading: 'Registering…',
        registerSubtitle: 'Sign up with your school email address.',
        registerSuccess: 'Almost done! Enter the verification code we emailed you.',
        registerTitle: '🆕 Create account',
        registerWeakPassword: 'Password must be at least 8 characters long.',
        resendError: 'We could not send the email. Please try again later.',
        resendSuccess: 'If an account exists, we have sent the code again. Delivery can take a few minutes.',
        show: 'Show password',
        submit: 'Log in',
        submitLoading: 'Logging in…',
        switchToLogin: 'Already registered? Log in',
        switchToRegister: 'New here? Create an account',
        title: '🔒 Login',
        verificationCodeHint: '⚠️ Email delivery can take up to 2 minutes.',
        verificationCodeInvalid: 'The code is invalid or has expired.',
        verificationCodeLabel: 'Verification code',
        verificationCodePlaceholder: '8-digit code',
        verificationCodeResend: 'Resend code',
        verificationCodeResendLoading: 'Sending…',
        verificationCodeSubmit: 'Confirm code',
        verificationCodeSubmitLoading: 'Checking…',
        verificationCodeSuccess: 'Success! Your email address has been confirmed. You can sign in now.',
        verificationStepSubtitle: 'Confirm your email address to get started.',
        verificationStepTitle: 'You are almost ready!',
        roleLabels: {
          admin: 'Administrator',
          teacher: 'Teacher',
          class_admin: 'Class admin',
          student: 'Student',
          guest: 'Guest',
        },
      },
      gradeCalculator: {
        pageTitle: 'Grade Calculator',
        title: 'Grade Calculator',
        add: {
          title: 'Add grade',
          gradeLabel: 'Grade',
          gradePlaceholder: 'e.g. 5.5',
          weightLabel: 'Weight',
          weightPlaceholder: 'e.g. 1',
          addButton: 'Add',
        },
        table: {
          number: 'No.',
          grade: 'Grade',
          weight: 'Weight',
          actions: 'Actions',
        },
        summary: {
          average: 'Average',
        },
        target: {
          title: 'Target average',
          targetLabel: 'Target average',
          targetPlaceholder: 'e.g. 5',
          nextWeightLabel: 'Weight of next grade',
          nextWeightPlaceholder: 'e.g. 1',
          calculateButton: 'Calculate',
          required: 'Required grade: –',
        },
        back: 'Back',
        messages: {
          invalidNumber: 'Please enter valid numbers.',
          required: 'Please fill in this field.',
          gradeRange: 'Grades must be between 1 and 6.',
          weightPositive: 'Weight must be greater than 0.',
          targetRange: 'The target average must be between 1 and 6.',
          nextWeight: 'The next grade weight must be greater than 0.',
          requiredGradeLabel: 'Required grade',
          unachievable: 'Not achievable',
          unachievableDetail: 'Target not reachable (max. {max})',
          deleteAction: 'Remove grade',
          editAction: 'Edit grade',
          saveAction: 'Save changes',
          cancelAction: 'Cancel editing',
        },
      },
      dayOverview: {
        pageTitle: 'Daily Overview',
        title: '📅 Daily Overview',
        classLabel: 'Class',
        classPlaceholder: 'Select class',
        back: '◀️ Back',
        loading: 'Loading data…',
        unauthorized:
          'Please sign in and make sure you are assigned to a class to view the daily overview.',
        featureUnavailable: 'This feature is not yet available for your class.',
        table: {
          time: 'Time',
          subject: 'Subject',
          room: 'Room',
          empty: 'No entries',
        },
        error: 'Error loading data.',
        classLoading: 'Loading classes…',
        classError: 'Unable to load classes.',
        classChangeError: 'Unable to change class.',
        classRequired: 'Please choose a class to use this feature.',
      },
      upcoming: {
        pageTitle: 'Upcoming Events',
        title: '🔔 Upcoming Events',
        lead: 'Stay on top of upcoming school events and plan ahead with ease.',
        notice: 'This feature is currently being rebuilt.',
        loading: 'Loading data…',
        back: '◀️ Back to overview',
        backLabel: 'Back to the home page',
        unauthorized:
          'Please sign in and make sure you are assigned to a class to view upcoming events.',
        empty: 'No upcoming events found.',
        eventBadge: 'EVENT',
        subjectLabel: 'Subject {subject}',
        subjectMissing: 'No subject provided',
        allDay: 'All day',
        noDescription: '– No description –',
        cardLabel: 'Event {subject}on {date}{time}',
        error: 'Error loading data.',
      },
      weeklyPreview: {
        pageTitle: 'Weekly Preview',
        title: '🧠 Weekly Preview',
        lead: 'AI summary of tasks and events for the next 7 days.',
        loading: 'Generating preview…',
        refresh: 'Regenerate',
        back: '◀️ Back to overview',
        unauthorized: 'Please sign in and make sure you are assigned to a class.',
        empty: 'No entries in the next 7 days.',
        error: 'Unable to generate weekly preview right now.',
        classLabel: 'Class',
        classPlaceholder: 'Select class',
        classLoading: 'Loading classes…',
        classError: 'Unable to load classes.',
        classChangeError: 'Unable to change class.',
        classRequired: 'Please choose a class.',
        meta: {
          text: 'Updated: {time} · Source: {source}',
          cached: 'from cache',
          fresh: 'newly generated',
        },
      },
      currentSubject: {
        pageTitle: 'Current Subject',
        title: 'Current Subject',
        classLabel: 'Class',
        classPlaceholder: 'Select class',
        loading: 'Loading current data …',
        countdownLabel: 'Time remaining',
        currentLesson: {
          title: 'Current Lesson',
          empty: 'No lesson in progress.',
        },
        nextLesson: {
          title: 'Next Lesson',
          empty: 'No further lessons today.',
        },
        labels: {
          start: 'Start',
          end: 'End',
          room: 'Room',
          subject: 'Subject',
        },
        actions: {
          dayOverview: 'Daily Overview',
          back: 'Back',
        },
        progressLabel: 'Lesson progress',
        freeSlot: 'Free period',
        error: 'Unable to load data.',
        unauthorized:
          'Please sign in and make sure you are assigned to a class to view the current subject.',
        featureUnavailable: 'This feature is not yet available for your class.',
        classLoading: 'Loading classes…',
        classError: 'Unable to load classes.',
        classChangeError: 'Unable to change class.',
        classRequired: 'Please choose a class to use this feature.',
      },
      admin: {
        pageTitle: 'Admin Dashboard - Homework Manager',
        noscript: 'Please enable JavaScript to manage the admin dashboard.',
      },
      privacy: {
        pageTitle: 'Privacy Policy · Homework Manager',
        main: `<header class="legal-header">
      <h1 class="legal-title">Privacy Policy</h1>
      <p class="legal-subtitle">How we handle personal data in the Homework Manager.</p>
    </header>

    <section class="legal-section">
      <h2>Data Controller</h2>
      <article class="legal-card">
        <dl>
          <div>
            <dt>Name</dt>
            <dd>Timo Wigger</dd>
          </div>
          <div>
            <dt>Project</dt>
            <dd>Homework Manager</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd><a class="hm-footer__link" href="mailto:support@akzuwo.ch">support@akzuwo.ch</a></dd>
          </div>
          <div>
            <dt>Postal address</dt>
            <dd>Provided upon request in line with applicable legal requirements.</dd>
          </div>
        </dl>
        <p class="legal-note">Responsible for processing within the meaning of the Swiss RevD-DSG and, where applicable, Art. 4(7) GDPR.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Data We Process</h2>
      <article class="legal-card">
        <p>We only process the information you actively store in Homework Manager, such as assignments, subjects, grades, and events. Technical metadata like the date of your last sign-in is retained to keep your account secure.</p>
        <p>No third-party tracking or analytics services are used. Your data stays on our systems and is never shared for advertising purposes.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Cookies &amp; Web Storage</h2>
      <article class="legal-card">
        <p>We use a technically required session cookie to authenticate you after sign-in. The session cookie is stored only for the active session and expires automatically when you sign out or close your browser.</p>
        <p>We also use <code>sessionStorage</code> to keep temporary information such as form states or your email address during the session. This data stays locally in your browser and is cleared when you close the tab.</p>
        <p>We do not use tracking or analytics cookies.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Purpose and Legal Basis</h2>
      <article class="legal-card">
        <p>We use your data to provide Homework Manager, synchronise your content, and respond to support requests. Processing is based on our legitimate interest in running a reliable service and, where an account exists, on fulfilling pre-contractual or contractual obligations.</p>
        <p class="legal-note">Legal bases include Art. 6(1)(b) and Art. 6(1)(f) GDPR as well as the relevant provisions of the RevD-DSG.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Recipients/Processors</h2>
      <article class="legal-card">
        <p>We use carefully selected service providers that process personal data on our behalf. Your data remains protected and we enter into the required processor agreements.</p>
        <ul>
          <li>Web host: Cloudflare.com (hosting)</li>
          <li>Backend: Render.com (server operations and data storage)</li>
          <li>Email delivery: Brevo.com (support and system messages)</li>
        </ul>
        <p class="legal-note"><em>These details are provided for transparency only and are not intended to promote the providers.</em></p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Server Logs &amp; Security</h2>
      <article class="legal-card">
        <p>When you access Homework Manager we process IP addresses and request metadata (e.g. timestamp, requested URL, user agent). This data is needed to keep the service running, analyse errors, enforce rate limits, and prevent abuse.</p>
        <p>Server logs are typically retained for up to 30 days and then deleted or anonymised unless security incidents require a longer retention period.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Third-Country Transfers</h2>
      <article class="legal-card">
        <p>No processing takes place outside Switzerland or the EU. All data is processed exclusively within the EU or Switzerland, and no transfers to third countries occur.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Retention and Security</h2>
      <article class="legal-card">
        <p>We retain your data only for as long as necessary to provide Homework Manager. When you delete your account or ask us to erase your data, we remove personal information unless statutory retention duties require otherwise.</p>
        <p>Current security measures such as encrypted connections and role-based access protect your information from unauthorised access.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Your Rights</h2>
      <article class="legal-card">
        <p>You may exercise your rights regarding your personal data at any time, including the right to:</p>
        <ul>
          <li>request access to the data we store about you,</li>
          <li>rectify inaccurate or incomplete information,</li>
          <li>erase your data where no legal obligations prevent it,</li>
          <li>restrict processing or object to specific uses,</li>
          <li>receive your data in a structured, commonly used format.</li>
        </ul>
      </article>
    </section>

    <section class="legal-section">
      <h2>Right to Lodge a Complaint</h2>
      <article class="legal-card">
        <p>You have the right to lodge a complaint with a supervisory authority about the processing of your personal data. The competent authority in Switzerland is the Federal Data Protection and Information Commissioner (FDPIC/EDÖB).</p>
        <p>Where the GDPR applies, you may also lodge a complaint with an EU supervisory authority, in particular in the member state of your habitual residence, place of work, or the place of the alleged infringement.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Privacy Contact</h2>
      <article class="legal-card">
        <p>If you have any questions about privacy, please contact us using the address above. Add “Privacy request” to the subject line so we can address your enquiry quickly.</p>
      </article>
    </section>`,
      },
      imprint: {
        pageTitle: 'Legal Notice · Homework Manager',
        main: `<header class="legal-header">
      <h1 class="legal-title">Legal Notice</h1>
      <p class="legal-subtitle">Key legal information and contact details for the Homework Manager platform.</p>
    </header>

    <section class="legal-section">
      <h2>Responsible Entity</h2>
      <article class="legal-card">
        <dl>
          <div>
            <dt>Name</dt>
            <dd>Timo Wigger</dd>
          </div>
          <div>
            <dt>Project</dt>
            <dd>Homework Manager</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd><a class="hm-footer__link" href="mailto:support@akzuwo.ch">support@akzuwo.ch</a></dd>
          </div>
          <div>
            <dt>Postal address</dt>
            <dd>Provided upon request in line with the applicable legal requirements.</dd>
          </div>
        </dl>
        <p class="legal-note">Content responsibility in accordance with Swiss RevD-DSG Art. 14 para. 1 and German Interstate Media Treaty § 18 para. 2.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Contact</h2>
      <article class="legal-card">
        <p>Please reach out via e-mail for support, feedback, or legal enquiries. We usually respond within two business days.</p>
        <p class="legal-note">For privacy-related requests, use the same contact address and add “Privacy request” to the subject line.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Liability</h2>
      <article class="legal-card">
        <p>We carefully review all content published on this website. Nevertheless, we cannot guarantee completeness or accuracy at all times. As a service provider we are responsible for our own content in line with the general laws, but we are not obliged to monitor third-party information that is transmitted or stored.</p>
        <p>Obligations to remove or block the use of information according to general legislation remain unaffected. Liability in this respect is only possible from the point in time at which a specific infringement becomes known.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Copyright</h2>
      <article class="legal-card">
        <p>All materials created by the operator of this website are subject to Swiss copyright law. Contributions by third parties are identified as such. Reproduction, editing, distribution, or any kind of exploitation beyond the scope of copyright law requires written permission from the respective author or creator.</p>
      </article>
    </section>`,
      },
    },
    it: {
      common: {
        appName: 'Homework Manager',
        nav: {
          home: 'Home',
          calendar: 'Calendario',
          upcoming: 'Eventi in arrivo',
          weeklyPreview: 'Anteprima settimanale',
          grades: 'Calcolatore di voti',
          currentSubject: 'Materia attuale',
          logout: 'Disconnettersi',
          primary: 'Navigazione principale',
          toggle: 'Apri il menu di navigazione',
          language: 'Cambia lingua',
          mobileNotice: 'La versione mobile è in sviluppo e potrebbe contenere alcuni bug.',
        },
        footer: {
          copyright: '©️ Timo Wigger 2025',
          contact: 'support@akzuwo.ch',
          imprint: 'Note legali',
          privacy: 'Privacy',
          changelog: 'Changelog',
          navigation: 'Navigazione footer',
        },
        language: {
          menuLabel: 'Seleziona la lingua',
        },
      },
      home: {
        pageTitle: 'Homework Manager',
        heroTitle: 'Homework Manager 2.0',
        description: {
          lead:
            'Homework Manager è nato per condividere compiti, verifiche e progetti in modo trasparente con tutta la classe.',
          body:
            'Al posto di chat disperse e appunti dimenticati, la piattaforma riunisce scadenze, promemoria e strumenti utili in un\'unica interfaccia chiara – sempre disponibile e pensata per il lavoro di squadra.',
        },
        status: {
          title: 'Avviso: Work in Progress',
          body:
            'Homework Manager 2.0 è ancora in fase di sviluppo attivo, quindi alcune sezioni potrebbero non funzionare sempre perfettamente.',
        },
        releaseGoal: {
          title: 'Obiettivo di rilascio',
          body: 'Avviso: la release 2.0 è stata rimandata a luglio 2026 per carenza di capacità e di controllo qualità.',
        },
        release: {
          title: 'Release 2.0',
          date:
            'Avviso: la release 2.0 è stata rimandata a luglio 2026 per carenza di capacità e di controllo qualità.',
          summary:
            'La release 2.0 porta tutto ciò che serve in classe: interfaccia rinnovata, gestione degli eventi, ruoli dedicati e maggiore attenzione a privacy e panoramiche.',
          highlights: {
            design: 'Tema scuro riprogettato con tipografia precisa.',
            animations: 'Micro-animazioni fluide per passaggi più morbidi.',
            events: 'Funzione Eventi per uscite, club e date speciali.',
            upcoming: 'Nuova pagina degli eventi in arrivo per una visione chiara.',
            privacy: 'Informativa sulla privacy integrata.',
            accounts: 'Sistema di account con ruoli, permessi e verifica e-mail.',
            imprint: 'Informazioni legali aggiunte alla piattaforma.',
            holidays: 'Vacanze e festività direttamente nel calendario.',
            multiClass: 'Eventi e vacanze per più classi in un colpo solo.',
            contact: 'Supporto diretto via email a support@akzuwo.ch.',
            dayView: 'Panoramica giornaliera con compiti, verifiche ed eventi.',
          },
          cta: 'Scopri di più',
        },
        guide: {
          title: 'Guida rapida',
          summary:
            'I passaggi fondamentali per docenti, studenti e admin di classe riuniti in un’unica pagina.',
          points: {
            teachers: 'Preparare lezioni, pubblicare compiti e creare eventi.',
            students: 'Trovare i compiti, segnare le date e seguire il feed giornaliero.',
            admins: 'Gestire i ruoli, collegare le classi e pianificare le vacanze.',
          },
          cta: 'Apri la guida',
        },
      },
      changelog: {
        pageTitle: 'Changelog',
        title: 'Changelog',
        subtitle:
          'Consulta le note di rilascio di Homework Manager con i punti salienti della versione 2.0 e degli aggiornamenti precedenti.',
        back: '← Torna alla panoramica',
        release: {
          title: 'Release 2.0',
          date: 'Ottobre 2025',
          summary:
            'Homework Manager 2.0 offre un’esperienza completamente rinnovata ricca di novità. Ecco i miglioramenti principali.',
          items: {
            design:
              'Interfaccia riprogettata da cima a fondo con un tema scuro coerente e tipografia curata.',
            animations: 'Micro-animazioni fluide rendono ogni pagina ancora più morbida.',
            events: 'Nuova funzione «Eventi» per pianificare uscite, club e appuntamenti speciali.',
            upcoming: 'Pagina degli eventi in arrivo per una panoramica più chiara.',
            privacy: 'Informativa sulla privacy integrata nell’esperienza.',
            accounts: 'Nuovo sistema di account con ruoli, permessi e verifica e-mail.',
            imprint: 'Informazioni legali (impressum) aggiunte alla piattaforma.',
            holidays: 'Vacanze e festività ora visibili direttamente nel calendario.',
            multiClass: 'Crea eventi e vacanze per più classi contemporaneamente.',
            contact: 'Hai bisogno di aiuto? Scrivi a support@akzuwo.ch.',
            dayView:
              'La panoramica giornaliera riunisce compiti, verifiche ed eventi in un unico flusso concentrato.',
          },
        },
        archive: {
          title: 'Versioni precedenti',
          release171: {
            title: 'Release 1.7.1',
            summary:
              'La release 1.7.1 dà nuova energia al calendario e rifinisce l’interfaccia esistente.',
            items: {
              calendar:
                'Gli admin possono ora creare voci direttamente nel calendario e modificarle all’istante.',
              uiFixes: 'Corrette diverse anomalie di visualizzazione nell’interfaccia.',
              formatting:
                'Le descrizioni delle attività supportano ora grassetto e corsivo per evidenziare meglio le informazioni.',
            },
            patch01: {
              title: 'Patch 0x01',
              items: {
                overlayButton: 'Risolto l’allineamento del pulsante di chiusura nelle finestre del calendario.',
                uiTweaks: 'Ulteriori piccoli ritocchi ai componenti dell’interfaccia senza alterarne le funzioni.',
              },
            },
            patch02: {
              title: 'Patch 0x02',
              items: {
                scheduleUi: 'Interfaccia dell’orario aggiornata graficamente.',
              },
            },
          },
        },
      },
      calendar: {
        pageTitle: 'Calendario',
        heading: '📅 Calendario',
        description: 'Gestisci compiti, verifiche ed eventi in un\'interfaccia scura e coerente.',
        header: {
          eyebrow: 'Area di pianificazione',
          badge: 'Hub calendario',
          subtitle: 'Panoramica in tempo reale di compiti, verifiche ed eventi.',
          status: 'Sincronizzato in tempo reale',
          menuLabel: 'Navigazione calendario',
          actions: {
            help: 'Aiuto & supporto',
            upcoming: 'In arrivo',
          },
        },
        status: {
          loading: 'Caricamento del calendario …',
          error: 'Impossibile caricare le voci del calendario!',
          unauthorized: 'Accedi e assicurati di essere assegnato a una classe per visualizzare il calendario.',
        },
        views: {
          month: 'Mese',
          week: 'Settimana',
          day: 'Giorno',
        },
        viewSwitch: {
          label: 'Cambia vista calendario',
        },
        monthNav: {
          label: 'Navigazione mesi',
          previous: 'Mese precedente',
          next: 'Mese successivo',
          current: 'Mese corrente',
          today: 'Oggi',
        },
        classSelector: {
          label: 'Classe',
          placeholder: 'Seleziona classe',
        },
        actions: {
          create: {
            label: 'Nuova voce',
            tooltip: 'Crea una nuova voce di calendario',
            disabled: 'Accedi per creare ToDo personali.',
          },
          export: {
            label: 'Esporta',
            tooltip: 'Esporta il calendario come ICS',
            loading: 'Esportazione …',
            success: 'Calendario esportato con successo.',
            error: 'Errore durante l\'esportazione del calendario.',
            fileName: 'homework-calendar.ics',
            unauthorized: 'Accedi e assicurati di essere assegnato a una classe per esportare il calendario.',
          },
          back: {
            label: 'Panoramica',
            tooltip: 'Torna alla pagina iniziale',
          },
        },
        actionBar: {
          label: 'Azioni del calendario',
        },
        weekStrip: {
          label: 'Settimane',
          week: 'Sett.',
        },
        legend: {
          homework: 'Compito',
          exam: 'Verifica',
          event: 'Evento',
          holiday: 'Vacanze e pause',
          todo: 'ToDo',
        },
        formMessages: {
          invalidDate: 'Inserisci una data valida nel formato GG.MM.AAAA.',
          invalidEnd: 'L\'orario di fine non può precedere l\'orario di inizio.',
          missingSubject: 'Seleziona una materia.',
          missingEventTitle: 'Inserisci un titolo per l\'evento.',
        },
        modal: {
          viewTitle: 'Voce di calendario',
          noDescription: '<em>Nessuna descrizione disponibile.</em>',
          close: 'Chiudi',
          createTitle: '📝 Crea una nuova voce',
          labels: {
            type: 'Tipo',
            subject: 'Materia',
            eventTitle: 'Titolo evento',
            date: 'Data',
            dateWithFormat: 'Data (GG.MM.AAAA)',
            start: 'Ora di inizio',
            end: 'Ora di fine',
            endDate: 'Data di fine',
            description: 'Descrizione',
            descriptionOptional: 'Descrizione (facoltativa)',
          },
          placeholders: {
            subject: '– seleziona –',
            eventTitle: 'Nome dell\'evento',
            description: 'Dettagli della voce',
            descriptionShort: 'Breve descrizione',
            date: '18.09.2025',
          },
          hints: {
            eventTitle: 'Campo obbligatorio per gli eventi.',
          },
          buttons: {
            cancel: 'Annulla',
            close: 'Chiudi',
            save: 'Salva',
            saveLoading: 'Salvataggio …',
            delete: 'Elimina',
            deleteLoading: 'Eliminazione …',
            add: 'Aggiungi',
            addLoading: 'Aggiunta …',
          },
          deleteConfirm: {
            title: 'Eliminare la voce?',
            message: 'Vuoi davvero eliminare questa voce?',
          },
          confirmDelete: 'Vuoi davvero eliminare questa voce?',
          messages: {
            saveError: 'Impossibile salvare la voce.',
            deleteError: 'Impossibile eliminare la voce.',
            deleteSuccess: 'Voce eliminata con successo.',
            saveSuccess: 'Voce salvata con successo!',
            saveRetry: 'Non è stato possibile salvare la voce dopo vari tentativi. Riprova più tardi.',
          },
        },
      },
      contact: {
        title: 'Contattaci',
        description: 'Scrivici e ti risponderemo il prima possibile.',
        name: 'Nome',
        email: 'Indirizzo e-mail',
        subject: 'Oggetto',
        message: 'Messaggio',
        attachment: 'Allega file (opzionale)',
        attachmentHint: 'Max 2 MB',
        privacy: 'Inviando accetti il trattamento dei tuoi dati.',
        submit: 'Invia messaggio',
        cancel: 'Annulla',
        success: 'Grazie! Il tuo messaggio è stato inviato con successo.',
        error: 'Impossibile inviare il messaggio. Riprova più tardi.',
        errorValidation: 'Controlla i campi evidenziati.',
        fallbackTitle: 'Puoi anche scriverci via email:',
        fallbackCta: 'Scrivi un’email',
        close: 'Chiudi',
      },
      help: {
        pageTitle: 'Guida utente',
        back: '← Torna alla home',
        title: 'Guida utente',
        subtitle: 'Consigli pratici per iniziare subito con ogni ruolo.',
        note: 'Questa guida segue il tema scuro aggiornato e le animazioni di scorrimento.',
        teacher: {
          title: 'Per docenti',
          summary: 'Pianifica le voci e tieni informata la classe.',
          steps: {
            create: 'Clicca il giorno desiderato nel calendario, scegli tipo e orari, quindi salva la voce.',
            format: 'Usa *TESTO* nella descrizione per evidenziare in grassetto i dettagli importanti.',
            attachments: 'Gli allegati non sono supportati: condividi link o riferimenti nella descrizione.',
            overview: 'Controlla i prossimi lavori nella panoramica giornaliera dopo l’invio del .json dell’orario.',
          },
        },
        students: {
          title: 'Per studenti',
          summary: 'Tieni traccia di aule, scadenze e compiti su qualsiasi dispositivo.',
          steps: {
            dayView: 'La panoramica giornaliera elenca compiti, esami ed eventi dopo l’invio dell’orario .json.',
            currentSubject: 'La pagina “Materia attuale” mostra dove si terrà la prossima lezione.',
            calendar: 'Tocca un giorno nel calendario per leggere i dettagli e trovare rapidamente gli eventi.',
            questions: 'Se qualcosa non è chiaro, scrivi a support@akzuwo.ch.',
          },
        },
        admins: {
          title: 'Per admin di classe',
          summary: 'Gestisci ruoli, orari e voci.',
          steps: {
            schedule:
              'Assicurati che qualcuno della classe invii l’orario .json per sbloccare panoramica giornaliera e materia attuale.',
            create: 'Crea le voci selezionando il giorno appropriato nel calendario.',
            privacy: 'Indirizza le persone alla pagina della privacy per i dettagli.',
            support: 'Serve una mano? Scrivi a support@akzuwo.ch: questo indirizzo è dedicato al supporto.',
          },
        },
        callout: {
          title: 'Da sapere',
          schedule: 'Panoramica giornaliera e materia attuale sono disponibili solo dopo l’invio dell’orario in formato .json.',
          contactForm: 'Il supporto è gestito esclusivamente via support@akzuwo.ch.',
          privacy: 'Per maggiori dettagli sulla privacy, leggi la pagina dedicata.',
          support: 'Hai ancora domande? Contatta il supporto.',
        },
      },
      profile: {
        title: 'Profilo',
        pageTitle: 'Profilo',
        eyebrow: 'Account',
        subtitle: 'Gestisci i tuoi dati personali, la classe assegnata e la sicurezza.',
        overviewLabel: 'Panoramica',
        overviewTitle: 'Riepilogo account',
        overviewDescription: 'Tutti i dati principali del tuo profilo in un colpo d’occhio.',
        userId: 'ID utente',
        email: 'E‑mail',
        class: 'Classe',
        classId: 'ID classe',
        accountAge: 'Età dell\'account',
        accountCreated: 'Creato il',
        lastClassChange: 'Ultimo cambio classe',
        classLabel: 'Classe',
        classTitle: 'Modifica classe',
        classHint: 'È possibile cambiare classe solo una volta al mese.',
        classInputLabel: 'ID classe',
        classPlaceholder: 'es. 12',
        changeClass: 'Cambia classe',
        classChangeReady: 'Puoi cambiare classe adesso.',
        classCooldown: 'Potrai cambiare classe tra {days} giorni.',
        classCooldownOne: 'Potrai cambiare classe tra 1 giorno.',
        classChangeMissing: 'Inserisci un ID classe.',
        classChangeSuccess: 'Classe aggiornata correttamente.',
        classChangeError: 'Impossibile aggiornare la classe.',
        classChangeInvalid: 'ID classe non valido.',
        classChangeNotFound: 'Classe non trovata.',
        classChangeCooldownError: 'Potrai cambiare classe tra {days} giorni.',
        securityLabel: 'Sicurezza',
        passwordTitle: 'Cambia password',
        passwordDescription: 'Aggiorna la password e ricevi un\'e-mail di conferma quando la modifica è avvenuta.',
        currentPassword: 'Password attuale',
        newPassword: 'Nuova password',
        confirmPassword: 'Conferma password',
        passwordHint: 'Almeno 8 caratteri.',
        passwordChangeButton: 'Aggiorna password',
        passwordMismatch: 'Le nuove password non coincidono.',
        passwordChangeSuccess: 'Password aggiornata correttamente.',
        passwordChangeWeak: 'Password troppo debole.',
        passwordChangeInvalidCurrent: 'La password attuale non è corretta.',
        passwordChangeUnchanged: 'Scegli una password diversa.',
        passwordChangeError: 'Impossibile cambiare la password.',
        passwordEmailSuccess: 'Ti abbiamo inviato un\'e-mail di conferma.',
        passwordEmailFailure: 'Password aggiornata, ma l\'e-mail di conferma non è stata inviata.',
        passwordMissing: 'Compila tutti i campi della password.',
        dangerZone: 'Zona di pericolo',
        deleteTitle: 'Elimina account',
        deleteWarning: 'Questa azione rimuoverà definitivamente il tuo account.',
        deleteButton: 'Elimina account',
        deleteConfirm: 'Vuoi eliminare definitivamente il tuo account?',
        deleteSuccess: 'Account eliminato.',
        deleteError: 'Impossibile eliminare l\'account.',
        loadError: 'Impossibile caricare il profilo.',
        loadUnavailable: 'Il servizio profilo non è temporaneamente disponibile.',
        unknownValue: '–',
        ageDay: '1 giorno',
        ageDays: '{count} giorni',
      },
      auth: {
        pageTitle: 'Login - Homework Manager',
        logoAlt: 'Logo',
        verificationRequired: 'Verifica e-mail necessaria',
        verificationRequiredBody:
          'Conferma il tuo indirizzo e-mail tramite il link ricevuto. L\'invio può richiedere alcuni minuti. Puoi richiedere qui un nuovo messaggio di verifica.',
        verificationResendLink: 'Invia di nuovo l\'e-mail di verifica',
        accountButton: 'Account',
        accountProfile: 'Profilo',
        adminNavButton: 'Amministrazione',
        authStatusGuest: 'Non connesso',
        authStatusSignedIn: 'Connesso come {role}',
        close: 'Chiudi',
        cooldownWarning: 'Attendi un momento prima di riprovare.',
        emailLabel: 'Indirizzo e-mail',
        emailNotVerified: 'Verifica prima il tuo indirizzo e-mail.',
        emailPlaceholder: 'nome@example.com',
        emailRequired: 'Inserisci un indirizzo e-mail.',
        forgotPassword: 'Password dimenticata?',
        forgotPasswordMissingEmail: 'Inserisci prima il tuo indirizzo e-mail.',
        genericError: 'Si è verificato un errore durante l\'accesso. Riprova più tardi.',
        guestButton: 'Continua come ospite',
        guestInfo: 'Continua senza account',
        hide: 'Nascondi password',
        inactive: 'Il tuo account è stato disattivato. Contatta un amministratore.',
        invalidCredentials: 'E-mail o password non corretti.',
        loginButton: 'Accedi',
        logoutButton: 'Esci',
        newBadge: 'NUOVO',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Password',
        passwordRequired: 'Inserisci una password.',
        passwordResetCancel: 'Torna al login',
        passwordResetCodeHint: 'Il codice è valido per 10 minuti. Controlla anche la cartella spam.',
        passwordResetCodeLabel: 'Codice di reimpostazione',
        passwordResetCodePlaceholder: 'Codice a 8 cifre',
        passwordResetCodeRequired: 'Inserisci il codice di reimpostazione.',
        passwordResetConfirmLabel: 'Conferma nuova password',
        passwordResetError: 'Impossibile completare il reset. Riprova più tardi.',
        passwordResetInvalidCode: 'Il codice non è valido o è scaduto.',
        passwordResetNewPasswordLabel: 'Nuova password',
        passwordResetNewPasswordPlaceholder: 'Nuova password',
        passwordResetPasswordMismatch: 'Le password non coincidono.',
        passwordResetPasswordRequired: 'Inserisci una nuova password.',
        passwordResetPasswordWeak: 'La nuova password deve contenere almeno 8 caratteri.',
        passwordResetRequest: 'Richiedi codice',
        passwordResetRequestError: 'Al momento non è possibile richiedere un codice. Riprova più tardi.',
        passwordResetRequestLoading: 'Invio in corso…',
        passwordResetRequestSuccess: 'Se esiste un account, ti abbiamo appena inviato un codice di reimpostazione.',
        passwordResetSubmit: 'Cambia password',
        passwordResetSubmitLoading: 'Aggiornamento…',
        passwordResetSubtitle: 'Inserisci il codice ricevuto via e-mail e scegli una nuova password.',
        passwordResetSuccess: 'La tua password è stata aggiornata. Ora puoi accedere.',
        passwordResetTitle: '🔁 Reimposta password',
        registerClassLabel: 'Classe (facoltativo)',
        registerClassNotFound: 'Questa classe non è stata trovata.',
        registerClassPlaceholder: 'es. L23a / Docenti: lasciare questo campo vuoto',
        registerEmailExists: 'Esiste già un account per questo indirizzo e-mail.',
        registerEmailInvalid: 'Usa il tuo indirizzo email @sluz.ch.',
        registerGenericError: 'Registrazione momentaneamente non disponibile. Riprova più tardi.',
        registerPasswordConfirmLabel: 'Conferma password',
        registerPasswordMismatch: 'Le password non coincidono.',
        registerSubmit: 'Registrati',
        registerSubmitLoading: 'Registrazione…',
        registerSubtitle: 'Registrati con la tua e-mail scolastica.',
        registerSuccess: 'Quasi fatto! Inserisci il codice di verifica che ti abbiamo inviato via e-mail.',
        registerTitle: '🆕 Crea un account',
        registerWeakPassword: 'La password deve contenere almeno 8 caratteri.',
        resendError: 'Impossibile inviare l’e-mail. Riprova più tardi.',
        resendSuccess: 'Se esiste un account, abbiamo inviato nuovamente il codice. La consegna può richiedere alcuni minuti.',
        show: 'Mostra password',
        submit: 'Accedi',
        submitLoading: 'Accesso…',
        switchToLogin: 'Hai già un account? Accedi',
        switchToRegister: 'Nuovo qui? Crea un account',
        title: '🔒 Login',
        verificationCodeHint: '⚠️ L\'invio dell\'e-mail può richiedere fino a 2 minuti.',
        verificationCodeInvalid: 'Il codice non è valido o è scaduto.',
        verificationCodeLabel: 'Codice di verifica',
        verificationCodePlaceholder: 'Codice a 8 cifre',
        verificationCodeResend: 'Invia di nuovo il codice',
        verificationCodeResendLoading: 'Invio…',
        verificationCodeSubmit: 'Conferma codice',
        verificationCodeSubmitLoading: 'Verifica in corso…',
        verificationCodeSuccess: 'Fatto! Il tuo indirizzo e-mail è stato confermato. Ora puoi accedere.',
        verificationStepSubtitle: 'Conferma il tuo indirizzo e-mail per iniziare.',
        verificationStepTitle: 'Ci sei quasi!',
        roleLabels: {
          admin: 'Amministratore',
          teacher: 'Docente',
          class_admin: 'Admin di classe',
          student: 'Studente',
          guest: 'Ospite',
        },
      },
      gradeCalculator: {
        pageTitle: 'Calcolatore di voti',
        title: 'Calcolatore di voti',
        add: {
          title: 'Aggiungi voto',
          gradeLabel: 'Voto',
          gradePlaceholder: 'es. 5.5',
          weightLabel: 'Peso',
          weightPlaceholder: 'es. 1',
          addButton: 'Aggiungi',
        },
        table: {
          number: 'N.',
          grade: 'Voto',
          weight: 'Peso',
          actions: 'Azioni',
        },
        summary: {
          average: 'Media',
        },
        target: {
          title: 'Calcola media obiettivo',
          targetLabel: 'Media desiderata',
          targetPlaceholder: 'es. 5',
          nextWeightLabel: 'Peso del prossimo voto',
          nextWeightPlaceholder: 'es. 1',
          calculateButton: 'Calcola',
          required: 'Voto necessario: –',
        },
        back: 'Indietro',
        messages: {
          invalidNumber: 'Inserisci numeri validi.',
          required: 'Compila questo campo.',
          gradeRange: 'Il voto deve essere tra 1 e 6.',
          weightPositive: 'Il peso deve essere maggiore di 0.',
          targetRange: 'La media desiderata deve essere tra 1 e 6.',
          nextWeight: 'Il peso del prossimo voto deve essere maggiore di 0.',
          requiredGradeLabel: 'Voto necessario',
          unachievable: 'Non raggiungibile',
          unachievableDetail: 'Obiettivo non raggiungibile (max. {max})',
          deleteAction: 'Elimina voto',
          editAction: 'Modifica voto',
          saveAction: 'Salva modifiche',
          cancelAction: 'Annulla modifica',
        },
      },
      dayOverview: {
        pageTitle: 'Panoramica giornaliera',
        title: '📅 Panoramica giornaliera',
        classLabel: 'Classe',
        classPlaceholder: 'Seleziona classe',
        back: '◀️ Indietro',
        loading: 'Caricamento dati…',
        unauthorized:
          'Accedi e assicurati di essere assegnato a una classe per visualizzare la panoramica giornaliera.',
        featureUnavailable: 'Questa funzione non è ancora disponibile per la tua classe.',
        table: {
          time: 'Orario',
          subject: 'Materia',
          room: 'Aula',
          empty: 'Nessuna voce',
        },
        error: 'Errore durante il caricamento dei dati.',
        classLoading: 'Caricamento delle classi…',
        classError: 'Impossibile caricare le classi.',
        classChangeError: 'Impossibile cambiare classe.',
        classRequired: 'Seleziona una classe per utilizzare questa funzione.',
      },
      upcoming: {
        pageTitle: 'Eventi in arrivo',
        title: '🔔 Eventi in arrivo',
        lead: 'Rimani aggiornato sugli eventi scolastici imminenti e organizza la tua settimana con facilità.',
        notice: 'Questa funzione è attualmente in fase di revisione.',
        loading: 'Caricamento dati…',
        back: '◀️ Torna alla panoramica',
        backLabel: 'Torna alla pagina principale',
        unauthorized:
          'Accedi e assicurati di essere assegnato a una classe per vedere gli eventi in arrivo.',
        empty: 'Nessun evento imminente trovato.',
        eventBadge: 'EVENT',
        subjectLabel: 'Materia {subject}',
        subjectMissing: 'Nessuna materia indicata',
        allDay: 'Tutto il giorno',
        noDescription: '– Nessuna descrizione –',
        cardLabel: 'Evento {subject}il {date}{time}',
        error: 'Errore durante il caricamento dei dati.',
      },
      weeklyPreview: {
        pageTitle: 'Anteprima settimanale',
        title: '🧠 Anteprima settimanale',
        lead: 'Riepilogo IA di compiti ed eventi per i prossimi 7 giorni.',
        loading: 'Generazione anteprima…',
        refresh: 'Rigenera',
        back: '◀️ Torna alla panoramica',
        unauthorized: 'Accedi e assicurati di essere assegnato a una classe.',
        empty: 'Nessuna voce nei prossimi 7 giorni.',
        error: 'Impossibile generare l’anteprima settimanale in questo momento.',
        classLabel: 'Classe',
        classPlaceholder: 'Seleziona classe',
        classLoading: 'Caricamento delle classi…',
        classError: 'Impossibile caricare le classi.',
        classChangeError: 'Impossibile cambiare classe.',
        classRequired: 'Seleziona una classe.',
        meta: {
          text: 'Aggiornato: {time} · Fonte: {source}',
          cached: 'da cache',
          fresh: 'appena generato',
        },
      },
      currentSubject: {
        pageTitle: 'Materia attuale',
        title: 'Materia attuale',
        classLabel: 'Classe',
        classPlaceholder: 'Seleziona classe',
        loading: 'Caricamento dei dati attuali …',
        countdownLabel: 'Tempo rimanente',
        currentLesson: {
          title: 'Lezione attuale',
          empty: 'Nessuna lezione in corso.',
        },
        nextLesson: {
          title: 'Prossima lezione',
          empty: 'Nessun\'altra lezione oggi.',
        },
        labels: {
          start: 'Inizio',
          end: 'Fine',
          room: 'Aula',
          subject: 'Materia',
        },
        actions: {
          dayOverview: 'Panoramica giornaliera',
          back: 'Indietro',
        },
        progressLabel: 'Avanzamento della lezione',
        freeSlot: 'Ora libera',
        error: 'Impossibile caricare i dati.',
        unauthorized: 'Accedi e assicurati di essere assegnato a una classe per vedere la materia attuale.',
        featureUnavailable: 'Questa funzione non è ancora disponibile per la tua classe.',
        classLoading: 'Caricamento delle classi…',
        classError: 'Impossibile caricare le classi.',
        classChangeError: 'Impossibile cambiare classe.',
        classRequired: 'Seleziona una classe per utilizzare questa funzione.',
      },
      admin: {
        pageTitle: 'Pannello di amministrazione - Homework Manager',
        noscript: 'Attiva JavaScript per utilizzare il pannello di amministrazione.',
      },
      privacy: {
        pageTitle: 'Informativa sulla privacy · Homework Manager',
        main: `<header class="legal-header">
      <h1 class="legal-title">Informativa sulla privacy</h1>
      <p class="legal-subtitle">Come trattiamo i dati personali su Homework Manager.</p>
    </header>

    <section class="legal-section">
      <h2>Titolare del trattamento</h2>
      <article class="legal-card">
        <dl>
          <div>
            <dt>Nome</dt>
            <dd>Timo Wigger</dd>
          </div>
          <div>
            <dt>Progetto</dt>
            <dd>Homework Manager</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd><a class="hm-footer__link" href="mailto:support@akzuwo.ch">support@akzuwo.ch</a></dd>
          </div>
          <div>
            <dt>Indirizzo postale</dt>
            <dd>Fornito su richiesta nel rispetto delle disposizioni di legge.</dd>
          </div>
        </dl>
        <p class="legal-note">Responsabile del trattamento ai sensi del RevD-DSG svizzero e, ove applicabile, dell'art. 4, n. 7 GDPR.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Dati che trattiamo</h2>
      <article class="legal-card">
        <p>Trattiamo esclusivamente le informazioni che salvi attivamente in Homework Manager, come compiti, materie, voti ed eventi. Inoltre conserviamo metadati tecnici, ad esempio la data dell'ultimo accesso, per proteggere il tuo account.</p>
        <p>Non utilizziamo servizi di tracciamento o analisi di terzi. I tuoi dati rimangono sui nostri sistemi e non vengono ceduti a fini pubblicitari.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Cookie &amp; Web Storage</h2>
      <article class="legal-card">
        <p>Utilizziamo un cookie di sessione tecnicamente necessario per autenticarti dopo l'accesso. Il cookie di sessione viene conservato solo per la durata della sessione attiva e scade automaticamente quando effettui il logout o chiudi il browser.</p>
        <p>Inoltre utilizziamo <code>sessionStorage</code> per memorizzare temporaneamente informazioni come lo stato dei moduli o il tuo indirizzo e-mail durante la sessione. Questi dati restano localmente nel tuo browser e vengono cancellati alla chiusura della scheda.</p>
        <p>Non utilizziamo cookie di tracciamento o di analisi.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Finalità e basi giuridiche</h2>
      <article class="legal-card">
        <p>Utilizziamo i tuoi dati per fornire Homework Manager, sincronizzare i contenuti e rispondere alle richieste di supporto. Il trattamento si basa sul nostro legittimo interesse a mantenere un servizio affidabile e, se esiste un account, sull'adempimento di obblighi contrattuali o precontrattuali.</p>
        <p class="legal-note">Le basi giuridiche comprendono l'art. 6, par. 1, lett. b e lett. f GDPR e le corrispondenti disposizioni del RevD-DSG.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Destinatari/Responsabili del trattamento</h2>
      <article class="legal-card">
        <p>Ci avvaliamo di fornitori selezionati che trattano dati personali per nostro conto. I tuoi dati restano protetti e sottoscriviamo i necessari accordi di trattamento.</p>
        <ul>
          <li>Web host: Cloudflare.com (hosting)</li>
          <li>Backend: Render.com (gestione dei server e archiviazione dei dati)</li>
          <li>Invio e‑mail: Brevo.com (messaggi di supporto e di sistema)</li>
        </ul>
        <p class="legal-note"><em>Queste informazioni sono fornite solo per trasparenza e non costituiscono una promozione dei fornitori.</em></p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Log del server &amp; sicurezza</h2>
      <article class="legal-card">
        <p>Quando accedi a Homework Manager trattiamo indirizzi IP e metadati delle richieste (ad es. timestamp, URL richiesto, user agent). Questi dati servono a garantire il funzionamento tecnico, analizzare errori, applicare limitazioni di frequenza e prevenire abusi.</p>
        <p>I log del server vengono conservati di norma fino a 30 giorni e poi eliminati o anonimizzati, salvo necessità di conservazione più lunga per motivi di sicurezza.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Trasferimenti verso paesi terzi</h2>
      <article class="legal-card">
        <p>Nessun trattamento avviene al di fuori della Svizzera o dell'UE. Tutti i dati vengono trattati esclusivamente nell'UE o in Svizzera e non avvengono trasferimenti verso paesi terzi.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Conservazione e sicurezza</h2>
      <article class="legal-card">
        <p>Conserviamo i tuoi dati solo per il tempo necessario a utilizzare Homework Manager. Se elimini il tuo account o ci chiedi la cancellazione, rimuoviamo le informazioni personali salvo obblighi di conservazione previsti dalla legge.</p>
        <p>Connessioni crittografate e controlli di accesso basati sui ruoli proteggono le tue informazioni da accessi non autorizzati.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>I tuoi diritti</h2>
      <article class="legal-card">
        <p>Puoi esercitare in qualsiasi momento i tuoi diritti in relazione ai dati personali, tra cui:</p>
        <ul>
          <li>ottenere conferma e accesso ai dati che ti riguardano,</li>
          <li>rettificare dati inesatti o incompleti,</li>
          <li>chiedere la cancellazione dei dati, salvo obblighi legali contrari,</li>
          <li>limitare il trattamento o opporti a determinate finalità,</li>
          <li>ricevere i dati in un formato strutturato e di uso comune.</li>
        </ul>
      </article>
    </section>

    <section class="legal-section">
      <h2>Diritto di reclamo</h2>
      <article class="legal-card">
        <p>Hai il diritto di presentare un reclamo a un’autorità di controllo in merito al trattamento dei tuoi dati personali. In Svizzera l’autorità competente è l’Incaricato federale della protezione dei dati e della trasparenza (IFPDT/EDÖB).</p>
        <p>Qualora si applichi il GDPR, puoi inoltre presentare un reclamo a un’autorità di controllo dell’UE, in particolare nello Stato membro della tua residenza abituale, del luogo di lavoro o del luogo della presunta violazione.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Contatto per la privacy</h2>
      <article class="legal-card">
        <p>Per domande o richieste sulla protezione dei dati puoi scriverci all'indirizzo indicato sopra. Ti invitiamo a inserire \"Richiesta privacy\" nell'oggetto per permetterci di gestire rapidamente la tua comunicazione.</p>
      </article>
    </section>`,
      },
      imprint: {
        pageTitle: 'Note legali · Homework Manager',
        main: `<header class="legal-header">
      <h1 class="legal-title">Note legali</h1>
      <p class="legal-subtitle">Informazioni giuridiche e contatti ufficiali per la piattaforma Homework Manager.</p>
    </header>

    <section class="legal-section">
      <h2>Soggetto responsabile</h2>
      <article class="legal-card">
        <dl>
          <div>
            <dt>Nome</dt>
            <dd>Timo Wigger</dd>
          </div>
          <div>
            <dt>Progetto</dt>
            <dd>Homework Manager</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd><a class="hm-footer__link" href="mailto:support@akzuwo.ch">support@akzuwo.ch</a></dd>
          </div>
          <div>
            <dt>Indirizzo postale</dt>
            <dd>Fornito su richiesta nel rispetto degli obblighi di legge.</dd>
          </div>
        </dl>
        <p class="legal-note">Responsabile dei contenuti ai sensi dell'art. 14 cpv. 1 RevD-DSG e del § 18 cpv. 2 MStV.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Contatti</h2>
      <article class="legal-card">
        <p>Per assistenza, feedback o segnalazioni ti invitiamo a contattarci via e-mail. Di norma rispondiamo entro due giorni lavorativi.</p>
        <p class="legal-note">Per richieste sulla protezione dei dati utilizza lo stesso indirizzo e-mail indicando nell'oggetto \"Protezione dei dati\".</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Responsabilità</h2>
      <article class="legal-card">
        <p>I contenuti del sito sono redatti con la massima cura; tuttavia non possiamo garantire completezza e correttezza assoluta. In qualità di fornitori di servizi siamo responsabili dei contenuti propri, ma non siamo tenuti a monitorare informazioni di terzi trasmesse o memorizzate.</p>
        <p>Restano salvi gli obblighi di rimozione o blocco delle informazioni secondo le normative vigenti. Una responsabilità è possibile solo dal momento della conoscenza di una violazione specifica.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Diritto d'autore</h2>
      <article class="legal-card">
        <p>I contenuti creati dal gestore del sito sono soggetti al diritto d'autore svizzero. I contributi di terzi sono contrassegnati come tali. Ogni riproduzione o utilizzo al di fuori dei limiti previsti richiede il consenso scritto dell'autore.</p>
      </article>
    </section>`,
      },
    },
    fr: {
      common: {
        appName: 'Homework Manager',
        nav: {
          home: 'Tableau de bord',
          calendar: 'Calendrier',
          upcoming: 'À venir',
          weeklyPreview: 'Aperçu hebdomadaire',
          grades: 'Calculateur de notes',
          currentSubject: 'Matière actuelle',
          logout: 'Déconnexion',
          primary: 'Navigation principale',
          toggle: 'Basculer le menu de navigation',
          language: 'Changer de langue',
          mobileNotice: 'L’édition mobile est en développement et peut encore contenir quelques bugs.',
        },
        footer: {
          copyright: '©️ Timo Wigger 2025',
          contact: 'support@akzuwo.ch',
          imprint: 'Mentions légales',
          privacy: 'Protection des données',
          changelog: 'Journal des modifications',
          navigation: 'Navigation du pied de page',
        },
        language: {
          menuLabel: 'Sélectionner la langue',
        },
      },
      home: {
        pageTitle: 'Homework Manager',
        heroTitle: 'Homework Manager 2.0',
        description: {
          lead:
            'Homework Manager a été créé pour partager les devoirs, évaluations et projets en toute transparence avec toute la classe.',
          body:
            'Plutôt que des discussions dispersées et des notes oubliées, la plateforme rassemble horaires, rappels et outils pratiques dans une interface claire – disponible à tout moment et pensée pour le travail en équipe.',
        },
        status: {
          title: 'Info : Work in Progress',
          body:
            'Homework Manager 2.0 est toujours en cours de développement, il se peut donc que certaines sections ne fonctionnent pas encore parfaitement.',
        },
        releaseGoal: {
          title: 'Objectif de sortie',
          body: 'Information : la sortie de la version 2.0 est reportée à juillet 2026 en raison de capacités limitées et de l’assurance qualité.',
        },
        release: {
          title: 'Version 2.0',
          date:
            'Information : la sortie de la version 2.0 est reportée à juillet 2026 en raison de capacités limitées et de l’assurance qualité.',
          summary:
            'La version 2.0 met l’accent sur l’essentiel en classe : interface repensée, gestion des événements, nouveaux rôles et contrôles de confidentialité.',
          highlights: {
            design: 'Thème sombre repensé avec une typographie précise.',
            animations: 'Micro-animations fluides pour des transitions souples.',
            events: 'Fonction « Événement » pour sorties, clubs et moments spéciaux.',
            upcoming: 'Nouvelle page des événements à venir pour garder le cap.',
            privacy: 'Notice de confidentialité intégrée.',
            accounts: 'Système de comptes avec rôles, droits et vérification e-mail.',
            imprint: 'Mentions légales désormais incluses.',
            holidays: 'Vacances et jours fériés directement dans le calendrier.',
            multiClass: 'Planification d’événements et de vacances pour plusieurs classes.',
            contact: 'Support direct par e-mail via support@akzuwo.ch.',
            dayView: 'Vue quotidienne combinant devoirs, évaluations et événements.',
          },
          cta: 'En savoir plus',
        },
        guide: {
          title: 'Guide d’utilisation',
          summary:
            'Retrouvez l’essentiel pour les enseignant·e·s, les élèves et les admins de classe.',
          points: {
            teachers: 'Préparer les cours, publier des devoirs et annoncer des événements.',
            students: 'Consulter les devoirs, noter les dates et suivre le flux quotidien.',
            admins: 'Gérer les rôles, relier les classes et organiser les vacances.',
          },
          cta: 'Ouvrir le guide',
        },
      },
      changelog: {
        pageTitle: 'Journal des modifications',
        title: 'Journal des modifications',
        subtitle:
          'Découvrez les notes de version de Homework Manager – avec les temps forts de la version 2.0 et des mises à jour précédentes.',
        back: '← Retour à l’aperçu',
        release: {
          title: 'Version 2.0',
          date: 'Octobre 2025',
          summary:
            'Homework Manager 2.0 propose une expérience entièrement repensée et riche en nouveautés. Voici les éléments clés du lancement.',
          items: {
            design:
              'Interface entièrement réinventée avec un thème sombre cohérent et une typographie soignée.',
            animations: 'Micro-animations fluides pour une navigation encore plus douce.',
            events: 'Nouveau module « Événement » pour planifier sorties, clubs et rendez-vous spéciaux.',
            upcoming: 'Page des événements à venir pour une vue d’ensemble plus claire.',
            privacy: 'Notice de confidentialité intégrée directement.',
            accounts: 'Nouveau système de comptes avec rôles, droits et vérification par e-mail.',
            imprint: 'Mentions légales désormais incluses dans la plateforme.',
            holidays: 'Vacances et jours fériés visibles directement dans le calendrier.',
            multiClass: 'Création d’événements et de vacances pour plusieurs classes en même temps.',
            contact: 'Besoin d’aide ? Écrivez à support@akzuwo.ch.',
            dayView: 'Vue quotidienne regroupant devoirs, examens et événements dans un flux focalisé.',
          },
        },
        archive: {
          title: 'Versions précédentes',
          release171: {
            title: 'Version 1.7.1',
            summary:
              'La version 1.7.1 dynamise le calendrier et apporte un polissage bienvenu à l’interface.',
            items: {
              calendar:
                'Les admins peuvent désormais créer des entrées directement dans le calendrier et les modifier aussitôt.',
              uiFixes: 'Plusieurs problèmes d’affichage ont été corrigés.',
              formatting:
                'Les descriptions de tâches prennent en charge le gras et l’italique pour mieux mettre en avant les informations.',
            },
            patch01: {
              title: 'Patch 0x01',
              items: {
                overlayButton: 'Correction de l’affichage du bouton de fermeture dans les fenêtres du calendrier.',
                uiTweaks: 'Autres ajustements visuels mineurs sans impact sur les fonctionnalités.',
              },
            },
            patch02: {
              title: 'Patch 0x02',
              items: {
                scheduleUi: 'Interface de l’emploi du temps rafraîchie.',
              },
            },
          },
        },
      },
      calendar: {
        pageTitle: 'Calendrier',
        heading: '📅 Calendrier',
        description: 'Gardez devoirs, évaluations et événements en vue grâce à une interface sombre harmonisée.',
        header: {
          eyebrow: 'Espace planification',
          badge: 'Hub calendrier',
          subtitle: 'Vue en temps réel des devoirs, évaluations et événements.',
          status: 'Synchronisé en direct',
          menuLabel: 'Navigation du calendrier',
          actions: {
            help: 'Aide & support',
            upcoming: 'À venir',
          },
        },
        status: {
          loading: 'Chargement du calendrier …',
          error: 'Impossible de charger les entrées du calendrier !',
          unauthorized: 'Connecte-toi et assure-toi d’être affecté·e à une classe pour afficher le calendrier.',
        },
        views: {
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
        },
        viewSwitch: {
          label: 'Changer la vue du calendrier',
        },
        monthNav: {
          label: 'Navigation par mois',
          previous: 'Mois précédent',
          next: 'Mois suivant',
          current: 'Mois en cours',
          today: "Aujourd'hui",
        },
        classSelector: {
          label: 'Classe',
          placeholder: 'Sélectionner une classe',
        },
        actions: {
          create: {
            label: 'Nouvelle entrée',
            tooltip: 'Créer une nouvelle entrée de calendrier',
            disabled: 'Connecte-toi pour créer des ToDos personnels.',
          },
          export: {
            label: 'Exporter',
            tooltip: 'Exporter le calendrier au format ICS',
            loading: 'Export en cours…',
            success: 'Calendrier exporté avec succès.',
            error: 'Échec de l’export du calendrier.',
            fileName: 'homework-calendar.ics',
            unauthorized: 'Connecte-toi et assure-toi d’être affecté·e à une classe pour exporter le calendrier.',
          },
          back: {
            label: 'Retour à l’aperçu',
            tooltip: 'Revenir au tableau de bord',
          },
        },
        actionBar: {
          label: 'Actions du calendrier',
        },
        weekStrip: {
          label: 'Semaines du calendrier',
          week: 'Sem',
        },
        legend: {
          homework: 'Devoir',
          exam: 'Évaluation',
          event: 'Événement',
          holiday: 'Vacances et congés',
          todo: 'ToDo',
        },
        formMessages: {
          invalidDate: 'Veuillez saisir une date valide au format JJ.MM.AAAA.',
          invalidEnd: 'L’heure de fin ne peut pas être antérieure à l’heure de début.',
          missingSubject: 'Veuillez choisir une matière.',
          missingEventTitle: 'Veuillez saisir un titre d’événement.',
        },
        modal: {
          viewTitle: 'Entrée du calendrier',
          noDescription: '<em>Aucune description disponible.</em>',
          close: 'Fermer',
          createTitle: '📝 Créer une nouvelle entrée',
          labels: {
            type: 'Type',
            subject: 'Matière',
            eventTitle: 'Titre de l’événement',
            date: 'Date',
            dateWithFormat: 'Date (JJ.MM.AAAA)',
            start: 'Heure de début',
            end: 'Heure de fin',
            endDate: 'Date de fin',
            description: 'Description',
            descriptionOptional: 'Description (facultatif)',
          },
          placeholders: {
            subject: '– sélectionner –',
            eventTitle: 'Nom de l’événement',
            description: 'Détails de l’entrée',
            descriptionShort: 'Résumé',
            date: '18.09.2025',
          },
          hints: {
            eventTitle: 'Champ obligatoire pour les événements.',
          },
          buttons: {
            cancel: 'Annuler',
            close: 'Fermer',
            save: 'Enregistrer',
            saveLoading: 'Enregistrement…',
            delete: 'Supprimer',
            deleteLoading: 'Suppression…',
            add: 'Ajouter',
            addLoading: 'Ajout en cours…',
          },
          deleteConfirm: {
            title: 'Supprimer l’entrée ?',
            message: 'Voulez-vous vraiment supprimer cette entrée ?',
          },
          confirmDelete: 'Voulez-vous vraiment supprimer cette entrée ?',
          messages: {
            saveError: 'Impossible d’enregistrer l’entrée.',
            deleteError: 'Impossible de supprimer l’entrée.',
            deleteSuccess: 'Entrée supprimée avec succès.',
            saveSuccess: 'Entrée enregistrée avec succès !',
            saveRetry: 'Impossible d’enregistrer l’entrée après plusieurs tentatives. Veuillez réessayer plus tard.',
          },
        },
      },
      contact: {
        title: 'Nous contacter',
        description: 'Envoyez-nous un message et nous vous répondrons rapidement.',
        name: 'Nom',
        email: 'Adresse e-mail',
        subject: 'Objet',
        message: 'Message',
        attachment: 'Joindre un fichier (optionnel)',
        attachmentHint: 'Max. 2 Mo',
        privacy: 'En envoyant ce formulaire, vous acceptez le traitement de vos données.',
        submit: 'Envoyer le message',
        cancel: 'Annuler',
        success: 'Merci ! Votre message a bien été envoyé.',
        error: 'Impossible d’envoyer votre message. Veuillez réessayer plus tard.',
        errorValidation: 'Veuillez vérifier les champs mis en évidence.',
        fallbackTitle: 'Vous pouvez également nous écrire par e-mail :',
        fallbackCta: 'Envoyer un e-mail',
        close: 'Fermer',
      },
      help: {
        pageTitle: 'Guide utilisateur',
        back: '← Retour à la page d’accueil',
        title: 'Guide utilisateur',
        subtitle: 'Des conseils pratiques pour démarrer rapidement, quel que soit le rôle.',
        note: 'Ce guide suit le thème sombre actualisé et les animations de défilement.',
        teacher: {
          title: 'Pour les enseignants',
          summary: 'Planifiez les entrées et gardez votre classe informée.',
          steps: {
            create: 'Cliquez sur le jour souhaité dans le calendrier, choisissez le type et les horaires, puis enregistrez.',
            format: 'Utilisez *TEXTE* dans la description pour mettre les détails importants en gras.',
            attachments: 'Les pièces jointes ne sont pas prises en charge ; partagez des liens ou des références dans la description.',
            overview: 'Consultez le travail à venir dans la vue du jour une fois le .json d’emploi du temps envoyé.',
          },
        },
        students: {
          title: 'Pour les élèves',
          summary: 'Suivez les salles, échéances et devoirs sur n’importe quel appareil.',
          steps: {
            dayView: 'La vue du jour liste devoirs, examens et événements après l’envoi du .json de l’emploi du temps.',
            currentSubject: 'La page « Matière actuelle » indique où se déroulera le prochain cours.',
            calendar: 'Touchez un jour dans le calendrier pour lire les détails et repérer rapidement les événements.',
            questions: 'Si quelque chose n’est pas clair, écrivez à support@akzuwo.ch.',
          },
        },
        admins: {
          title: 'Pour les admins de classe',
          summary: 'Gérez les rôles, les emplois du temps et les entrées.',
          steps: {
            schedule:
              'Assurez-vous qu’un membre de la classe envoie le .json de l’emploi du temps pour débloquer la vue du jour et la matière actuelle.',
            create: 'Créez vous-même des entrées en cliquant sur le jour approprié dans le calendrier.',
            privacy: 'Orientez les personnes vers la page confidentialité pour plus d’informations.',
            support: 'Besoin d’aide ? Écrivez à support@akzuwo.ch — cette adresse est dédiée au support.',
          },
        },
        callout: {
          title: 'Bon à savoir',
          schedule: 'La vue du jour et la matière actuelle ne sont disponibles qu’après l’envoi d’un emploi du temps en .json.',
          contactForm: 'Le support est assuré exclusivement via support@akzuwo.ch.',
          privacy: 'Pour en savoir plus sur la confidentialité, consultez la page dédiée.',
          support: 'Encore des questions ? Contactez le support.',
        },
      },
      profile: {
        title: 'Profil',
        pageTitle: 'Profil',
        eyebrow: 'Compte',
        subtitle: 'Gérez vos informations personnelles, votre classe et la sécurité du compte.',
        overviewLabel: 'Vue d\'ensemble',
        overviewTitle: 'Résumé du compte',
        overviewDescription: 'Toutes les informations importantes sur votre profil.',
        userId: 'ID utilisateur',
        email: 'E‑mail',
        class: 'Classe',
        classId: 'ID de classe',
        accountAge: 'Âge du compte',
        accountCreated: 'Créé le',
        lastClassChange: 'Dernier changement de classe',
        classLabel: 'Classe',
        classTitle: 'Modifier la classe',
        classHint: 'Vous pouvez changer de classe une fois par mois.',
        classInputLabel: 'ID de classe',
        classPlaceholder: 'ex. 12',
        changeClass: 'Changer de classe',
        classChangeReady: 'Vous pouvez changer de classe maintenant.',
        classCooldown: 'Vous pourrez changer de classe dans {days} jours.',
        classCooldownOne: 'Vous pourrez changer de classe dans 1 jour.',
        classChangeMissing: 'Veuillez saisir un ID de classe.',
        classChangeSuccess: 'Classe mise à jour avec succès.',
        classChangeError: 'Impossible de mettre à jour la classe.',
        classChangeInvalid: 'ID de classe invalide.',
        classChangeNotFound: 'Classe introuvable.',
        classChangeCooldownError: 'Vous pourrez changer de classe dans {days} jours.',
        securityLabel: 'Sécurité',
        passwordTitle: 'Modifier le mot de passe',
        passwordDescription: 'Mettez à jour votre mot de passe et recevez un e-mail de confirmation dès que le changement est effectif.',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        passwordHint: 'Au moins 8 caractères.',
        passwordChangeButton: 'Mettre à jour le mot de passe',
        passwordMismatch: 'Les nouveaux mots de passe ne correspondent pas.',
        passwordChangeSuccess: 'Mot de passe mis à jour.',
        passwordChangeWeak: 'Le mot de passe est trop faible.',
        passwordChangeInvalidCurrent: 'Le mot de passe actuel est incorrect.',
        passwordChangeUnchanged: 'Veuillez choisir un mot de passe différent.',
        passwordChangeError: 'Impossible de modifier le mot de passe.',
        passwordEmailSuccess: 'Un e-mail de confirmation a été envoyé.',
        passwordEmailFailure: 'Mot de passe mis à jour, mais l\'e-mail de confirmation n\'a pas pu être envoyé.',
        passwordMissing: 'Veuillez remplir tous les champs de mot de passe.',
        dangerZone: 'Zone sensible',
        deleteTitle: 'Supprimer le compte',
        deleteWarning: 'Cette action supprimera définitivement votre compte.',
        deleteButton: 'Supprimer le compte',
        deleteConfirm: 'Voulez-vous vraiment supprimer définitivement votre compte ?',
        deleteSuccess: 'Compte supprimé.',
        deleteError: 'Impossible de supprimer le compte.',
        loadError: 'Impossible de charger votre profil.',
        loadUnavailable: 'Le service de profil est temporairement indisponible.',
        unknownValue: '–',
        ageDay: '1 jour',
        ageDays: '{count} jours',
      },
      auth: {
        pageTitle: 'Connexion - Homework Manager',
        logoAlt: 'Logo',
        verificationRequired: 'Vérification de l’e-mail requise',
        verificationRequiredBody:
          'Confirme ton adresse e-mail via le lien reçu. L’envoi peut prendre quelques minutes. Tu peux demander ici un nouveau message de vérification.',
        verificationResendLink: 'Renvoyer l’e-mail de vérification',
        accountButton: 'Compte',
        accountProfile: 'Profil',
        adminNavButton: 'Administration',
        authStatusGuest: 'Non connecté',
        authStatusSignedIn: 'Connecté en tant que {role}',
        close: 'Fermer',
        cooldownWarning: 'Merci de patienter un instant avant de réessayer.',
        emailLabel: 'Adresse e-mail',
        emailNotVerified: 'Merci de vérifier d’abord ton adresse e-mail.',
        emailPlaceholder: 'nom@example.com',
        emailRequired: 'Saisis une adresse e-mail.',
        forgotPassword: 'Mot de passe oublié ?',
        forgotPasswordMissingEmail: 'Saisis d’abord ton adresse e-mail.',
        genericError: 'Une erreur est survenue lors de la connexion. Réessaie plus tard.',
        guestButton: 'Continuer en tant qu’invité',
        guestInfo: 'Continuer sans compte',
        hide: 'Masquer le mot de passe',
        inactive: 'Ton compte a été désactivé. Contacte un administrateur.',
        invalidCredentials: 'Adresse e-mail ou mot de passe incorrect.',
        loginButton: 'Se connecter',
        logoutButton: 'Se déconnecter',
        newBadge: 'NOUVEAU',
        passwordLabel: 'Mot de passe',
        passwordPlaceholder: 'Mot de passe',
        passwordRequired: 'Saisis un mot de passe.',
        passwordResetCancel: 'Retour à la connexion',
        passwordResetCodeHint: 'Le code est valable 10 minutes. Pense à vérifier ton dossier spam.',
        passwordResetCodeLabel: 'Code de réinitialisation',
        passwordResetCodePlaceholder: 'Code à 8 chiffres',
        passwordResetCodeRequired: 'Merci de saisir le code de réinitialisation.',
        passwordResetConfirmLabel: 'Confirmer le nouveau mot de passe',
        passwordResetError: 'Impossible de réinitialiser pour le moment. Réessaie plus tard.',
        passwordResetInvalidCode: 'Le code est invalide ou a expiré.',
        passwordResetNewPasswordLabel: 'Nouveau mot de passe',
        passwordResetNewPasswordPlaceholder: 'Nouveau mot de passe',
        passwordResetPasswordMismatch: 'Les mots de passe ne correspondent pas.',
        passwordResetPasswordRequired: 'Merci de saisir un nouveau mot de passe.',
        passwordResetPasswordWeak: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
        passwordResetRequest: 'Demander un code',
        passwordResetRequestError: 'Impossible de demander un code pour le moment. Réessaie plus tard.',
        passwordResetRequestLoading: 'Envoi en cours…',
        passwordResetRequestSuccess: 'Si un compte existe, nous venons d’envoyer un code de réinitialisation.',
        passwordResetSubmit: 'Modifier le mot de passe',
        passwordResetSubmitLoading: 'Modification…',
        passwordResetSubtitle: 'Saisis le code reçu par e-mail et choisis un nouveau mot de passe.',
        passwordResetSuccess: 'Ton mot de passe a été mis à jour. Tu peux maintenant te connecter.',
        passwordResetTitle: '🔁 Réinitialiser le mot de passe',
        registerClassLabel: 'Classe (facultatif)',
        registerClassNotFound: 'Cette classe est introuvable.',
        registerClassPlaceholder: 'p. ex. L23a / Enseignants : laissez ce champ vide',
        registerEmailExists: 'Un compte existe déjà pour cette adresse e-mail.',
        registerEmailInvalid: 'Utilise ton adresse e-mail @sluz.ch.',
        registerGenericError: 'L’inscription est momentanément indisponible. Réessaie plus tard.',
        registerPasswordConfirmLabel: 'Confirmer le mot de passe',
        registerPasswordMismatch: 'Les mots de passe ne correspondent pas.',
        registerSubmit: 'S\'inscrire',
        registerSubmitLoading: 'Inscription…',
        registerSubtitle: 'Inscris-toi avec ton adresse e-mail scolaire.',
        registerSuccess: 'Presque terminé ! Saisis le code reçu par e-mail.',
        registerTitle: '🆕 Créer un compte',
        registerWeakPassword: 'Le mot de passe doit contenir au moins 8 caractères.',
        resendError: 'Impossible d’envoyer l’e-mail. Réessaie plus tard.',
        resendSuccess: 'Si un compte existe, nous avons renvoyé le code. La livraison peut prendre quelques minutes.',
        show: 'Afficher le mot de passe',
        submit: 'Se connecter',
        submitLoading: 'Connexion…',
        switchToLogin: 'Déjà inscrit ? Se connecter',
        switchToRegister: 'Nouveau ici ? Créer un compte',
        title: '🔒 Connexion',
        verificationCodeHint: '⚠️ L’envoi de l’e-mail peut prendre jusqu’à 2 minutes.',
        verificationCodeInvalid: 'Le code est invalide ou a expiré.',
        verificationCodeLabel: 'Code de vérification',
        verificationCodePlaceholder: 'Code à 8 chiffres',
        verificationCodeResend: 'Renvoyer le code',
        verificationCodeResendLoading: 'Envoi…',
        verificationCodeSubmit: 'Confirmer le code',
        verificationCodeSubmitLoading: 'Vérification…',
        verificationCodeSuccess: 'Succès ! Ton adresse e-mail a été confirmée. Tu peux te connecter.',
        verificationStepSubtitle: 'Confirme ton e-mail pour commencer.',
        verificationStepTitle: 'Vous y êtes presque !',
        roleLabels: {
          admin: 'Administrateur',
          teacher: 'Enseignant',
          class_admin: 'Admin de classe',
          student: 'Élève',
          guest: 'Invité',
        },
      },
      gradeCalculator: {
        pageTitle: 'Calculateur de notes',
        title: 'Calculateur de notes',
        add: {
          title: 'Ajouter une note',
          gradeLabel: 'Note',
          gradePlaceholder: 'p. ex. 5.5',
          weightLabel: 'Pondération',
          weightPlaceholder: 'p. ex. 1',
          addButton: 'Ajouter',
        },
        table: {
          number: 'N°',
          grade: 'Note',
          weight: 'Pondération',
          actions: 'Actions',
        },
        summary: {
          average: 'Moyenne',
        },
        target: {
          title: 'Calculer la moyenne cible',
          targetLabel: 'Moyenne cible',
          targetPlaceholder: 'p. ex. 5',
          nextWeightLabel: 'Pondération de la prochaine note',
          nextWeightPlaceholder: 'p. ex. 1',
          calculateButton: 'Calculer',
          required: 'Note requise : –',
        },
        back: 'Retour',
        messages: {
          invalidNumber: 'Veuillez saisir des nombres valides.',
          required: 'Veuillez remplir ce champ.',
          gradeRange: 'Les notes doivent être comprises entre 1 et 6.',
          weightPositive: 'La pondération doit être supérieure à 0.',
          targetRange: 'La moyenne cible doit être comprise entre 1 et 6.',
          nextWeight: 'La pondération de la prochaine note doit être supérieure à 0.',
          requiredGradeLabel: 'Note requise',
          unachievable: 'Non atteignable',
          unachievableDetail: 'Objectif inatteignable (max. {max})',
          deleteAction: 'Supprimer la note',
          editAction: 'Modifier la note',
          saveAction: 'Enregistrer les modifications',
          cancelAction: 'Annuler la modification',
        },
      },
      dayOverview: {
        pageTitle: 'Vue quotidienne',
        title: '📅 Vue quotidienne',
        classLabel: 'Classe',
        classPlaceholder: 'Sélectionner une classe',
        back: '◀️ Retour',
        loading: 'Chargement des données…',
        unauthorized: 'Connecte-toi et assure-toi d’être affecté·e à une classe pour voir l’aperçu quotidien.',
        featureUnavailable: 'Cette fonctionnalité n’est pas encore disponible pour ta classe.',
        table: {
          time: 'Heure',
          subject: 'Matière',
          room: 'Salle',
          empty: 'Aucune entrée',
        },
        error: 'Erreur lors du chargement des données.',
        classLoading: 'Chargement des classes…',
        classError: 'Impossible de charger les classes.',
        classChangeError: 'Impossible de changer de classe.',
        classRequired: 'Sélectionne une classe pour utiliser cette fonctionnalité.',
      },
      upcoming: {
        pageTitle: 'Événements à venir',
        title: '🔔 Événements à venir',
        lead: 'Restez informé des événements scolaires à venir et planifiez sereinement.',
        notice: 'Cette fonctionnalité est en cours de refonte.',
        loading: 'Chargement des données…',
        back: '◀️ Retour à l’aperçu',
        backLabel: 'Retour à la page d’accueil',
        unauthorized:
          'Connecte-toi et assure-toi d’être affecté·e à une classe pour consulter les événements à venir.',
        empty: 'Aucun événement à venir.',
        eventBadge: 'ÉVÉNEMENT',
        subjectLabel: 'Matière {subject}',
        subjectMissing: 'Aucune matière renseignée',
        allDay: 'Toute la journée',
        noDescription: '– Pas de description –',
        cardLabel: 'Événement {subject}le {date}{time}',
        error: 'Erreur lors du chargement des données.',
      },
      weeklyPreview: {
        pageTitle: 'Aperçu hebdomadaire',
        title: '🧠 Aperçu hebdomadaire',
        lead: 'Résumé IA des devoirs et événements pour les 7 prochains jours.',
        loading: 'Génération de l’aperçu…',
        refresh: 'Regénérer',
        back: '◀️ Retour à l’aperçu',
        unauthorized: 'Connecte-toi et assure-toi d’être affecté·e à une classe.',
        empty: 'Aucun élément dans les 7 prochains jours.',
        error: 'Impossible de générer l’aperçu hebdomadaire pour le moment.',
        classLabel: 'Classe',
        classPlaceholder: 'Sélectionner une classe',
        classLoading: 'Chargement des classes…',
        classError: 'Impossible de charger les classes.',
        classChangeError: 'Impossible de changer de classe.',
        classRequired: 'Sélectionne une classe.',
        meta: {
          text: 'Mis à jour: {time} · Source: {source}',
          cached: 'depuis le cache',
          fresh: 'nouvellement généré',
        },
      },
      currentSubject: {
        pageTitle: 'Matière actuelle',
        title: 'Matière actuelle',
        classLabel: 'Classe',
        classPlaceholder: 'Sélectionner une classe',
        loading: 'Chargement des données actuelles …',
        countdownLabel: 'Temps restant',
        currentLesson: {
          title: 'Cours en cours',
          empty: 'Aucun cours en cours.',
        },
        nextLesson: {
          title: 'Cours suivant',
          empty: 'Pas d’autres cours aujourd’hui.',
        },
        labels: {
          start: 'Début',
          end: 'Fin',
          room: 'Salle',
          subject: 'Matière',
        },
        actions: {
          dayOverview: 'Vue quotidienne',
          back: 'Retour',
        },
        progressLabel: 'Progression du cours',
        freeSlot: 'Créneau libre',
        error: 'Impossible de charger les données.',
        unauthorized:
          'Connecte-toi et assure-toi d’être affecté·e à une classe pour voir la matière actuelle.',
        featureUnavailable: 'Cette fonctionnalité n’est pas encore disponible pour ta classe.',
        classLoading: 'Chargement des classes…',
        classError: 'Impossible de charger les classes.',
        classChangeError: 'Impossible de changer de classe.',
        classRequired: 'Sélectionne une classe pour utiliser cette fonctionnalité.',
      },
      admin: {
        pageTitle: 'Tableau de bord administrateur - Homework Manager',
        noscript: 'Activez JavaScript pour accéder au tableau de bord administrateur.',
      },
      privacy: {
        pageTitle: 'Politique de confidentialité · Homework Manager',
        main: `<header class="legal-header">
      <h1 class="legal-title">Politique de confidentialité</h1>
      <p class="legal-subtitle">Comment nous traitons les données personnelles dans Homework Manager.</p>
    </header>

    <section class="legal-section">
      <h2>Responsable du traitement</h2>
      <article class="legal-card">
        <dl>
          <div>
            <dt>Nom</dt>
            <dd>Timo Wigger</dd>
          </div>
          <div>
            <dt>Projet</dt>
            <dd>Homework Manager</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd><a class="hm-footer__link" href="mailto:support@akzuwo.ch">support@akzuwo.ch</a></dd>
          </div>
          <div>
            <dt>Adresse postale</dt>
            <dd>Communiquée sur demande conformément aux exigences légales.</dd>
          </div>
        </dl>
        <p class="legal-note">Responsable du traitement au sens du RevD-DSG suisse et, le cas échéant, de l'art. 4, point 7 du RGPD.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Données que nous traitons</h2>
      <article class="legal-card">
        <p>Nous traitons uniquement les informations que vous enregistrez activement dans Homework Manager, comme les devoirs, matières, notes et événements. Des métadonnées techniques, par exemple la date de votre dernière connexion, sont conservées afin de sécuriser votre compte.</p>
        <p>Aucun service tiers de suivi ou d'analyse n'est utilisé. Vos données restent sur nos systèmes et ne sont jamais transmises à des fins publicitaires.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Cookies &amp; Web Storage</h2>
      <article class="legal-card">
        <p>Nous utilisons un cookie de session techniquement nécessaire pour vous authentifier après la connexion. Le cookie de session n'est conservé que pendant la session active et expire automatiquement lorsque vous vous déconnectez ou fermez le navigateur.</p>
        <p>Nous utilisons également <code>sessionStorage</code> pour conserver temporairement des informations telles que l'état des formulaires ou votre adresse e-mail pendant la session. Ces données restent localement dans votre navigateur et sont effacées à la fermeture de l'onglet.</p>
        <p>Nous n'utilisons aucun cookie de suivi ou d'analyse.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Finalités et bases légales</h2>
      <article class="legal-card">
        <p>Nous utilisons vos données pour fournir Homework Manager, synchroniser vos contenus et répondre aux demandes d'assistance. Le traitement repose sur notre intérêt légitime à exploiter un service fiable et, lorsqu'un compte existe, sur l'exécution d'obligations contractuelles ou précontractuelles.</p>
        <p class="legal-note">Les bases juridiques incluent l'art. 6, par. 1, lettres b et f du RGPD ainsi que les dispositions pertinentes du RevD-DSG.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Destinataires/Sous-traitants</h2>
      <article class="legal-card">
        <p>Nous faisons appel à des prestataires soigneusement sélectionnés qui traitent des données personnelles pour notre compte. Vos données restent protégées et nous concluons les accords de sous-traitance requis.</p>
        <ul>
          <li>Hébergeur web : Cloudflare.com (hébergement)</li>
          <li>Backend : Render.com (exploitation des serveurs et stockage des données)</li>
          <li>Envoi d’e‑mail : Brevo.com (messages d’assistance et système)</li>
        </ul>
        <p class="legal-note"><em>Ces informations sont fournies uniquement à des fins de transparence et ne constituent pas une promotion des prestataires.</em></p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Journaux serveur &amp; sécurité</h2>
      <article class="legal-card">
        <p>Lors de l’accès à Homework Manager, nous traitons l’adresse IP et des métadonnées de requête (p.&nbsp;ex. horodatage, URL demandée, user‑agent). Ces données sont nécessaires pour assurer le fonctionnement technique, analyser les erreurs, appliquer des limitations de débit et prévenir les abus.</p>
        <p>Les journaux serveur sont généralement conservés jusqu’à 30 jours, puis supprimés ou anonymisés, sauf si des incidents de sécurité exigent une conservation plus longue.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Transferts vers des pays tiers</h2>
      <article class="legal-card">
        <p>Aucun traitement n’a lieu en dehors de la Suisse ou de l’UE. Toutes les données sont traitées exclusivement dans l’UE ou en Suisse, et aucun transfert vers des pays tiers n’a lieu.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Conservation et sécurité</h2>
      <article class="legal-card">
        <p>Nous conservons vos données uniquement pendant la durée nécessaire à l'utilisation de Homework Manager. Si vous supprimez votre compte ou demandez l'effacement, nous supprimons les informations personnelles sauf obligations légales contraires.</p>
        <p>Des mesures de sécurité actuelles, telles que les connexions chiffrées et les contrôles d'accès basés sur les rôles, protègent vos informations contre tout accès non autorisé.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Vos droits</h2>
      <article class="legal-card">
        <p>Vous pouvez exercer à tout moment vos droits relatifs à vos données personnelles, notamment :</p>
        <ul>
          <li>obtenir l'accès aux données que nous détenons à votre sujet,</li>
          <li>corriger les informations inexactes ou incomplètes,</li>
          <li>demander l'effacement des données lorsqu'aucune obligation légale ne s'y oppose,</li>
          <li>limiter le traitement ou vous opposer à certaines utilisations,</li>
          <li>recevoir vos données dans un format structuré et couramment utilisé.</li>
        </ul>
      </article>
    </section>

    <section class="legal-section">
      <h2>Droit d’introduire une réclamation</h2>
      <article class="legal-card">
        <p>Vous avez le droit d’introduire une réclamation auprès d’une autorité de contrôle concernant le traitement de vos données personnelles. En Suisse, l’autorité compétente est le Préposé fédéral à la protection des données et à la transparence (PFPDT/EDÖB).</p>
        <p>Lorsque le RGPD s’applique, vous pouvez également déposer une réclamation auprès d’une autorité de contrôle de l’UE, notamment dans l’État membre de votre résidence habituelle, de votre lieu de travail ou du lieu de la violation présumée.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Contact confidentialité</h2>
      <article class="legal-card">
        <p>Pour toute question relative à la protection des données, contactez-nous à l'adresse indiquée ci-dessus. Merci d'ajouter « Demande de confidentialité » dans l'objet afin de faciliter le traitement de votre message.</p>
      </article>
    </section>`,
      },
      imprint: {
        pageTitle: 'Mentions légales · Homework Manager',
        main: `<header class="legal-header">
      <h1 class="legal-title">Mentions légales</h1>
      <p class="legal-subtitle">Informations légales essentielles et coordonnées pour la plateforme Homework Manager.</p>
    </header>

    <section class="legal-section">
      <h2>Responsable du contenu</h2>
      <article class="legal-card">
        <dl>
          <div>
            <dt>Nom</dt>
            <dd>Timo Wigger</dd>
          </div>
          <div>
            <dt>Projet</dt>
            <dd>Homework Manager</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd><a class="hm-footer__link" href="mailto:support@akzuwo.ch">support@akzuwo.ch</a></dd>
          </div>
          <div>
            <dt>Adresse postale</dt>
            <dd>Communiquée sur demande conformément aux exigences légales.</dd>
          </div>
        </dl>
        <p class="legal-note">Responsable du contenu selon l'art. 14, al. 1 RevD-LPD et le § 18, al. 2 du traité médiatique allemand (MStV).</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Contact</h2>
      <article class="legal-card">
        <p>Pour toute question, assistance ou remarque juridique, merci de nous écrire par e-mail. Nous répondons généralement sous deux jours ouvrables.</p>
        <p class="legal-note">Pour les demandes relatives à la protection des données, utilisez la même adresse en précisant « Protection des données » dans l'objet.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Responsabilité</h2>
      <article class="legal-card">
        <p>Nous veillons avec soin au contenu de ce site. Toutefois, nous ne pouvons garantir son exactitude permanente. En tant que prestataire de services, nous sommes responsables de nos propres contenus conformément aux lois en vigueur, sans obligation de surveiller les informations de tiers transmises ou stockées.</p>
        <p>Les obligations de suppression ou de blocage de certaines informations selon la législation restent inchangées. Une responsabilité n'est possible qu'à partir du moment où une violation concrète est portée à notre connaissance.</p>
      </article>
    </section>

    <section class="legal-section">
      <h2>Droit d'auteur</h2>
      <article class="legal-card">
        <p>Les contenus créés par l'exploitant du site sont soumis au droit d'auteur suisse. Les contributions de tiers sont signalées comme telles. Toute reproduction ou exploitation en dehors des limites du droit d'auteur nécessite l'accord écrit de l'auteur concerné.</p>
      </article>
    </section>`,
      },
    },

  };

  const FALLBACK_LOCALE = 'de';
  const LOCALE_STORAGE_KEY = 'hm.locale';
  let currentLocale = null;

  function normaliseLocale(locale) {
    if (!locale) return null;
    const lower = locale.toLowerCase();
    if (translations[lower]) return lower;
    const short = lower.split('-')[0];
    return translations[short] ? short : null;
  }

  function detectLocale() {
    return (
      normaliseLocale(document.documentElement.getAttribute('lang')) ||
      normaliseLocale(navigator.language) ||
      FALLBACK_LOCALE
    );
  }

  function readStoredLocale() {
    try {
      if (!global.localStorage) return '';
      return global.localStorage.getItem(LOCALE_STORAGE_KEY) || '';
    } catch (error) {
      return '';
    }
  }

  function getFromLocale(locale, pathParts) {
    return pathParts.reduce((acc, key) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
        return acc[key];
      }
      return undefined;
    }, translations[locale]);
  }

  function get(path, fallback) {
    if (!path) return fallback;
    const parts = path.split('.');
    const primary = getFromLocale(currentLocale, parts);
    if (primary !== undefined) {
      return primary;
    }
    if (currentLocale !== FALLBACK_LOCALE) {
      const fallbackValue = getFromLocale(FALLBACK_LOCALE, parts);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
    }
    return fallback;
  }

  function apply(root = document) {
    const scope = root instanceof Element || root instanceof DocumentFragment ? root : document;
    scope.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (!key) return;
      const fallbackText = element.hasAttribute('data-i18n-html') ? element.innerHTML : element.textContent;
      const value = get(key, fallbackText);
      if (value !== undefined && value !== null && value !== '') {
        if (element.hasAttribute('data-i18n-html')) {
          element.innerHTML = value;
        } else {
          element.textContent = value;
        }
      }
    });

    scope.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      const map = element.getAttribute('data-i18n-attr');
      if (!map) return;
      map.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':').map((item) => item && item.trim());
        if (!attr || !key) return;
        const fallbackValue = element.getAttribute(attr);
        const value = get(key, fallbackValue);
        if (value !== undefined && value !== null && value !== '') {
          element.setAttribute(attr, value);
        }
      });
    });
  }

  function setLocale(nextLocale) {
    const normalised = normaliseLocale(nextLocale) || FALLBACK_LOCALE;
    if (normalised === currentLocale) {
      return;
    }
    currentLocale = normalised;
    document.documentElement.setAttribute('lang', currentLocale);
    document.documentElement.setAttribute('data-locale', currentLocale);
    apply();
  }

  function getLocale() {
    return currentLocale;
  }

  function scope(prefix) {
    return (key, fallback) => get(prefix ? `${prefix}.${key}` : key, fallback);
  }

  currentLocale = detectLocale();
  document.documentElement.setAttribute('data-locale', currentLocale);

  global.hmI18n = {
    get,
    apply,
    setLocale,
    getLocale,
    scope,
    translations,
  };

  const storedLocale = readStoredLocale();
  if (storedLocale) {
    global.hmI18n.setLocale(storedLocale);
  }

  const applyTranslations = () => apply();

  if (document.readyState !== 'loading') {
    applyTranslations();
  } else {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  }

  window.addEventListener('hm:header-ready', (event) => {
    const header = event.detail && event.detail.header;
    if (header) {
      apply(header);
    } else {
      applyTranslations();
    }
  });
})(window);
