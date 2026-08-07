import type { LanguageCode } from "../types";

export interface Dictionary {
  locale: LanguageCode;
  landing: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    ctaStart: string;
    feature1Title: string;
    feature1Body: string;
    feature2Title: string;
    feature2Body: string;
    feature3Title: string;
    feature3Body: string;
    footerNote: string;
    madeBy: string;
    howItWorksTitle: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
    finalCtaTitle: string;
    finalCtaBody: string;
    cvisorBadge: string;
    cvisorTitle: string;
    cvisorBody: string;
    cvisorStep1Title: string;
    cvisorStep1Body: string;
    cvisorStep2Title: string;
    cvisorStep2Body: string;
    cvisorStep3Title: string;
    cvisorStep3Body: string;
  };
  nav: {
    brand: string;
    backToHome: string;
    download: string;
    downloading: string;
    downloadError: string;
    startOver: string;
    startOverConfirm: string;
  };
  sections: {
    personalInfo: string;
    summary: string;
    experience: string;
    education: string;
    skills: string;
    softSkills: string;
    languages: string;
    interests: string;
    certifications: string;
    projects: string;
    design: string;
  };
  fields: {
    fullName: string;
    jobTitle: string;
    location: string;
    summary: string;
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    current: string;
    description: string;
    degree: string;
    institution: string;
    skillName: string;
    skillLevel: string;
    softSkillName: string;
    languageName: string;
    languageLevel: string;
    interestName: string;
    certTitle: string;
    certIssuer: string;
    certDate: string;
    projectTitle: string;
    projectLink: string;
    photo: string;
    showPhoto: string;
    customLabel: string;
  };
  actions: {
    add: string;
    addLink: string;
    remove: string;
    moveUp: string;
    moveDown: string;
    dragReorder: string;
    uploadPhoto: string;
    removePhoto: string;
    chooseColor: string;
    customColor: string;
  };
  placeholders: {
    fullName: string;
    jobTitle: string;
    location: string;
    summary: string;
    role: string;
    company: string;
    experienceDescription: string;
    degree: string;
    institution: string;
    educationDescription: string;
    skillName: string;
    softSkillName: string;
    languageName: string;
    interestName: string;
    certTitle: string;
    certIssuer: string;
    projectTitle: string;
    projectLink: string;
    projectDescription: string;
    present: string;
    customLabel: string;
  };
  contactTypes: {
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    x: string;
    custom: string;
  };
  contactPlaceholders: {
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    x: string;
    custom: string;
  };
  richText: {
    bold: string;
    italic: string;
    underline: string;
    bulletList: string;
  };
  pagination: {
    page: string;
    previousPage: string;
    nextPage: string;
  };
  dateValidation: {
    endNotBeforeStart: string;
  };
  appearance: {
    density: string;
    densityCompact: string;
    densityComfortable: string;
    densitySpacious: string;
    fontFamily: string;
    fontSans: string;
    fontSerif: string;
    fontCondensed: string;
  };
  sectionOrder: {
    title: string;
    sidebarTitle: string;
    mainTitle: string;
  };
  languageLevels: string[];
  cvisor: {
    brand: string;
    openButton: string;
    tryButton: string;
    modalTitle: string;
    modalIntro: string;
    jobAdLabel: string;
    jobAdPlaceholder: string;
    quickIntro: string;
    quickNoteExperiencePlaceholder: string;
    quickNoteEducationPlaceholder: string;
    quickNoteProjectPlaceholder: string;
    skillsQuickPlaceholder: string;
    languagesQuickPlaceholder: string;
    extraNotesLabel: string;
    extraNotesPlaceholder: string;
    generateButton: string;
    generating: string;
    reviewTitle: string;
    reviewNote: string;
    applyButton: string;
    cancelButton: string;
    close: string;
    backButton: string;
    continueButton: string;
    generateSuggestionsButton: string;
    regenerateButton: string;
    stepJobAdTitle: string;
    stepFactsTitle: string;
    stepSuggestionsTitle: string;
    suggestedJobTitleLabel: string;
    applyJobTitleLabel: string;
    suggestedSkillsTitle: string;
    suggestedSoftSkillsTitle: string;
    suggestedInterestsTitle: string;
    noSuggestionsHint: string;
    themeSectionTitle: string;
    applyColorLabel: string;
    editElsewhereNote: string;
    experienceTipsHint: string;
    educationTipsHint: string;
    keepSummaryLabel: string;
    ownSkillsTitle: string;
    relevantBadge: string;
    notRelevantBadge: string;
    privacyNote: string;
    errorMissingFields: string;
    errorTooLong: string;
    errorRateLimited: string;
    errorRefused: string;
    errorGeneric: string;
    improveButton: string;
    improving: string;
    suggestionTitle: string;
    acceptSuggestion: string;
    discardSuggestion: string;
  };
  emptyStates: {
    experience: string;
    education: string;
    skills: string;
    softSkills: string;
    languages: string;
    interests: string;
    certifications: string;
    projects: string;
    contacts: string;
  };
}

export const dictionaries: Record<LanguageCode, Dictionary> = {
  el: {
    locale: "el",
    landing: {
      badge: "100% δωρεάν · χωρίς λογαριασμό",
      title: "Φτιάξε το βιογραφικό σου",
      titleHighlight: "σε λίγα λεπτά",
      subtitle:
        "Το CVsible σε βοηθά να δημιουργήσεις ένα καθαρό, επαγγελματικό βιογραφικό με ζωντανή προεπισκόπηση, έτοιμο για λήψη σε PDF.",
      ctaStart: "Ξεκίνα τώρα",
      feature1Title: "Ζωντανή προεπισκόπηση",
      feature1Body: "Βλέπεις το βιογραφικό σου να ενημερώνεται καθώς γράφεις.",
      feature2Title: "Πλήρης προσαρμογή",
      feature2Body: "Διάλεξε το χρώμα της πλαϊνής στήλης και κάνε το δικό σου.",
      feature3Title: "Λήψη σε PDF",
      feature3Body: "Κατέβασέ το έτοιμο για αποστολή, χωρίς εγγραφή ή κόστος.",
      footerNote: "Τα δεδομένα σου αποθηκεύονται μόνο στη συσκευή σου.",
      madeBy: "Δημιουργήθηκε από",
      howItWorksTitle: "Πώς λειτουργεί",
      step1Title: "Συμπλήρωσε τα στοιχεία σου",
      step1Body: "Προσωπικά στοιχεία, εμπειρία, εκπαίδευση, δεξιότητες — όσα θες, όποτε θες.",
      step2Title: "Κάν' το δικό σου",
      step2Body: "Διάλεξε χρώμα για την πλαϊνή στήλη και βάλε ή αφαίρεσε τη φωτογραφία σου.",
      step3Title: "Κατέβασέ το σε PDF",
      step3Body: "Έτοιμο για αποστολή σε αγγελίες και recruiters, χωρίς υδατογράφημα.",
      finalCtaTitle: "Έτοιμος να ξεκινήσεις;",
      finalCtaBody: "Δεν χρειάζεται λογαριασμός. Το πρώτο σου βιογραφικό είναι λίγα λεπτά μακριά.",
      cvisorBadge: "Νέο · με τεχνητή νοημοσύνη",
      cvisorTitle: "Δεν ξέρεις πώς να ξεκινήσεις; Άσε τον CVisor να σε βοηθήσει.",
      cvisorBody:
        "Ο CVisor είναι ένας ενσωματωμένος βοηθός που φτιάχνει προσχέδιο του βιογραφικού σου προσαρμοσμένο σε μια αγγελία εργασίας (ή απλά στον στόχο σου). Δουλεύει αποκλειστικά με ό,τι του πεις — ποτέ δεν εφευρίσκει εμπειρία που δεν έχεις — και εσύ εγκρίνεις κάθε πρόταση, ακόμα και σε επίπεδο μεμονωμένης πρότασης, πριν εφαρμοστεί οτιδήποτε.",
      cvisorStep1Title: "Πες του τον στόχο σου",
      cvisorStep1Body: "Επικόλλησε μια αγγελία εργασίας ή περίγραψε τι δουλειά ψάχνεις.",
      cvisorStep2Title: "Δώσε σύντομα στοιχεία",
      cvisorStep2Body: "Λίγες λέξεις-κλειδιά για την εμπειρία, τις σπουδές και τις δεξιότητές σου αρκούν.",
      cvisorStep3Title: "Έγκρινε τις προτάσεις",
      cvisorStep3Body: "Δες τι πρότεινε ο CVisor και διάλεξε τι θα κρατήσεις πριν εφαρμοστεί στο βιογραφικό σου.",
    },
    nav: {
      brand: "CVsible",
      backToHome: "Αρχική",
      download: "Λήψη PDF",
      downloading: "Προετοιμασία…",
      downloadError: "Κάτι πήγε στραβά με τη λήψη του PDF. Δοκίμασε ξανά.",
      startOver: "Νέο βιογραφικό",
      startOverConfirm: "Θα σβηστούν όλα τα στοιχεία που έχεις συμπληρώσει. Συνέχεια;",
    },
    sections: {
      personalInfo: "Προσωπικά στοιχεία",
      summary: "Επαγγελματικό προφίλ",
      experience: "Εργασιακή εμπειρία",
      education: "Εκπαίδευση",
      skills: "Δεξιότητες",
      softSkills: "Ήπιες δεξιότητες",
      languages: "Γλώσσες",
      interests: "Ενδιαφέροντα",
      certifications: "Πιστοποιήσεις",
      projects: "Έργα",
      design: "Εμφάνιση",
    },
    fields: {
      fullName: "Ονοματεπώνυμο",
      jobTitle: "Επαγγελματικός τίτλος",
      location: "Τοποθεσία",
      summary: "Σύνοψη",
      role: "Θέση",
      company: "Εταιρεία",
      startDate: "Έναρξη",
      endDate: "Λήξη",
      current: "Τρέχουσα",
      description: "Περιγραφή",
      degree: "Τίτλος σπουδών",
      institution: "Ίδρυμα",
      skillName: "Δεξιότητα",
      skillLevel: "Επίπεδο",
      softSkillName: "Ήπια δεξιότητα",
      languageName: "Γλώσσα",
      languageLevel: "Επίπεδο",
      interestName: "Ενδιαφέρον",
      certTitle: "Τίτλος",
      certIssuer: "Φορέας",
      certDate: "Ημερομηνία",
      projectTitle: "Τίτλος έργου",
      projectLink: "Σύνδεσμος",
      photo: "Φωτογραφία",
      showPhoto: "Εμφάνιση φωτογραφίας στο βιογραφικό",
      customLabel: "Ετικέτα",
    },
    actions: {
      add: "Προσθήκη",
      addLink: "Προσθήκη συνδέσμου",
      remove: "Αφαίρεση",
      moveUp: "Μετακίνηση πάνω",
      moveDown: "Μετακίνηση κάτω",
      dragReorder: "Σύρε για αναδιάταξη",
      uploadPhoto: "Ανέβασμα φωτογραφίας",
      removePhoto: "Αφαίρεση φωτογραφίας",
      chooseColor: "Χρώμα στήλης",
      customColor: "Προσαρμοσμένο",
    },
    placeholders: {
      fullName: "Μαρία Παπαδοπούλου",
      jobTitle: "Product Designer",
      location: "Αθήνα, Ελλάδα",
      summary:
        "Σύντομη περιγραφή της επαγγελματικής σου ταυτότητας και των δυνατών σου σημείων.",
      role: "Τίτλος θέσης",
      company: "Όνομα εταιρείας",
      experienceDescription: "Τι έκανες, τι πέτυχες, με ποια αποτελέσματα.",
      degree: "π.χ. Πτυχίο Πληροφορικής",
      institution: "Όνομα ιδρύματος",
      educationDescription: "Προαιρετικές λεπτομέρειες, βαθμός, διπλωματική.",
      skillName: "π.χ. Figma",
      softSkillName: "π.χ. Ομαδικότητα",
      languageName: "π.χ. Αγγλικά",
      interestName: "π.χ. Φωτογραφία",
      certTitle: "π.χ. AWS Certified",
      certIssuer: "Φορέας πιστοποίησης",
      projectTitle: "Όνομα έργου",
      projectLink: "example.com",
      projectDescription: "Σύντομη περιγραφή του έργου.",
      present: "Σήμερα",
      customLabel: "π.χ. Behance",
    },
    contactTypes: {
      email: "Email",
      phone: "Τηλέφωνο",
      location: "Τοποθεσία",
      website: "Ιστοσελίδα",
      linkedin: "LinkedIn",
      github: "GitHub",
      x: "X (Twitter)",
      custom: "Προσαρμοσμένο",
    },
    contactPlaceholders: {
      email: "maria@example.com",
      phone: "+30 69X XXX XXXX",
      location: "Αθήνα, Ελλάδα",
      website: "portfolio.gr",
      linkedin: "linkedin.com/in/maria",
      github: "github.com/maria",
      x: "x.com/maria",
      custom: "example.com/maria",
    },
    richText: {
      bold: "Έντονα",
      italic: "Πλάγια",
      underline: "Υπογράμμιση",
      bulletList: "Λίστα με κουκκίδες",
    },
    pagination: {
      page: "Σελίδα",
      previousPage: "Προηγούμενη σελίδα",
      nextPage: "Επόμενη σελίδα",
    },
    dateValidation: {
      endNotBeforeStart: "Η ημερομηνία λήξης δεν μπορεί να είναι πριν την έναρξη.",
    },
    appearance: {
      density: "Πυκνότητα διάταξης",
      densityCompact: "Συμπαγής",
      densityComfortable: "Κανονική",
      densitySpacious: "Άνετη",
      fontFamily: "Γραμματοσειρά",
      fontSans: "Μοντέρνα",
      fontSerif: "Κλασική",
      fontCondensed: "Συμπυκνωμένη",
    },
    sectionOrder: {
      title: "Σειρά ενοτήτων",
      sidebarTitle: "Πλαϊνή στήλη",
      mainTitle: "Κύρια στήλη",
    },
    languageLevels: [
      "Βασικό",
      "Μέτριο",
      "Καλό",
      "Πολύ καλό",
      "Άριστο",
      "Μητρική γλώσσα",
    ],
    cvisor: {
      brand: "CVisor",
      openButton: "Δημιουργία με τον CVisor",
      tryButton: "Δοκίμασε με τον CVisor",
      modalTitle: "Δημιουργία βιογραφικού με τον CVisor",
      modalIntro:
        "Επικόλλησε μια αγγελία εργασίας — ή απλά περίγραψε τι δουλειά ψάχνεις — και πες ελεύθερα την εμπειρία, την εκπαίδευση και τις δεξιότητές σου. Ο CVisor θα προτείνει περιεχόμενο για το βιογραφικό σου, βασισμένο αποκλειστικά σε όσα του πεις — ποτέ εφευρήματα.",
      jobAdLabel: "Αγγελία εργασίας ή στόχος",
      jobAdPlaceholder: "Επικόλλησε μια αγγελία εργασίας, ή γράψε π.χ. «Θέλω να βρω δουλειά ως…»",
      quickIntro:
        "Δεν χρειάζεται να γράψεις εκτενή κείμενα — αρκούν σύντομες λέξεις-κλειδιά ή σημειώσεις σε κάθε πεδίο. Ο CVisor θα τα διατυπώσει σε πλήρεις, επαγγελματικές προτάσεις.",
      quickNoteExperiencePlaceholder: "π.χ. διαχειριζόμουν την ομάδα πωλήσεων, αύξηση πωλήσεων 20%…",
      quickNoteEducationPlaceholder: "π.χ. βαθμός, διπλωματική εργασία, μαθήματα…",
      quickNoteProjectPlaceholder: "π.χ. τι έκανε το έργο, ποιες τεχνολογίες χρησιμοποίησες…",
      skillsQuickPlaceholder: "Γράψε ή επικόλλησε (π.χ. απευθείας από LinkedIn) — Python, Figma, Διαχείριση έργων…",
      languagesQuickPlaceholder: "π.χ. Αγγλικά (πολύ καλά), Γαλλικά (βασικά)",
      extraNotesLabel: "Κάτι άλλο να προσθέσεις;",
      extraNotesPlaceholder: "Ήπιες δεξιότητες, ενδιαφέροντα, ή οτιδήποτε άλλο θες να συμπεριληφθεί.",
      backButton: "Πίσω",
      continueButton: "Συνέχεια",
      generateSuggestionsButton: "Δημιουργία προτάσεων",
      regenerateButton: "Νέες προτάσεις",
      stepJobAdTitle: "Στόχος",
      stepFactsTitle: "Στοιχεία",
      stepSuggestionsTitle: "Προτάσεις",
      suggestedJobTitleLabel: "Προτεινόμενος επαγγελματικός τίτλος",
      applyJobTitleLabel: "Εφαρμογή τίτλου",
      suggestedSkillsTitle: "Επιπλέον δεξιότητες",
      suggestedSoftSkillsTitle: "Επιπλέον ήπιες δεξιότητες",
      suggestedInterestsTitle: "Προτεινόμενα ενδιαφέροντα",
      noSuggestionsHint: "Δεν υπάρχουν επιπλέον προτάσεις αυτή τη φορά.",
      themeSectionTitle: "Προτεινόμενο χρώμα",
      applyColorLabel: "Εφαρμογή χρώματος",
      editElsewhereNote:
        "Θες να αλλάξεις τη σειρά των ενοτήτων, τα χρώματα ή κάτι άλλο; Μπορείς πάντα να το προσαρμόσεις ελεύθερα από τις κανονικές φόρμες του βιογραφικού σου.",
      experienceTipsHint: "Δεν πρόσθεσες εργασιακή εμπειρία — μερικές ιδέες:",
      educationTipsHint: "Δεν πρόσθεσες εκπαίδευση — μερικές ιδέες:",
      keepSummaryLabel: "Κράτησε αυτή τη σύνοψη στις επόμενες προτάσεις",
      ownSkillsTitle: "Οι δεξιότητές σου",
      relevantBadge: "Ταιριάζει με την αγγελία",
      notRelevantBadge: "Ίσως δεν ταιριάζει με την αγγελία — θες να την αφαιρέσεις;",
      generateButton: "Δημιουργία με CVisor",
      generating: "Ο CVisor σκέφτεται…",
      reviewTitle: "Έλεγξε πριν εφαρμόσεις",
      reviewNote:
        "Ο CVisor βασίστηκε αποκλειστικά σε όσα έγραψες. Η εφαρμογή θα αντικαταστήσει το επαγγελματικό προφίλ και τις ενότητες εμπειρίας, εκπαίδευσης, δεξιοτήτων, γλωσσών, πιστοποιήσεων και έργων.",
      applyButton: "Εφαρμογή στο βιογραφικό",
      cancelButton: "Άκυρο",
      close: "Κλείσιμο",
      privacyNote:
        "Το κείμενο που γράφεις εδώ στέλνεται στην Anthropic για επεξεργασία· δεν αποθηκεύεται σε server του CVsible.",
      errorMissingFields: "Συμπλήρωσε και τα δύο πεδία πριν συνεχίσεις.",
      errorTooLong: "Το κείμενο είναι πολύ μεγάλο — προσπάθησε να το συντομέψεις.",
      errorRateLimited: "Έφτασες το ημερήσιο όριο χρήσης του CVisor. Δοκίμασε ξανά αύριο.",
      errorRefused: "Ο CVisor δεν μπόρεσε να επεξεργαστεί αυτό το κείμενο. Δοκίμασε διαφορετική διατύπωση.",
      errorGeneric: "Κάτι πήγε στραβά. Δοκίμασε ξανά σε λίγο.",
      improveButton: "Βελτίωση με CVisor",
      improving: "Βελτίωση…",
      suggestionTitle: "Πρόταση του CVisor",
      acceptSuggestion: "Χρήση αυτής της εκδοχής",
      discardSuggestion: "Απόρριψη",
    },
    emptyStates: {
      experience: "Δεν έχεις προσθέσει ακόμα εργασιακή εμπειρία.",
      education: "Δεν έχεις προσθέσει ακόμα εκπαίδευση.",
      skills: "Δεν έχεις προσθέσει ακόμα δεξιότητες.",
      softSkills: "Δεν έχεις προσθέσει ακόμα ήπιες δεξιότητες.",
      languages: "Δεν έχεις προσθέσει ακόμα γλώσσες.",
      interests: "Δεν έχεις προσθέσει ακόμα ενδιαφέροντα.",
      certifications: "Δεν έχεις προσθέσει ακόμα πιστοποιήσεις.",
      projects: "Δεν έχεις προσθέσει ακόμα έργα.",
      contacts: "Δεν έχεις προσθέσει ακόμα στοιχεία επικοινωνίας.",
    },
  },
  en: {
    locale: "en",
    landing: {
      badge: "100% free · no account needed",
      title: "Build your resume",
      titleHighlight: "in minutes",
      subtitle:
        "CVsible helps you create a clean, professional resume with a live preview, ready to download as a PDF.",
      ctaStart: "Get started",
      feature1Title: "Live preview",
      feature1Body: "Watch your resume update as you type.",
      feature2Title: "Full customization",
      feature2Body: "Pick the color of your sidebar and make it yours.",
      feature3Title: "Download as PDF",
      feature3Body: "Get it ready to send, no sign-up or cost.",
      footerNote: "Your data is stored only on your device.",
      madeBy: "Made by",
      howItWorksTitle: "How it works",
      step1Title: "Fill in your details",
      step1Body: "Personal info, experience, education, skills — as much or as little as you want.",
      step2Title: "Make it yours",
      step2Body: "Pick a sidebar color and add or remove your photo.",
      step3Title: "Download the PDF",
      step3Body: "Ready to send to job postings and recruiters, no watermark.",
      finalCtaTitle: "Ready to get started?",
      finalCtaBody: "No account needed. Your first resume is minutes away.",
      cvisorBadge: "New · AI-powered",
      cvisorTitle: "Not sure where to start? Let CVisor help.",
      cvisorBody:
        "CVisor is a built-in assistant that drafts your resume tailored to a job posting (or just your career goal). It works only from what you tell it — it never invents experience you don't have — and you approve every suggestion, down to individual sentences, before anything is applied.",
      cvisorStep1Title: "Tell it your goal",
      cvisorStep1Body: "Paste a job posting, or describe what job you're looking for.",
      cvisorStep2Title: "Give quick facts",
      cvisorStep2Body: "A few keywords about your experience, education and skills are enough.",
      cvisorStep3Title: "Approve the suggestions",
      cvisorStep3Body: "Review what CVisor drafted and pick what to keep before it's applied to your resume.",
    },
    nav: {
      brand: "CVsible",
      backToHome: "Home",
      download: "Download PDF",
      downloading: "Preparing…",
      downloadError: "Something went wrong while creating the PDF. Please try again.",
      startOver: "New resume",
      startOverConfirm: "This will clear everything you've entered. Continue?",
    },
    sections: {
      personalInfo: "Personal info",
      summary: "Professional summary",
      experience: "Work experience",
      education: "Education",
      skills: "Skills",
      softSkills: "Soft skills",
      languages: "Languages",
      interests: "Interests",
      certifications: "Certifications",
      projects: "Projects",
      design: "Appearance",
    },
    fields: {
      fullName: "Full name",
      jobTitle: "Job title",
      location: "Location",
      summary: "Summary",
      role: "Role",
      company: "Company",
      startDate: "Start date",
      endDate: "End date",
      current: "Current",
      description: "Description",
      degree: "Degree",
      institution: "Institution",
      skillName: "Skill",
      skillLevel: "Level",
      softSkillName: "Soft skill",
      languageName: "Language",
      languageLevel: "Level",
      interestName: "Interest",
      certTitle: "Title",
      certIssuer: "Issuer",
      certDate: "Date",
      projectTitle: "Project title",
      projectLink: "Link",
      photo: "Photo",
      showPhoto: "Show photo on resume",
      customLabel: "Label",
    },
    actions: {
      add: "Add",
      addLink: "Add link",
      remove: "Remove",
      moveUp: "Move up",
      moveDown: "Move down",
      dragReorder: "Drag to reorder",
      uploadPhoto: "Upload photo",
      removePhoto: "Remove photo",
      chooseColor: "Sidebar color",
      customColor: "Custom",
    },
    placeholders: {
      fullName: "Jane Doe",
      jobTitle: "Product Designer",
      location: "New York, USA",
      summary: "A short summary of your professional identity and strengths.",
      role: "Job title",
      company: "Company name",
      experienceDescription: "What you did, what you achieved, the results.",
      degree: "e.g. BSc in Computer Science",
      institution: "Institution name",
      educationDescription: "Optional details, GPA, thesis.",
      skillName: "e.g. Figma",
      softSkillName: "e.g. Teamwork",
      languageName: "e.g. English",
      interestName: "e.g. Photography",
      certTitle: "e.g. AWS Certified",
      certIssuer: "Issuing organization",
      projectTitle: "Project name",
      projectLink: "example.com",
      projectDescription: "Short description of the project.",
      present: "Present",
      customLabel: "e.g. Behance",
    },
    contactTypes: {
      email: "Email",
      phone: "Phone",
      location: "Location",
      website: "Website",
      linkedin: "LinkedIn",
      github: "GitHub",
      x: "X (Twitter)",
      custom: "Custom",
    },
    contactPlaceholders: {
      email: "jane@example.com",
      phone: "+1 555 123 4567",
      location: "New York, USA",
      website: "portfolio.com",
      linkedin: "linkedin.com/in/jane",
      github: "github.com/jane",
      x: "x.com/jane",
      custom: "example.com/jane",
    },
    richText: {
      bold: "Bold",
      italic: "Italic",
      underline: "Underline",
      bulletList: "Bullet list",
    },
    pagination: {
      page: "Page",
      previousPage: "Previous page",
      nextPage: "Next page",
    },
    dateValidation: {
      endNotBeforeStart: "The end date can't be earlier than the start date.",
    },
    appearance: {
      density: "Layout density",
      densityCompact: "Compact",
      densityComfortable: "Comfortable",
      densitySpacious: "Spacious",
      fontFamily: "Font",
      fontSans: "Modern",
      fontSerif: "Classic",
      fontCondensed: "Condensed",
    },
    sectionOrder: {
      title: "Section order",
      sidebarTitle: "Sidebar",
      mainTitle: "Main column",
    },
    languageLevels: [
      "Basic",
      "Intermediate",
      "Good",
      "Fluent",
      "Excellent",
      "Native",
    ],
    cvisor: {
      brand: "CVisor",
      openButton: "Create with CVisor",
      tryButton: "Try CVisor",
      modalTitle: "Build your resume with CVisor",
      modalIntro:
        "Paste a job posting — or just describe what job you're looking for — and freely share your experience, education and skills. CVisor will suggest resume content tailored to it — based only on what you tell it, never invented.",
      jobAdLabel: "Job posting or goal",
      jobAdPlaceholder: "Paste a job posting, or write e.g. \"I'm looking for a job as…\"",
      quickIntro:
        "No need to write full paragraphs — short keywords or notes in each field are enough. CVisor will turn them into complete, professional sentences.",
      quickNoteExperiencePlaceholder: "e.g. managed the sales team, grew sales by 20%…",
      quickNoteEducationPlaceholder: "e.g. GPA, thesis, coursework…",
      quickNoteProjectPlaceholder: "e.g. what the project did, which technologies you used…",
      skillsQuickPlaceholder: "Type or paste (e.g. straight from LinkedIn) — Python, Figma, Project management…",
      languagesQuickPlaceholder: "e.g. English (fluent), French (basic)",
      extraNotesLabel: "Anything else to add?",
      extraNotesPlaceholder: "Soft skills, interests, or anything else you'd like included.",
      backButton: "Back",
      continueButton: "Continue",
      generateSuggestionsButton: "Generate suggestions",
      regenerateButton: "New suggestions",
      stepJobAdTitle: "Goal",
      stepFactsTitle: "Quick facts",
      stepSuggestionsTitle: "Suggestions",
      suggestedJobTitleLabel: "Suggested job title",
      applyJobTitleLabel: "Apply title",
      suggestedSkillsTitle: "Additional skills",
      suggestedSoftSkillsTitle: "Additional soft skills",
      suggestedInterestsTitle: "Suggested interests",
      noSuggestionsHint: "No additional suggestions this time.",
      themeSectionTitle: "Suggested color",
      applyColorLabel: "Apply color",
      editElsewhereNote:
        "Want to change the section order, colors, or anything else? You can always adjust that freely from your resume's regular forms.",
      experienceTipsHint: "You haven't added any work experience — a few ideas:",
      educationTipsHint: "You haven't added any education — a few ideas:",
      keepSummaryLabel: "Keep this summary for future suggestions",
      ownSkillsTitle: "Your skills",
      relevantBadge: "Matches the posting",
      notRelevantBadge: "May not match the posting — remove it?",
      generateButton: "Generate with CVisor",
      generating: "CVisor is thinking…",
      reviewTitle: "Review before applying",
      reviewNote:
        "CVisor worked only from what you wrote. Applying will replace your professional summary and the experience, education, skills, languages, certifications and projects sections.",
      applyButton: "Apply to resume",
      cancelButton: "Cancel",
      close: "Close",
      privacyNote: "The text you write here is sent to Anthropic for processing; it isn't stored on a CVsible server.",
      errorMissingFields: "Fill in both fields before continuing.",
      errorTooLong: "That text is too long — try shortening it.",
      errorRateLimited: "You've reached CVisor's daily usage limit. Try again tomorrow.",
      errorRefused: "CVisor couldn't process that text. Try rephrasing it.",
      errorGeneric: "Something went wrong. Please try again shortly.",
      improveButton: "Improve with CVisor",
      improving: "Improving…",
      suggestionTitle: "CVisor's suggestion",
      acceptSuggestion: "Use this version",
      discardSuggestion: "Discard",
    },
    emptyStates: {
      experience: "You haven't added any work experience yet.",
      education: "You haven't added any education yet.",
      skills: "You haven't added any skills yet.",
      softSkills: "You haven't added any soft skills yet.",
      languages: "You haven't added any languages yet.",
      interests: "You haven't added any interests yet.",
      certifications: "You haven't added any certifications yet.",
      projects: "You haven't added any projects yet.",
      contacts: "You haven't added any contact links yet.",
    },
  },
};
