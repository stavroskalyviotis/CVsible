import type { LanguageCode } from "../types";
import type { AtsCheckId } from "../ats/analyze";
import type { ProfileCheckKey } from "../profile/completeness";

type AtsCheckKey = AtsCheckId;

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
    pathManualLabel: string;
    featuresTitle: string;
    featuresSubtitle: string;
    features: { icon: string; title: string; body: string }[];
    featuresMore: string;
    featuresLess: string;
    scanBadge: string;
    scanTitle: string;
    scanBody: string;
    scanCta: string;
  };
  nav: {
    brand: string;
    backToHome: string;
    download: string;
    downloading: string;
    downloadError: string;
    startOver: string;
    startOverConfirm: string;
    menu: string;
    exportJson: string;
    importJson: string;
    importConfirm: string;
    importError: string;
    importSuccess: string;
    saveToCloud: string;
    savingToCloud: string;
    savedToCloud: string;
    saveToCloudError: string;
    saveToCloudPromptTitle: string;
    cloudLimitReached: string;
    undo: string;
    redo: string;
  };
  siteNav: {
    home: string;
    build: string;
    scan: string;
    cvisor: string;
    features: string;
    openMenu: string;
    myCvs: string;
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
    dateOfBirth: string;
    role: string;
    company: string;
    startDate: string;
    endDate: string;
    current: string;
    expectedGraduation: string;
    description: string;
    degree: string;
    institution: string;
    skillName: string;
    skillCategory: string;
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
    contactType: string;
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
    dragToReposition: string;
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
    skillCategory: string;
    softSkillName: string;
    languageName: string;
    interestName: string;
    certTitle: string;
    certIssuer: string;
    projectTitle: string;
    projectLink: string;
    projectDescription: string;
    present: string;
    expectedPrefix: string;
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
  /** Headings used by the ATS-safe templates. These are the exact wordings
   *  resume parsers are trained to recognise, so they never get localised
   *  creatively. */
  atsSections: {
    summary: string;
    experience: string;
    education: string;
    skills: string;
    softSkills: string;
    languages: string;
    interests: string;
    certifications: string;
    projects: string;
  };
  pagination: {
    page: string;
    previousPage: string;
    nextPage: string;
    continued: string;
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
    skillLevel: string;
    skillLevelText: string;
    skillLevelNone: string;
  };
  templates: {
    title: string;
    atsBadge: string;
    photoUnsupported: string;
    aurora: { name: string; description: string };
    meridian: { name: string; description: string };
    atlas: { name: string; description: string };
    compass: { name: string; description: string };
  };
  sectionOrder: {
    title: string;
    hint: string;
    sidebarHint: string;
  };
  languageLevels: string[];
  /** Four buckets, lowest to highest, used to word a skill level as text. */
  skillLevels: [string, string, string, string];
  /** Explains what filling in a category does to the printed section. */
  skillCategoryHint: string;
  ats: {
    navLabel: string;
    title: string;
    subtitle: string;
    verdictPassHint: string;
    verdictFailHint: string;
    formatIssue: string;
    axisFormat: string;
    axisFormatHint: string;
    axisContent: string;
    axisContentHint: string;
    axisMatch: string;
    axisMatchHint: string;
    axisMatchNone: string;
    verdictPass: string;
    verdictFail: string;
    bandExcellent: string;
    bandGood: string;
    bandFair: string;
    bandPoor: string;
    dropTitle: string;
    dropHint: string;
    dropActive: string;
    browse: string;
    supported: string;
    privacy: string;
    useMyCv: string;
    useMyCvHint: string;
    orUpload: string;
    analyzing: string;
    changeFile: string;
    jobAdLabel: string;
    jobAdPlaceholder: string;
    jobAdHint: string;
    sourceUploaded: string;
    sourceBuilder: string;
    checksTitle: string;
    blocking: string;
    warnings: string;
    passing: string;
    notEvaluatedGroupTitle: string;
    notEvaluated: string;
    parsedTitle: string;
    parsedHint: string;
    parsedName: string;
    parsedEmail: string;
    parsedPhone: string;
    parsedLinks: string;
    parsedDates: string;
    parsedSections: string;
    notFound: string;
    documentTitle: string;
    docPages: string;
    docWords: string;
    docCharacters: string;
    docType: string;
    docSize: string;
    docColumns: string;
    docImages: string;
    docFonts: string;
    docMetaTitle: string;
    docMetaAuthor: string;
    docProducer: string;
    docTextLayer: string;
    yes: string;
    no: string;
    textTitle: string;
    textHint: string;
    pageLabel: string;
    copyText: string;
    copied: string;
    keywordsTitle: string;
    keywordsCovered: string;
    keywordsMissing: string;
    noJobAd: string;
    fixCtaTitle: string;
    fixCtaBody: string;
    fixCtaButton: string;
    buildTitle: string;
    buildBody: string;
    buildButton: string;
    errorUnsupported: string;
    errorTooLarge: string;
    errorUnreadable: string;
    checks: Record<AtsCheckKey, { label: string; ok: string; bad: string }>;
  };
  /** The conversational intake. Separate from `cvisor`, which is the wording
   *  shared with the inline "improve this text" buttons. */
  /** The two-level picker that fills the CVisor interview from the profile. */
  profileFill: {
    title: string;
    intro: string;
    back: string;
    cancel: string;
    save: string;
    selectAll: string;
    selectNone: string;
    /** "{0}" chosen, "{1}" available. */
    chosenOf: string;
    /** "{0}" is how many entries were chosen in total. */
    fill: string;
    fillNone: string;
  };
  charCounter: {
    /** "{0}" is how many characters over the limit. */
    tooLong: string;
  };
  cvisorChat: {
    title: string;
    intro: string;
    yes: string;
    no: string;
    back: string;
    skip: string;
    next: string;
    thinking: string;
    answerLabel: string;
    followUpPlaceholder: string;
    thisJob: string;
    targetPrompt: string;
    targetHint: string;
    targetLabel: string;
    targetPlaceholder: string;
    firstRolePrompt: string;
    firstRoleHint: string;
    nextRolePrompt: string;
    roleLabel: string;
    rolePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    periodLabel: string;
    periodPlaceholder: string;
    /** "{0}" is the job title the candidate just gave. */
    storyPrompt: string;
    storyHint: string;
    storyLabel: string;
    storyPlaceholder: string;
    moreRolesPrompt: string;
    firstSchoolPrompt: string;
    firstSchoolHint: string;
    nextSchoolPrompt: string;
    degreeLabel: string;
    degreePlaceholder: string;
    institutionLabel: string;
    institutionPlaceholder: string;
    moreSchoolsPrompt: string;
    skillsPrompt: string;
    skillsHint: string;
    skillsLabel: string;
    skillsPlaceholder: string;
    languagesPrompt: string;
    languagesHint: string;
    languagesLabel: string;
    languagesPlaceholder: string;
    extrasPrompt: string;
    extrasHint: string;
    extrasLabel: string;
    extrasPlaceholder: string;
    groupTarget: string;
    groupExperience: string;
    groupEducation: string;
    groupSkills: string;
    groupExtras: string;
    previewTitle: string;
    previewEmpty: string;
    pendingTitle: string;
    readyTitle: string;
    readyBody: string;
    buildButton: string;
    reviewAnswers: string;
    notEnough: string;
    restart: string;
    restartConfirm: string;
    replaceConfirm: string;
    importProfile: string;
    importProfileHint: string;
    importChoose: string;
    /** "{0}" is how many answers the import filled in. */
    importedProfile: string;
    importedProfileHint: string;
    /** Labels prefixed onto the source material handed to the agent. */
    sourceJob: string;
    sourceStudy: string;
    sourceSkills: string;
    sourceLanguages: string;
    sourceExtras: string;
  };
  cvisor: {
    brand: string;
    tryButton: string;
    openButton: string;
    improveButton: string;
    improving: string;
    suggestionTitle: string;
    acceptSuggestion: string;
    discardSuggestion: string;
    regenerateSuggestion: string;
    generateButton: string;
    generating: string;
    errorMissingFields: string;
    errorTooLong: string;
    errorRateLimited: string;
    errorRateLimitedInHours: string;
    errorRateLimitedInOneHour: string;
    errorRefused: string;
    errorUnavailable: string;
    errorGeneric: string;
    title: string;
    runningTitle: string;
    runningSteps: string[];
    verified: string;
    verifiedHint: string;
    unverified: string;
    unverifiedHint: string;
    fabricationTitle: string;
    fabricationHint: string;
    /** "{0}" is how many checks the draft still fails. */
    blockingLeft: string;
    changesTitle: string;
    apply: string;
    back: string;
    close: string;
    retry: string;
  };
  cvfix: {
    badge: string;
    title: string;
    body: string;
    button: string;
    running: string;
    runningRound: string;
    cancel: string;
    /* --- the change-review window --- */
    windowTitle: string;
    windowIntro: string;
    scanning: string;
    reviewHint: string;
    noChangesTitle: string;
    noChangesBody: string;
    before: string;
    after: string;
    addition: string;
    accept: string;
    accepted: string;
    skip: string;
    skipped: string;
    acceptAll: string;
    /** "{0}" is the number of accepted changes. */
    applyCount: string;
    applyOne: string;
    applyNone: string;
    close: string;
    metricVerbs: string;
    metricCoverage: string;
    metricBullets: string;
    toolbarButton: string;
    targetLabel: string;
    targetPlaceholder: string;
    targetNone: string;
    targetSet: string;
    targetAdd: string;
    targetChange: string;
    rerun: string;
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
  skillSuggestions: {
    label: string;
  };
  auth: {
    signIn: string;
    signingIn: string;
    signOut: string;
    deleteAccount: string;
    deleteAccountConfirm: string;
    deleteAccountDone: string;
    deleteAccountError: string;
  };
  myCvsPage: {
    title: string;
    subtitle: string;
    signInPrompt: string;
    empty: string;
    loading: string;
    untitled: string;
    updated: string;
    open: string;
    duplicate: string;
    duplicatePrompt: string;
    rename: string;
    renamePrompt: string;
    delete: string;
    deleteConfirm: string;
    share: string;
    shareOn: string;
    shareOff: string;
    copyLink: string;
    linkCopied: string;
    limitReached: string;
    loadError: string;
    actionError: string;
    newCta: string;
  };
  profile: {
    navLink: string;
    title: string;
    subtitle: string;
    signInPrompt: string;
    loading: string;
    loadError: string;
    saving: string;
    saved: string;
    saveError: string;
    completeTitle: string;
    completeHint: string;
    completeDone: string;
    missingLabel: string;
    checks: Record<ProfileCheckKey, string>;
    importButton: string;
    importTitle: string;
    importSubtitle: string;
    importEmpty: string;
    importAll: string;
    importClear: string;
    importConfirm: string;
    importCancel: string;
    saveBack: string;
    saveBackButton: string;
    saveBackDone: string;
    openBuilder: string;
  };
  legal: {
    privacyLink: string;
    termsLink: string;
    backHome: string;
    disclaimer: string;
  };
  cvHistory: {
    toggle: string;
    empty: string;
    add: string;
    company: string;
    role: string;
    date: string;
    url: string;
    note: string;
    viewAd: string;
    status: {
      sent: string;
      interviewing: string;
      offer: string;
      rejected: string;
      no_response: string;
    };
  };
  publicCv: {
    badge: string;
    notFound: string;
    loading: string;
    cta: string;
    download: string;
  };
  support: {
    footerLink: string;
    badgeLabel: string;
    modalTitle: string;
    modalBody: string;
    modalClose: string;
    qrHint: string;
    primaryButton: string;
    secondaryButton: string;
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
      footerNote: "Χωρίς λογαριασμό, τα δεδομένα σου μένουν μόνο στη συσκευή σου.",
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
      pathManualLabel: "Μόνος σου",
      featuresTitle: "Όλα όσα κάνει το CVsible",
      featuresSubtitle:
        "Δύο εργαλεία σε ένα: φτιάχνεις βιογραφικό από το μηδέν, ή ελέγχεις όποιο βιογραφικό έχεις ήδη.",
      features: [
        {
          icon: "file-text",
          title: "PDF με πραγματικό κείμενο",
          body: "Το PDF δεν είναι εικόνα. Κάθε λέξη είναι επιλέξιμη, αναζητήσιμη και αναγνώσιμη από τα ATS — και τα ελληνικά βγαίνουν σωστά.",
        },
        {
          icon: "shield",
          title: "CVscan — έλεγχος ATS",
          body: "Ανέβασε οποιοδήποτε PDF, DOCX ή TXT, ακόμα κι αν δεν φτιάχτηκε εδώ, και δες τι ακριβώς διαβάζει το σύστημα και τι μπλοκάρει.",
        },
        {
          icon: "sparkles",
          title: "CVisor — σε ρωτάει, το γράφει",
          body: "Μία ερώτηση τη φορά, και το βιογραφικό χτίζεται μπροστά σου. Δεν εφευρίσκει εμπειρία που δεν του είπες.",
        },
        {
          icon: "zap",
          title: "CVfix — διορθώσεις που εγκρίνεις",
          body: "Διαβάζει το βιογραφικό σου και προτείνει συγκεκριμένες αλλαγές. Βλέπεις τι αντικαθιστά η καθεμία και κρατάς όσες θέλεις.",
        },
        {
          icon: "layout",
          title: "Τέσσερα πρότυπα, τρία ATS-safe",
          body: "Aurora με έγχρωμη πλαϊνή στήλη, Meridian κλασικό μονόστηλο, Atlas μοντέρνο μονόστηλο, Compass τολμηρό μονόστηλο. Αλλάζεις πρότυπο χωρίς να χάσεις τίποτα.",
        },
        {
          icon: "zap",
          title: "Δωρεάν, χωρίς λογαριασμό",
          body: "Κανένα υδατογράφημα, κανένα κόστος. Τα δεδομένα σου μένουν στη συσκευή σου εκτός αν επιλέξεις να συνδεθείς.",
        },
        {
          icon: "eye",
          title: "Ζωντανή προεπισκόπηση",
          body: "Βλέπεις τη σελίδα να χτίζεται καθώς γράφεις, με σωστή σελιδοποίηση Α4 και αυτόματο σπάσιμο σε σελίδες.",
        },
        {
          icon: "type",
          title: "Πλήρης μορφοποίηση",
          body: "Χρώμα, γραμματοσειρά, πυκνότητα, σειρά ενοτήτων, φωτογραφία και επίπεδο δεξιοτήτων — όλα στα χέρια σου.",
        },
        {
          icon: "download",
          title: "Αποθήκευση και άνοιγμα αρχείου",
          body: "Κατέβασε το βιογραφικό σου ως αρχείο και άνοιξέ το ξανά αργότερα, από όποια συσκευή θες, για αλλαγές.",
        },
        {
          icon: "languages",
          title: "Ελληνικά και Αγγλικά",
          body: "Όλη η εφαρμογή και οι τίτλοι των ενοτήτων σε δύο γλώσσες, με τους καθιερωμένους όρους που αναγνωρίζουν τα ATS.",
        },
        {
          icon: "target",
          title: "Ταίριασμα με την αγγελία",
          body: "Επικολλάς την αγγελία και βλέπεις ποιοι όροι της εμφανίζονται στο βιογραφικό σου και ποιοι λείπουν, χωρίς keyword stuffing.",
        },
        {
          icon: "eye",
          title: "Δες ό,τι βλέπει το ATS",
          body: "Ολόκληρο το κείμενο του αρχείου σου, στη σειρά που το διαβάζει ο parser. Αν εδώ είναι ανακατεμένο, ξέρεις γιατί δεν παίρνεις απαντήσεις.",
        },
      ],
      featuresMore: "Δες όλες τις λειτουργίες",
      featuresLess: "Λιγότερα",
      scanBadge: "Ανεξάρτητο εργαλείο",
      scanTitle: "Έχεις ήδη βιογραφικό; Δες πόσο φιλικό είναι προς τα ATS.",
      scanBody:
        "Ανέβασέ το με drag & drop και ο CVscan σου δείχνει ακριβώς τι εξάγει ένα σύστημα πρόσληψης: όνομα, email, ημερομηνίες, ενότητες, αν έχει δύο στήλες, αν είναι εικόνα αντί για κείμενο — και όλο το κείμενο όπως το διαβάζει. Μετά, ο CVfix το ξαναχτίζει σωστά χωρίς να αλλάξει τα λόγια σου. Η ανάλυση γίνεται στη συσκευή σου.",
      scanCta: "Έλεγξε το βιογραφικό μου",
    },
    nav: {
      brand: "CVsible",
      backToHome: "Αρχική",
      download: "Λήψη PDF",
      downloading: "Προετοιμασία…",
      downloadError: "Κάτι πήγε στραβά με τη λήψη του PDF. Δοκίμασε ξανά.",
      startOver: "Νέο βιογραφικό",
      startOverConfirm: "Θα σβηστούν όλα τα στοιχεία που έχεις συμπληρώσει. Συνέχεια;",
      menu: "Περισσότερα",
      exportJson: "Αποθήκευση ως αρχείο",
      importJson: "Άνοιγμα αρχείου",
      importConfirm: "Το τρέχον βιογραφικό θα αντικατασταθεί από το αρχείο. Συνέχεια;",
      importError: "Το αρχείο δεν είναι έγκυρο βιογραφικό CVsible.",
      importSuccess: "Το βιογραφικό φορτώθηκε.",
      saveToCloud: "Αποθήκευση στον λογαριασμό μου",
      savingToCloud: "Αποθήκευση…",
      savedToCloud: "Αποθηκεύτηκε στον λογαριασμό σου.",
      saveToCloudError: "Η αποθήκευση απέτυχε. Δοκίμασε ξανά.",
      saveToCloudPromptTitle: "Όνομα για αυτό το βιογραφικό:",
      cloudLimitReached: "Έχεις φτάσει το όριο αποθηκευμένων βιογραφικών. Διάγραψε ένα παλιό από «Τα βιογραφικά μου» για να συνεχίσεις.",
      undo: "Αναίρεση",
      redo: "Επανάληψη",
    },
    siteNav: {
      home: "Αρχική",
      build: "Δημιουργία βιογραφικού",
      scan: "Έλεγχος ATS",
      cvisor: "CVisor",
      features: "Λειτουργίες",
      openMenu: "Μενού",
      myCvs: "Τα βιογραφικά μου",
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
      dateOfBirth: "Ημερομηνία γέννησης (προαιρετικό)",
      role: "Θέση",
      company: "Εταιρεία",
      startDate: "Έναρξη",
      endDate: "Λήξη",
      current: "Τρέχουσα",
      expectedGraduation: "Αναμενόμενη ολοκλήρωση",
      description: "Περιγραφή",
      degree: "Τίτλος σπουδών",
      institution: "Ίδρυμα",
      skillName: "Δεξιότητα",
      skillCategory: "Κατηγορία",
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
      contactType: "Τύπος επικοινωνίας",
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
      dragToReposition: "Σύρε για να αλλάξεις την εστίαση της φωτογραφίας",
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
      skillCategory: "π.χ. Σχεδιασμός",
      softSkillName: "π.χ. Ομαδικότητα",
      languageName: "π.χ. Αγγλικά",
      interestName: "π.χ. Φωτογραφία",
      certTitle: "π.χ. AWS Certified",
      certIssuer: "Φορέας πιστοποίησης",
      projectTitle: "Όνομα έργου",
      projectLink: "example.com",
      projectDescription: "Σύντομη περιγραφή του έργου.",
      present: "Σήμερα",
      expectedPrefix: "Αναμένεται",
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
    atsSections: {
      summary: "Επαγγελματικό Προφίλ",
      experience: "Επαγγελματική Εμπειρία",
      education: "Εκπαίδευση",
      skills: "Δεξιότητες",
      softSkills: "Προσωπικές Δεξιότητες",
      languages: "Ξένες Γλώσσες",
      interests: "Ενδιαφέροντα",
      certifications: "Πιστοποιήσεις",
      projects: "Έργα",
    },
    pagination: {
      page: "Σελίδα",
      previousPage: "Προηγούμενη σελίδα",
      nextPage: "Επόμενη σελίδα",
      continued: "συνέχεια",
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
      skillLevel: "Επίπεδο δεξιοτήτων",
      skillLevelText: "Με λέξεις",
      skillLevelNone: "Χωρίς επίπεδο",
    },
    templates: {
      title: "Πρότυπο βιογραφικού",
      atsBadge: "ATS",
      photoUnsupported: "Αυτό το πρότυπο δεν εμφανίζει φωτογραφία.",
      aurora: {
        name: "Aurora",
        description: "Έγχρωμη πλαϊνή στήλη. Εντυπωσιακό, αλλά οι δύο στήλες δυσκολεύουν κάποια ATS.",
      },
      meridian: {
        name: "Meridian",
        description: "Κλασικό μονόστηλο, λιτή τυπογραφία. Η ασφαλέστερη επιλογή για ATS.",
      },
      atlas: {
        name: "Atlas",
        description: "Μοντέρνο μονόστηλο με έγχρωμους τίτλους. ATS-friendly και κομψό.",
      },
      compass: {
        name: "Compass",
        description: "Μονόστηλο με έντονο όνομα και έγχρωμη ετικέτα τίτλου. ATS-friendly με λίγο παραπάνω χαρακτήρα.",
      },
    },
    sectionOrder: {
      title: "Σειρά ενοτήτων",
      hint: "Σύρε για να αλλάξεις τη σειρά με την οποία εμφανίζονται στο βιογραφικό.",
      sidebarHint: "Στο Aurora, οι δεξιότητες, οι γλώσσες και τα ενδιαφέροντα πάνε στην πλαϊνή στήλη.",
    },
    languageLevels: [
      "Βασικό",
      "Μέτριο",
      "Καλό",
      "Πολύ καλό",
      "Άριστο",
      "Μητρική γλώσσα",
    ],
    skillLevels: ["Βασικό", "Μέτριο", "Προχωρημένο", "Άριστο"],
    skillCategoryHint:
      "Η κατηγορία είναι προαιρετική. Όσες δεξιότητες έχουν κατηγορία μπαίνουν σε δική τους γραμμή με τον τίτλο μπροστά· όσες δεν έχουν, μένουν όλες μαζί σε μία σειρά.",
    ats: {
      navLabel: "CVscan",
      title: "CVscan — τεχνικός έλεγχος ATS",
      subtitle:
        "Ανέβασε το βιογραφικό σου και δες ακριβώς τι διαβάζει ένα σύστημα ATS: τι εξάγει, τι δομή αναγνωρίζει και τι μπλοκάρει.",
      verdictPassHint: "Κανένα κρίσιμο πρόβλημα — ένα ATS μπορεί να το διαβάσει και να το καταχωρήσει.",
      verdictFailHint: "Κάτι κρίσιμο εμποδίζει την ανάγνωση. Δες παρακάτω τι ακριβώς.",
      formatIssue: "Πρόβλημα στη μορφή — δες τον έλεγχο ATS",
      axisFormat: "Μορφή",
      axisFormatHint: "Αν μπορεί μια μηχανή να διαβάσει το αρχείο και να βρει τα στοιχεία σου.",
      axisContent: "Περιεχόμενο",
      axisContentHint: "Αν είναι γραμμένο όπως ένα βιογραφικό που πείθει άνθρωπο.",
      axisMatch: "Ταίριασμα",
      axisMatchHint: "Πόσα από όσα ζητάει η συγκεκριμένη αγγελία τα λέει το βιογραφικό σου.",
      axisMatchNone: "Επικόλλησε μια αγγελία για να μετρηθεί.",
      verdictPass: "Δομή φιλική προς ATS",
      verdictFail: "Έχει σημεία που δυσκολεύουν τα ATS",
      bandExcellent: "Άριστο",
      bandGood: "Καλό",
      bandFair: "Μέτριο",
      bandPoor: "Προβληματικό",
      dropTitle: "Σύρε εδώ το βιογραφικό σου",
      dropHint: "ή διάλεξε αρχείο από τη συσκευή σου",
      dropActive: "Άσ' το εδώ",
      browse: "Επιλογή αρχείου",
      supported: "PDF, DOCX ή TXT · έως 12 MB",
      privacy: "Η ανάλυση γίνεται εξ ολοκλήρου στη συσκευή σου. Το αρχείο δεν ανεβαίνει πουθενά.",
      useMyCv: "Έλεγξε το βιογραφικό που φτιάχνω",
      useMyCvHint: "Αναλύεται το CV που έχεις ήδη στο CVsible, με τον ίδιο ακριβώς έλεγχο.",
      orUpload: "ή",
      analyzing: "Ανάλυση…",
      changeFile: "Άλλο αρχείο",
      jobAdLabel: "Αγγελία εργασίας (προαιρετικό)",
      jobAdPlaceholder: "Επικόλλησε εδώ το κείμενο της αγγελίας για ανάλυση λέξεων-κλειδιών…",
      jobAdHint: "Με την αγγελία, ο έλεγχος δείχνει ποιοι όροι της εμφανίζονται στο βιογραφικό σου.",
      sourceUploaded: "Ανεβασμένο αρχείο",
      sourceBuilder: "Από τον CVsible builder",
      checksTitle: "Έλεγχοι",
      blocking: "Μπλοκάρουν",
      warnings: "Προσοχή",
      passing: "Περνούν",
      notEvaluatedGroupTitle: "Δεν αξιολογήθηκαν",
      notEvaluated: "Δεν μπορεί να αξιολογηθεί με ασφάλεια για αυτόν τον τύπο αρχείου.",
      parsedTitle: "Τι εξάγει το σύστημα",
      parsedHint: "Αυτά είναι τα πεδία που καταφέρνει να απομονώσει ένας parser από το αρχείο σου.",
      parsedName: "Όνομα",
      parsedEmail: "Email",
      parsedPhone: "Τηλέφωνο",
      parsedLinks: "Σύνδεσμοι",
      parsedDates: "Ημερομηνίες",
      parsedSections: "Ενότητες",
      notFound: "Δεν βρέθηκε",
      documentTitle: "Στοιχεία αρχείου",
      docPages: "Σελίδες",
      docWords: "Λέξεις",
      docCharacters: "Χαρακτήρες",
      docType: "Τύπος",
      docSize: "Μέγεθος",
      docColumns: "Σελίδες με 2 στήλες",
      docImages: "Εικόνες",
      docFonts: "Γραμματοσειρές",
      docMetaTitle: "Τίτλος PDF",
      docMetaAuthor: "Συντάκτης",
      docProducer: "Παραγωγή από",
      docTextLayer: "Επίπεδο κειμένου",
      yes: "Ναι",
      no: "Όχι",
      textTitle: "Το κείμενο όπως το διαβάζει το ATS",
      textHint:
        "Ακριβώς αυτό βλέπει το σύστημα, στη σειρά που το διαβάζει. Αν εδώ κάτι είναι ανακατεμένο, ανακατεμένο το βλέπει και ο recruiter.",
      pageLabel: "Σελίδα",
      copyText: "Αντιγραφή",
      copied: "Αντιγράφηκε",
      keywordsTitle: "Λέξεις-κλειδιά αγγελίας",
      keywordsCovered: "Εμφανίζονται",
      keywordsMissing: "Δεν εμφανίζονται",
      noJobAd: "Επικόλλησε μια αγγελία παραπάνω για να δεις κάλυψη λέξεων-κλειδιών.",
      fixCtaTitle: "Θες να τα διορθώσει ο CVfix;",
      fixCtaBody:
        "Ο CVfix διαβάζει το βιογραφικό σου με τα ίδια κριτήρια αυτής της αναφοράς και προτείνει συγκεκριμένες αλλαγές — βλέπεις τι αντικαθιστά η καθεμία και εγκρίνεις όποιες θέλεις.",
      fixCtaButton: "Άνοιγμα CVfix",
      buildTitle: "Ή ξεκίνα από την αρχή",
      buildBody:
        "Ο CVisor σε ρωτάει μία ερώτηση τη φορά και γράφει το βιογραφικό από τις απαντήσεις σου, σε πρότυπο που περνάει εξ ορισμού τους ελέγχους μορφοποίησης αυτής της σελίδας. Θα αντικαταστήσει ό,τι έχεις τώρα στον editor, οπότε είναι για όταν θες καθαρό ξεκίνημα.",
      buildButton: "Ξεκίνα με τον CVisor",
      errorUnsupported: "Υποστηρίζονται μόνο αρχεία PDF, DOCX και TXT.",
      errorTooLarge: "Το αρχείο ξεπερνά τα 12 MB.",
      errorUnreadable: "Το αρχείο δεν μπόρεσε να διαβαστεί. Μπορεί να είναι κατεστραμμένο ή κλειδωμένο.",
      checks: {
        textLayer: {
          label: "Επίπεδο κειμένου",
          ok: "Το αρχείο περιέχει {v} λέξεις αναγνώσιμου κειμένου.",
          bad: "Δεν βρέθηκε κείμενο. Το αρχείο είναι εικόνα — το ATS διαβάζει μηδέν λέξεις.",
        },
        singleColumn: {
          label: "Μία στήλη",
          ok: "Όλες οι σελίδες έχουν ενιαία ροή κειμένου.",
          bad: "Εντοπίστηκε διάταξη δύο στηλών σε {v} σελίδα(ες). Το κείμενο διαβάζεται ανακατεμένο.",
        },
        headingsFound: {
          label: "Αναγνωρισμένες ενότητες",
          ok: "Αναγνωρίστηκαν {v} τυπικές ενότητες.",
          bad: "Αναγνωρίστηκαν μόνο {v} τυπικές ενότητες.",
        },
        email: { label: "Email", ok: "Εξήχθη: {v}", bad: "Δεν εντοπίστηκε διεύθυνση email." },
        phone: { label: "Τηλέφωνο", ok: "Εξήχθη: {v}", bad: "Δεν εντοπίστηκε αριθμός τηλεφώνου." },
        contactAtTop: {
          label: "Επικοινωνία στην κορυφή",
          ok: "Τα στοιχεία επικοινωνίας βρίσκονται στις πρώτες γραμμές.",
          bad: "Δεν βρέθηκε email στις πρώτες 12 γραμμές του αρχείου.",
        },
        onlineProfile: {
          label: "Σύνδεσμοι",
          ok: "Εντοπίστηκαν {v} σύνδεσμοι.",
          bad: "Δεν εντοπίστηκε κανένας σύνδεσμος.",
        },
        summary: {
          label: "Ενότητα σύνοψης",
          ok: "Υπάρχει ενότητα προφίλ/σύνοψης.",
          bad: "Δεν εντοπίστηκε ενότητα προφίλ ή σύνοψης.",
        },
        experience: {
          label: "Ενότητα εμπειρίας",
          ok: "Εντοπίστηκε τίτλος εργασιακής εμπειρίας.",
          bad: "Δεν εντοπίστηκε αναγνωρίσιμος τίτλος εργασιακής εμπειρίας.",
        },
        education: {
          label: "Ενότητα εκπαίδευσης",
          ok: "Εντοπίστηκε τίτλος εκπαίδευσης.",
          bad: "Δεν εντοπίστηκε αναγνωρίσιμος τίτλος εκπαίδευσης.",
        },
        skills: {
          label: "Ενότητα δεξιοτήτων",
          ok: "Εντοπίστηκε τίτλος δεξιοτήτων.",
          bad: "Δεν εντοπίστηκε αναγνωρίσιμος τίτλος δεξιοτήτων.",
        },
        experienceDates: {
          label: "Ημερομηνίες",
          ok: "Αναγνωρίστηκαν {v} ημερομηνίες ή χρονικά διαστήματα.",
          bad: "Αναγνωρίστηκαν μόνο {v} ημερομηνίες. Ο parser δεν μπορεί να χτίσει χρονολόγιο.",
        },
        bullets: {
          label: "Κουκκίδες",
          ok: "{v} γραμμές ξεκινούν με κουκκίδα.",
          bad: "Μόνο {v} γραμμές ξεκινούν με κουκκίδα.",
        },
        actionVerbs: {
          label: "Ρήματα δράσης",
          ok: "{v}% των κουκκίδων ξεκινούν με ρήμα δράσης.",
          bad: "{v}% των κουκκίδων ξεκινούν με ρήμα δράσης.",
        },
        quantified: {
          label: "Αριθμοί σε κουκκίδες",
          ok: "{v} κουκκίδες περιέχουν αριθμητικά στοιχεία.",
          bad: "{v} κουκκίδες περιέχουν αριθμητικά στοιχεία.",
        },
        length: { label: "Σελίδες", ok: "{v} σελίδα(ες).", bad: "{v} σελίδες." },
        wordCount: { label: "Έκταση κειμένου", ok: "{v} λέξεις.", bad: "{v} λέξεις." },
        photo: {
          label: "Εικόνες",
          ok: "Το αρχείο δεν περιέχει εικόνες.",
          bad: "Το αρχείο περιέχει {v} εικόνα(ες). Ό,τι κείμενο βρίσκεται μέσα τους δεν διαβάζεται.",
        },
        fileName: { label: "Όνομα αρχείου", ok: "{v}", bad: "{v}" },
        spacedLetters: {
          label: "Γράμματα χωρίς κενά",
          ok: "Καμία γραμμή δεν διαβάζεται γράμμα-γράμμα.",
          bad: "Γραμμές διαβάζονται γράμμα-γράμμα, π.χ. «{v}». Οφείλεται σε πολύ μεγάλη αραίωση χαρακτήρων και κανένας τίτλος έτσι δεν αναγνωρίζεται.",
        },
        keywords: {
          label: "Κάλυψη λέξεων-κλειδιών",
          ok: "{v}% των βασικών όρων της αγγελίας εμφανίζονται στο αρχείο.",
          bad: "{v}% των βασικών όρων της αγγελίας εμφανίζονται στο αρχείο.",
        },
      },
    },
    profileFill: {
      title: "Τι να πάρω από το προφίλ σου;",
      intro: "Διάλεξε ενότητα για να δεις τι υπάρχει μέσα και να ξεδιαλέξεις.",
      back: "Πίσω στις ενότητες",
      cancel: "Άκυρο",
      save: "Αποθήκευση",
      selectAll: "Επιλογή όλων",
      selectNone: "Κανένα",
      chosenOf: "{0} από {1}",
      fill: "Συμπλήρωσε {0}",
      fillNone: "Διάλεξε τουλάχιστον ένα",
    },
    charCounter: { tooLong: "{0} χαρακτήρες πάνω από το όριο" },
    cvisorChat: {
      title: "CVisor",
      intro: "Λίγες ερωτήσεις, μία κάθε φορά. Το βιογραφικό χτίζεται δίπλα σου καθώς απαντάς.",
      yes: "Ναι",
      no: "Όχι",
      back: "Πίσω",
      skip: "Προσπέραση",
      next: "Συνέχεια",
      thinking: "Σκέφτομαι τι να ρωτήσω…",
      answerLabel: "Η απάντησή σου",
      followUpPlaceholder: "Ό,τι θυμάσαι — αριθμοί, μέγεθος ομάδας, αποτέλεσμα.",
      thisJob: "αυτή τη δουλειά",
      targetPrompt: "Τι δουλειά ψάχνεις;",
      targetHint:
        "Αν έχεις συγκεκριμένη αγγελία, κόλλα την ολόκληρη — θα προσαρμόσω το λεξιλόγιο σε αυτήν. Αλλιώς αρκεί μια περιγραφή.",
      targetLabel: "Θέση ή αγγελία",
      targetPlaceholder: "π.χ. Barista σε specialty καφετέρια — ή κόλλα εδώ την αγγελία",
      firstRolePrompt: "Ποια ήταν η τελευταία σου δουλειά;",
      firstRoleHint: "Ξεκινάμε από την πιο πρόσφατη και πάμε προς τα πίσω.",
      nextRolePrompt: "Και η προηγούμενη;",
      roleLabel: "Θέση",
      rolePlaceholder: "π.χ. Barista",
      companyLabel: "Εταιρεία",
      companyPlaceholder: "π.χ. Coffee Lab",
      periodLabel: "Περίοδος",
      periodPlaceholder: "π.χ. Μάρτιος 2022 – σήμερα",
      storyPrompt: "Τι έκανες ως {0};",
      storyHint: "Γράψε το όπως θα το έλεγες σε φίλο. Θα το κάνω εγώ βιογραφικό.",
      storyLabel: "Με δικά σου λόγια",
      storyPlaceholder: "Έφτιαχνα καφέδες, κρατούσα το ταμείο, εκπαίδευσα δύο καινούρια άτομα…",
      moreRolesPrompt: "Υπάρχει κι άλλη δουλειά πριν από αυτή;",
      firstSchoolPrompt: "Τι έχεις σπουδάσει;",
      firstSchoolHint: "Αν δεν έχεις σπουδές, προσπέρασέ το — δεν είναι απαραίτητο.",
      nextSchoolPrompt: "Κάτι άλλο που σπούδασες;",
      degreeLabel: "Τίτλος σπουδών",
      degreePlaceholder: "π.χ. Πτυχίο Τουριστικών Επιχειρήσεων",
      institutionLabel: "Ίδρυμα",
      institutionPlaceholder: "π.χ. ΑΠΘ",
      moreSchoolsPrompt: "Υπάρχει κι άλλο;",
      skillsPrompt: "Τι ξέρεις να κάνεις;",
      skillsHint: "Γράψ' τα χύμα, χωρισμένα με κόμμα. Θα τα τακτοποιήσω.",
      skillsLabel: "Δεξιότητες",
      skillsPlaceholder: "π.χ. Espresso, latte art, HACCP, ταμείο, Excel",
      languagesPrompt: "Ποιες γλώσσες μιλάς;",
      languagesHint: "Βάλε και το επίπεδο αν το ξέρεις.",
      languagesLabel: "Γλώσσες",
      languagesPlaceholder: "π.χ. Αγγλικά (καλά), Γερμανικά (βασικά)",
      extrasPrompt: "Κάτι άλλο που αξίζει να μπει;",
      extrasHint: "Πιστοποιήσεις, σεμινάρια, εθελοντισμός, προσωπικά project — ή προσπέρασέ το.",
      extrasLabel: "Οτιδήποτε άλλο",
      extrasPlaceholder: "π.χ. Πιστοποίηση HACCP 2023, εθελοντισμός σε φεστιβάλ καφέ",
      groupTarget: "Στόχος",
      groupExperience: "Εμπειρία",
      groupEducation: "Σπουδές",
      groupSkills: "Δεξιότητες",
      groupExtras: "Έξτρα",
      previewTitle: "Το βιογραφικό σου",
      previewEmpty: "Ό,τι απαντάς εμφανίζεται εδώ.",
      pendingTitle: "Θα μπουν κι αυτά",
      readyTitle: "Τα έχω όλα",
      readyBody:
        "Θα τα γράψω σε κανονικό βιογραφικό — με ρήματα δράσης, το λεξιλόγιο της αγγελίας και χωρίς να προσθέσω τίποτα που δεν μου είπες.",
      buildButton: "Φτιάξε το βιογραφικό",
      reviewAnswers: "Δες τις απαντήσεις",
      notEnough: "Πες μου πρώτα για μία δουλειά ή για τις σπουδές σου.",
      restart: "Από την αρχή",
      restartConfirm: "Να σβηστούν όσα έχεις απαντήσει;",
      replaceConfirm:
        "Έχεις ήδη ένα βιογραφικό στον editor και θα αντικατασταθεί από αυτό. Να συνεχίσω;",
      importProfile: "Συμπλήρωση από το προφίλ μου",
      importProfileHint: "Διάλεξε τι θέλεις να περάσει, για να μην τα ξαναγράφεις.",
      importChoose: "Διάλεξε τι θα περάσει",
      importedProfile: "Συμπληρώθηκαν {0} απαντήσεις από το προφίλ σου",
      importedProfileHint: "Κλείσε τον διακόπτη για να τις αφαιρέσεις. Ό,τι έχεις αλλάξει από τότε μένει.",
      sourceJob: "Δουλειά",
      sourceStudy: "Σπουδές",
      sourceSkills: "Δεξιότητες",
      sourceLanguages: "Γλώσσες",
      sourceExtras: "Άλλα",
    },
    cvisor: {
      brand: "CVisor",
      tryButton: "Δοκίμασε τον CVisor",
      openButton: "Δημιουργία με τον CVisor",
      improveButton: "Βελτίωση",
      improving: "Γράφει…",
      suggestionTitle: "Πρόταση του CVisor",
      acceptSuggestion: "Κράτησέ το",
      discardSuggestion: "Άκυρο",
      regenerateSuggestion: "Ξαναγράψ' το",
      generateButton: "Γράψε το βιογραφικό μου",
      generating: "Δουλεύει…",
      errorMissingFields: "Συμπλήρωσε τα στοιχεία σου πριν συνεχίσεις.",
      errorTooLong: "Το κείμενο είναι πολύ μεγάλο. Συντόμευσέ το λίγο.",
      errorRateLimited: "Έφτασες το ημερήσιο όριο χρήσης. Δοκίμασε ξανά αργότερα.",
      errorRateLimitedInHours: "Έφτασες το ημερήσιο όριο χρήσης. Δοκίμασε ξανά σε {v} ώρες.",
      errorRateLimitedInOneHour: "Έφτασες το ημερήσιο όριο χρήσης. Δοκίμασε ξανά σε 1 ώρα.",
      errorRefused: "Ο CVisor δεν μπόρεσε να επεξεργαστεί αυτό το κείμενο.",
      errorUnavailable: "Η υπηρεσία AI είναι προσωρινά μη διαθέσιμη. Δοκίμασε ξανά σε λίγο.",
      errorGeneric: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
      title: "CVisor",
      runningTitle: "Ο CVisor δουλεύει",
      runningSteps: [
        "Διαβάζει την αγγελία και τα στοιχεία σου",
        "Γράφει το πρώτο προσχέδιο",
        "Ελέγχει για εφευρημένα στοιχεία και αδύναμες διατυπώσεις",
        "Ξαναγράφει ό,τι δεν πέρασε τον έλεγχο",
      ],
      verified: "Πέρασε όλους τους ελέγχους",
      verifiedHint:
        "Κάθε εταιρεία, δεξιότητα και αριθμός επαληθεύτηκε ότι υπάρχει στα δικά σου στοιχεία.",
      unverified: "Έμειναν εκκρεμότητες",
      unverifiedHint:
        "Ο CVisor δεν πρόλαβε να τα διορθώσει όλα μέσα στους γύρους που έχει. Το βιογραφικό είναι έτοιμο, αλλά δες τα παρακάτω πριν το στείλεις κάπου.",
      fabricationTitle: "Δεν τα βρήκα στα λόγια σου",
      fabricationHint:
        "Δεν μου τα ανέφερες πουθενά, οπότε μην τα αφήσεις όπως είναι: σβήσ' τα ή διόρθωσέ τα στον editor.",
      blockingLeft: "Έμειναν {0} σημεία που δεν περνούν τους ελέγχους ποιότητας. Θα τα δεις αναλυτικά στο CVscan.",
      changesTitle: "Τι έκανε",
      apply: "Εφάρμοσέ το στο βιογραφικό",
      back: "Πίσω",
      close: "Κλείσιμο",
      retry: "Δοκίμασε ξανά",
    },
    cvfix: {
      badge: "CVfix",
      title: "Ας το φτιάξουμε",
      body: "Πρώτα ο CVfix ξεμπλέκει τη δομή του αρχείου σου και βάζει το περιεχόμενο στα σωστά πεδία — σε αυτό το βήμα δεν αλλάζει ούτε μία λέξη, και κάθε πρόταση ελέγχεται αυτόματα ότι υπάρχει αυτολεξεί στο αρχικό. Μετά σου προτείνει βελτιώσεις στη διατύπωση, μία-μία, και εγκρίνεις όποιες θέλεις.",
      button: "Διόρθωση με τον CVfix",
      running: "Ο CVfix δουλεύει…",
      runningRound: "Γύρος",
      cancel: "Άκυρο",
      windowTitle: "CVfix",
      windowIntro:
        "Διαβάζει το βιογραφικό σου με τα ίδια κριτήρια που το βαθμολογεί το CVscan και προτείνει συγκεκριμένες διορθώσεις.",
      scanning: "Διαβάζω το βιογραφικό σου…",
      reviewHint:
        "Καμία αλλαγή δεν εφαρμόζεται αν δεν την εγκρίνεις. Δες τι αντικαθιστά η καθεμία και κράτα όσες θέλεις.",
      noChangesTitle: "Δεν βρήκα κάτι να προτείνω",
      noChangesBody:
        "Το βιογραφικό περνάει τους ελέγχους που μετράει το CVscan. Αν αλλάξεις αγγελία-στόχο, ξανατρέξε τον CVfix για να το προσαρμόσει σε αυτήν.",
      before: "Πριν",
      after: "Μετά",
      addition: "Προσθήκη",
      accept: "Εφαρμογή",
      accepted: "Θα εφαρμοστεί",
      skip: "Παράλειψη",
      skipped: "Παραλείφθηκε",
      acceptAll: "Επιλογή όλων",
      applyCount: "Εφαρμογή {0} αλλαγών",
      applyOne: "Εφαρμογή 1 αλλαγής",
      applyNone: "Διάλεξε τουλάχιστον μία",
      close: "Κλείσιμο",
      metricVerbs: "ξεκινούν με ρήμα",
      metricCoverage: "κάλυψη αγγελίας",
      metricBullets: "σημεία",
      toolbarButton: "CVfix",
      targetLabel: "Η αγγελία που στοχεύεις",
      targetPlaceholder: "Κόλλα εδώ την αγγελία, για να προσαρμοστεί το λεξιλόγιο σε αυτήν.",
      targetNone: "Χωρίς αγγελία — οι προτάσεις αφορούν γενικά το βιογραφικό.",
      targetSet: "Προσαρμοσμένο στην αγγελία που έδωσες.",
      targetAdd: "Πρόσθεσε αγγελία",
      targetChange: "Αλλαγή",
      rerun: "Ξανατρέξ' το",
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
    skillSuggestions: {
      label: "Προτεινόμενες δεξιότητες από την αγγελία εργασίας — πάτησε για προσθήκη:",
    },
    auth: {
      signIn: "Σύνδεση με Google",
      signingIn: "Σύνδεση…",
      signOut: "Αποσύνδεση",
      deleteAccount: "Διαγραφή λογαριασμού",
      deleteAccountConfirm: "Θα διαγραφούν μόνιμα ο λογαριασμός σου και όλα τα αποθηκευμένα βιογραφικά. Αυτό δεν αναιρείται. Συνέχεια;",
      deleteAccountDone: "Ο λογαριασμός σου διαγράφηκε.",
      deleteAccountError: "Η διαγραφή απέτυχε. Δοκίμασε ξανά ή στείλε μας email.",
    },
    myCvsPage: {
      title: "Τα βιογραφικά μου",
      subtitle: "Τα βιογραφικά που έχεις αποθηκεύσει στον λογαριασμό σου.",
      signInPrompt: "Συνδέσου με Google για να αποθηκεύεις βιογραφικά και να τα ξανανοίγεις από οποιαδήποτε συσκευή.",
      empty: "Δεν έχεις αποθηκεύσει ακόμα κανένα βιογραφικό.",
      loading: "Φόρτωση…",
      untitled: "Χωρίς τίτλο",
      updated: "Τελευταία επεξεργασία",
      open: "Άνοιγμα",
      duplicate: "Αντιγραφή",
      duplicatePrompt: "Όνομα για το νέο αντίγραφο:",
      rename: "Μετονομασία",
      renamePrompt: "Νέο όνομα:",
      delete: "Διαγραφή",
      deleteConfirm: "Να διαγραφεί οριστικά αυτό το βιογραφικό;",
      share: "Δημόσιος σύνδεσμος",
      shareOn: "Ενεργός — ορατός σε όποιον έχει τον σύνδεσμο",
      shareOff: "Ανενεργός",
      copyLink: "Αντιγραφή συνδέσμου",
      linkCopied: "Ο σύνδεσμος αντιγράφηκε.",
      limitReached: "Έφτασες το όριο αποθηκευμένων βιογραφικών.",
      loadError: "Δεν ήταν δυνατή η φόρτωση των βιογραφικών σου.",
      actionError: "Κάτι πήγε στραβά. Δοκίμασε ξανά.",
      newCta: "Δημιουργία νέου",
    },
    profile: {
      navLink: "Το προφίλ μου",
      title: "Το προφίλ μου",
      subtitle:
        "Γράψε εδώ μία φορά όλα σου τα στοιχεία — κάθε δουλειά, κάθε σπουδή, κάθε δεξιότητα. Μετά, σε κάθε βιογραφικό διαλέγεις ποια από αυτά θα μπουν, χωρίς να τα ξαναγράφεις.",
      signInPrompt: "Συνδέσου με Google για να φτιάξεις το προφίλ σου.",
      loading: "Φόρτωση…",
      loadError: "Δεν ήταν δυνατή η φόρτωση του προφίλ σου.",
      saving: "Αποθήκευση…",
      saved: "Αποθηκεύτηκε",
      saveError: "Η αποθήκευση απέτυχε",
      completeTitle: "Πληρότητα προφίλ",
      completeHint: "Όσο πιο πλήρες το προφίλ, τόσο λιγότερα θα χρειάζεται να γράφεις σε κάθε βιογραφικό.",
      completeDone: "Το προφίλ σου είναι πλήρες. Τώρα κάθε βιογραφικό ξεκινάει έτοιμο.",
      missingLabel: "Λείπουν ακόμα:",
      checks: {
        name: "Ονοματεπώνυμο",
        jobTitle: "Επαγγελματικός τίτλος",
        email: "Email",
        phone: "Τηλέφωνο",
        summary: "Σύνοψη",
        experience: "Μία τουλάχιστον εμπειρία",
        education: "Μία τουλάχιστον σπουδή",
        skills: "Πέντε τουλάχιστον δεξιότητες",
        languages: "Μία τουλάχιστον γλώσσα",
        photo: "Φωτογραφία",
      },
      importButton: "Εισαγωγή από το προφίλ",
      importTitle: "Εισαγωγή από το προφίλ",
      importSubtitle: "Διάλεξε τι θα μπει σε αυτό το βιογραφικό.",
      importEmpty: "Δεν υπάρχει κάτι στο προφίλ σου για αυτή την ενότητα — ή μπήκαν ήδη όλα.",
      importAll: "Επιλογή όλων",
      importClear: "Καθαρισμός",
      importConfirm: "Εισαγωγή ({v})",
      importCancel: "Άκυρο",
      saveBack: "{v} από αυτά δεν υπάρχουν στο προφίλ σου.",
      saveBackButton: "Αποθήκευση στο προφίλ",
      saveBackDone: "Μπήκαν στο προφίλ σου.",
      openBuilder: "Δημιουργία βιογραφικού",
    },
    legal: {
      privacyLink: "Απόρρητο",
      termsLink: "Όροι χρήσης",
      backHome: "← Αρχική",
      disclaimer: "Αυτό το κείμενο είναι μια καλόπιστη, απλή περιγραφή του πώς λειτουργεί το CVsible — δεν αποτελεί νομική συμβουλή.",
    },
    cvHistory: {
      toggle: "Ιστορικό αιτήσεων",
      empty: "Δεν έχεις καταγράψει καμία αίτηση ακόμα.",
      add: "Προσθήκη",
      company: "Εταιρεία",
      role: "Θέση",
      date: "Ημερομηνία",
      url: "Σύνδεσμος αγγελίας (προαιρετικό)",
      note: "Σημείωση (προαιρετικό)",
      viewAd: "Αγγελία",
      status: {
        sent: "Στάλθηκε",
        interviewing: "Σε συνέντευξη",
        offer: "Προσφορά",
        rejected: "Απορρίφθηκε",
        no_response: "Χωρίς απάντηση",
      },
    },
    publicCv: {
      badge: "Δημόσιο βιογραφικό μέσω CVsible",
      notFound: "Αυτός ο σύνδεσμος δεν είναι πλέον ενεργός ή δεν υπάρχει.",
      loading: "Φόρτωση βιογραφικού…",
      cta: "Φτιάξε το δικό σου δωρεάν στο CVsible",
      download: "Λήψη PDF",
    },
    support: {
      footerLink: "Στήριξε το CVsible ☕",
      badgeLabel: "Στήριξε το CVsible",
      modalTitle: "Το βιογραφικό σου είναι έτοιμο! 🎉",
      modalBody: "Αν σου φάνηκε χρήσιμο το CVsible, μια μικρή στήριξη μας βοηθάει να το κρατάμε δωρεάν για όλους.",
      modalClose: "Κλείσιμο",
      qrHint: "Σκάναρε για να πληρώσεις από το κινητό",
      primaryButton: "Κέρασέ μας έναν καφέ ☕",
      secondaryButton: "Ίσως μετά την πρώτη δουλειά 😉",
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
      footerNote: "Without an account, your data stays only on your device.",
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
      pathManualLabel: "On your own",
      featuresTitle: "Everything CVsible does",
      featuresSubtitle:
        "Two tools in one: build a CV from scratch, or check the one you already have.",
      features: [
        {
          icon: "file-text",
          title: "PDF as real text",
          body: "The PDF is not a picture. Every word is selectable, searchable and readable by an ATS — and Greek comes out correctly.",
        },
        {
          icon: "shield",
          title: "CVscan — ATS check",
          body: "Upload any PDF, DOCX or TXT, even one built elsewhere, and see exactly what the system reads and what blocks it.",
        },
        {
          icon: "sparkles",
          title: "CVisor — it asks, it writes",
          body: "One question at a time, with the CV building in front of you. It never invents experience you didn't tell it about.",
        },
        {
          icon: "zap",
          title: "CVfix — changes you approve",
          body: "It reads your CV and proposes specific edits. You see what each one replaces and keep the ones you want.",
        },
        {
          icon: "layout",
          title: "Four templates, three ATS-safe",
          body: "Aurora with a coloured sidebar, Meridian a classic single column, Atlas a modern single column, Compass a bold single column. Switch freely without losing anything.",
        },
        {
          icon: "zap",
          title: "Free, no account",
          body: "No watermark, no cost. Your data stays on your device unless you choose to sign in.",
        },
        {
          icon: "eye",
          title: "Live preview",
          body: "Watch the page build as you type, with real A4 pagination and automatic page breaks.",
        },
        {
          icon: "type",
          title: "Full styling control",
          body: "Colour, font, density, section order, photo and skill levels — all yours to set.",
        },
        {
          icon: "download",
          title: "Save and reopen a file",
          body: "Download your CV as a file and open it again later, on any device, to make changes.",
        },
        {
          icon: "languages",
          title: "Greek and English",
          body: "The whole app and every section heading in two languages, using the standard wording parsers recognise.",
        },
        {
          icon: "target",
          title: "Match against the job ad",
          body: "Paste the ad and see which of its terms appear in your CV and which are missing, without keyword stuffing.",
        },
        {
          icon: "eye",
          title: "See what the ATS sees",
          body: "The entire text of your file, in the order the parser reads it. If it is scrambled here, you know why you are not hearing back.",
        },
      ],
      featuresMore: "See all features",
      featuresLess: "Show less",
      scanBadge: "Standalone tool",
      scanTitle: "Already have a CV? See how ATS-friendly it is.",
      scanBody:
        "Drag and drop it in and CVscan shows exactly what a hiring system extracts: name, email, dates, sections, whether it has two columns, whether it is an image instead of text — plus the full text as the parser reads it. Then CVfix rebuilds it properly without changing your words. The analysis runs on your device.",
      scanCta: "Check my CV",
    },
    nav: {
      brand: "CVsible",
      backToHome: "Home",
      download: "Download PDF",
      downloading: "Preparing…",
      downloadError: "Something went wrong while creating the PDF. Please try again.",
      startOver: "New resume",
      startOverConfirm: "This will clear everything you've entered. Continue?",
      menu: "More",
      exportJson: "Save as file",
      importJson: "Open a file",
      importConfirm: "Your current CV will be replaced by the file. Continue?",
      importError: "That file is not a valid CVsible CV.",
      importSuccess: "CV loaded.",
      saveToCloud: "Save to my account",
      savingToCloud: "Saving…",
      savedToCloud: "Saved to your account.",
      saveToCloudError: "Saving failed. Please try again.",
      saveToCloudPromptTitle: "Name for this CV:",
      cloudLimitReached: "You've reached your saved-CV limit. Delete an old one from \"My CVs\" to continue.",
      undo: "Undo",
      redo: "Redo",
    },
    siteNav: {
      home: "Home",
      build: "Build a CV",
      scan: "ATS check",
      cvisor: "CVisor",
      features: "Features",
      openMenu: "Menu",
      myCvs: "My CVs",
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
      dateOfBirth: "Date of birth (optional)",
      role: "Role",
      company: "Company",
      startDate: "Start date",
      endDate: "End date",
      current: "Current",
      expectedGraduation: "Expected graduation",
      description: "Description",
      degree: "Degree",
      institution: "Institution",
      skillName: "Skill",
      skillCategory: "Category",
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
      contactType: "Contact type",
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
      dragToReposition: "Drag to reposition the photo",
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
      skillCategory: "e.g. Design",
      softSkillName: "e.g. Teamwork",
      languageName: "e.g. English",
      interestName: "e.g. Photography",
      certTitle: "e.g. AWS Certified",
      certIssuer: "Issuing organization",
      projectTitle: "Project name",
      projectLink: "example.com",
      projectDescription: "Short description of the project.",
      present: "Present",
      expectedPrefix: "Expected",
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
    atsSections: {
      summary: "Professional Summary",
      experience: "Work Experience",
      education: "Education",
      skills: "Skills",
      softSkills: "Soft Skills",
      languages: "Languages",
      interests: "Interests",
      certifications: "Certifications",
      projects: "Projects",
    },
    pagination: {
      page: "Page",
      previousPage: "Previous page",
      nextPage: "Next page",
      continued: "continued",
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
      skillLevel: "Skill level",
      skillLevelText: "As words",
      skillLevelNone: "Hide level",
    },
    templates: {
      title: "Resume template",
      atsBadge: "ATS",
      photoUnsupported: "This template does not show a photo.",
      aurora: {
        name: "Aurora",
        description: "Coloured sidebar. Eye-catching, but two columns can trip up some ATS.",
      },
      meridian: {
        name: "Meridian",
        description: "Classic single column, restrained typography. The safest choice for ATS.",
      },
      atlas: {
        name: "Atlas",
        description: "Modern single column with accent headings. ATS-friendly and sharp.",
      },
      compass: {
        name: "Compass",
        description: "Single column with a bold name and a coloured job-title badge. ATS-friendly with a bit more personality.",
      },
    },
    sectionOrder: {
      title: "Section order",
      hint: "Drag to change the order sections appear in your CV.",
      sidebarHint: "In Aurora, skills, languages and interests move to the sidebar.",
    },
    languageLevels: [
      "Basic",
      "Intermediate",
      "Good",
      "Fluent",
      "Excellent",
      "Native",
    ],
    skillLevels: ["Basic", "Intermediate", "Advanced", "Expert"],
    skillCategoryHint:
      "The category is optional. Skills that have one get their own line with the category in front; skills without one stay together on a single line.",
    ats: {
      navLabel: "CVscan",
      title: "CVscan — technical ATS check",
      subtitle:
        "Upload your CV and see exactly what an applicant tracking system reads: what it extracts, what structure it recognises and what blocks it.",
      verdictPassHint: "Nothing critical is broken — an ATS can read this and file it.",
      verdictFailHint: "Something critical blocks it from being read. The checks below say what.",
      formatIssue: "Formatting problem — open the ATS check",
      axisFormat: "Format",
      axisFormatHint: "Whether a machine can read the file and find your details.",
      axisContent: "Content",
      axisContentHint: "Whether it reads like a CV that convinces a person.",
      axisMatch: "Match",
      axisMatchHint: "How much of what this particular ad asks for your CV actually says.",
      axisMatchNone: "Paste a job ad to measure this.",
      verdictPass: "ATS-friendly structure",
      verdictFail: "Has ATS-unfriendly issues",
      bandExcellent: "Excellent",
      bandGood: "Good",
      bandFair: "Fair",
      bandPoor: "Problematic",
      dropTitle: "Drop your CV here",
      dropHint: "or pick a file from your device",
      dropActive: "Release to analyse",
      browse: "Choose a file",
      supported: "PDF, DOCX or TXT · up to 12 MB",
      privacy: "Everything is analysed on your device. The file is never uploaded.",
      useMyCv: "Check the CV I'm building",
      useMyCvHint: "Runs the exact same check against the CV already in CVsible.",
      orUpload: "or",
      analyzing: "Analysing…",
      changeFile: "Different file",
      jobAdLabel: "Job ad (optional)",
      jobAdPlaceholder: "Paste the job ad here for keyword analysis…",
      jobAdHint: "With a job ad, the report shows which of its terms appear in your CV.",
      sourceUploaded: "Uploaded file",
      sourceBuilder: "From the CVsible builder",
      checksTitle: "Checks",
      blocking: "Blocking",
      warnings: "Warnings",
      passing: "Passing",
      notEvaluatedGroupTitle: "Not evaluated",
      notEvaluated: "Can't be reliably evaluated for this file type.",
      parsedTitle: "What the system extracts",
      parsedHint: "These are the fields a parser manages to isolate from your file.",
      parsedName: "Name",
      parsedEmail: "Email",
      parsedPhone: "Phone",
      parsedLinks: "Links",
      parsedDates: "Dates",
      parsedSections: "Sections",
      notFound: "Not found",
      documentTitle: "Document facts",
      docPages: "Pages",
      docWords: "Words",
      docCharacters: "Characters",
      docType: "Type",
      docSize: "Size",
      docColumns: "Two-column pages",
      docImages: "Images",
      docFonts: "Fonts",
      docMetaTitle: "PDF title",
      docMetaAuthor: "Author",
      docProducer: "Produced by",
      docTextLayer: "Text layer",
      yes: "Yes",
      no: "No",
      textTitle: "The text as the ATS reads it",
      textHint:
        "This is precisely what the system sees, in the order it reads it. If it looks scrambled here, it reaches the recruiter scrambled.",
      pageLabel: "Page",
      copyText: "Copy",
      copied: "Copied",
      keywordsTitle: "Job ad keywords",
      keywordsCovered: "Present",
      keywordsMissing: "Absent",
      noJobAd: "Paste a job ad above to see keyword coverage.",
      fixCtaTitle: "Want CVfix to sort these out?",
      fixCtaBody:
        "CVfix reads your CV against the same standards as this report and proposes specific changes — you see what each one replaces and approve the ones you want.",
      fixCtaButton: "Open CVfix",
      buildTitle: "Or start from scratch",
      buildBody:
        "CVisor asks you one question at a time and writes the CV from your answers, in a template that passes this page's formatting checks by default. It replaces whatever is currently in the editor, so it's for when you want a clean start.",
      buildButton: "Start with CVisor",
      errorUnsupported: "Only PDF, DOCX and TXT files are supported.",
      errorTooLarge: "That file is larger than 12 MB.",
      errorUnreadable: "The file could not be read. It may be damaged or password protected.",
      checks: {
        textLayer: {
          label: "Text layer",
          ok: "The file contains {v} words of readable text.",
          bad: "No text found. This file is an image — the ATS reads zero words.",
        },
        singleColumn: {
          label: "Single column",
          ok: "Every page has one continuous text flow.",
          bad: "A two-column layout was detected on {v} page(s). The text is read interleaved.",
        },
        headingsFound: {
          label: "Recognised sections",
          ok: "{v} standard sections were recognised.",
          bad: "Only {v} standard sections were recognised.",
        },
        email: { label: "Email", ok: "Extracted: {v}", bad: "No email address was detected." },
        phone: { label: "Phone", ok: "Extracted: {v}", bad: "No phone number was detected." },
        contactAtTop: {
          label: "Contact at the top",
          ok: "Contact details sit in the opening lines.",
          bad: "No email was found in the first 12 lines of the file.",
        },
        onlineProfile: {
          label: "Links",
          ok: "{v} links were detected.",
          bad: "No links were detected.",
        },
        summary: {
          label: "Summary section",
          ok: "A profile or summary section is present.",
          bad: "No profile or summary section was detected.",
        },
        experience: {
          label: "Experience section",
          ok: "A work experience heading was detected.",
          bad: "No recognisable work experience heading was detected.",
        },
        education: {
          label: "Education section",
          ok: "An education heading was detected.",
          bad: "No recognisable education heading was detected.",
        },
        skills: {
          label: "Skills section",
          ok: "A skills heading was detected.",
          bad: "No recognisable skills heading was detected.",
        },
        experienceDates: {
          label: "Dates",
          ok: "{v} dates or date ranges were recognised.",
          bad: "Only {v} dates were recognised. The parser cannot build a timeline.",
        },
        bullets: {
          label: "Bullets",
          ok: "{v} lines begin with a bullet.",
          bad: "Only {v} lines begin with a bullet.",
        },
        actionVerbs: {
          label: "Action verbs",
          ok: "{v}% of bullets start with an action verb.",
          bad: "{v}% of bullets start with an action verb.",
        },
        quantified: {
          label: "Numbers in bullets",
          ok: "{v} bullets contain figures.",
          bad: "{v} bullets contain figures.",
        },
        length: { label: "Pages", ok: "{v} page(s).", bad: "{v} pages." },
        wordCount: { label: "Text length", ok: "{v} words.", bad: "{v} words." },
        photo: {
          label: "Images",
          ok: "The file contains no images.",
          bad: "The file contains {v} image(s). Any text inside them is unreadable.",
        },
        fileName: { label: "File name", ok: "{v}", bad: "{v}" },
        spacedLetters: {
          label: "Letters not split",
          ok: "No line is read letter by letter.",
          bad: "Lines come through letter by letter, e.g. \"{v}\". Wide letter-spacing causes this, and no heading survives it.",
        },
        keywords: {
          label: "Keyword coverage",
          ok: "{v}% of the ad's key terms appear in the file.",
          bad: "{v}% of the ad's key terms appear in the file.",
        },
      },
    },
    profileFill: {
      title: "What should I take from your profile?",
      intro: "Open a section to see what's in it and pick out what you want.",
      back: "Back to the sections",
      cancel: "Cancel",
      save: "Save",
      selectAll: "Select all",
      selectNone: "None",
      chosenOf: "{0} of {1}",
      fill: "Fill in {0}",
      fillNone: "Pick at least one",
    },
    charCounter: { tooLong: "{0} characters over the limit" },
    cvisorChat: {
      title: "CVisor",
      intro: "A few questions, one at a time. Your CV builds itself beside you as you answer.",
      yes: "Yes",
      no: "No",
      back: "Back",
      skip: "Skip",
      next: "Continue",
      thinking: "Thinking what to ask…",
      answerLabel: "Your answer",
      followUpPlaceholder: "Whatever you remember — numbers, team size, the result.",
      thisJob: "that job",
      targetPrompt: "What job are you going for?",
      targetHint:
        "If you have a specific ad, paste the whole thing — I'll match its vocabulary. Otherwise a description is enough.",
      targetLabel: "Role or job ad",
      targetPlaceholder: "e.g. Barista at a specialty coffee shop — or paste the ad here",
      firstRolePrompt: "What was your most recent job?",
      firstRoleHint: "We start with the latest and work backwards.",
      nextRolePrompt: "And the one before that?",
      roleLabel: "Role",
      rolePlaceholder: "e.g. Barista",
      companyLabel: "Company",
      companyPlaceholder: "e.g. Coffee Lab",
      periodLabel: "Period",
      periodPlaceholder: "e.g. March 2022 – present",
      storyPrompt: "What did you do as {0}?",
      storyHint: "Write it the way you'd tell a friend. Turning it into a CV is my job.",
      storyLabel: "In your own words",
      storyPlaceholder: "Made the coffee, ran the till, trained two new people…",
      moreRolesPrompt: "Was there another job before that one?",
      firstSchoolPrompt: "What did you study?",
      firstSchoolHint: "Skip it if you didn't — it isn't required.",
      nextSchoolPrompt: "Anything else you studied?",
      degreeLabel: "Qualification",
      degreePlaceholder: "e.g. BSc Hospitality Management",
      institutionLabel: "Institution",
      institutionPlaceholder: "e.g. AUTH",
      moreSchoolsPrompt: "Is there another one?",
      skillsPrompt: "What can you do?",
      skillsHint: "Just list them, separated by commas. I'll tidy them up.",
      skillsLabel: "Skills",
      skillsPlaceholder: "e.g. Espresso, latte art, HACCP, till, Excel",
      languagesPrompt: "What languages do you speak?",
      languagesHint: "Add the level if you know it.",
      languagesLabel: "Languages",
      languagesPlaceholder: "e.g. English (good), German (basic)",
      extrasPrompt: "Anything else worth including?",
      extrasHint: "Certifications, courses, volunteering, side projects — or skip it.",
      extrasLabel: "Anything else",
      extrasPlaceholder: "e.g. HACCP certification 2023, volunteered at a coffee festival",
      groupTarget: "Target",
      groupExperience: "Experience",
      groupEducation: "Education",
      groupSkills: "Skills",
      groupExtras: "Extras",
      previewTitle: "Your CV",
      previewEmpty: "Whatever you answer shows up here.",
      pendingTitle: "These go in too",
      readyTitle: "That's everything",
      readyBody:
        "I'll write it up as a proper CV — action verbs, the job ad's vocabulary, and nothing added that you didn't tell me.",
      buildButton: "Build my CV",
      reviewAnswers: "Review the answers",
      notEnough: "Tell me about one job or your studies first.",
      restart: "Start over",
      restartConfirm: "Clear everything you've answered?",
      replaceConfirm:
        "You already have a CV in the editor and this will replace it. Continue?",
      importProfile: "Fill in from my profile",
      importProfileHint: "Pick what should come over, so you don't type it twice.",
      importChoose: "Choose what comes over",
      importedProfile: "Filled in {0} answers from your profile",
      importedProfileHint: "Switch it off to take them back out. Anything you've changed since stays.",
      sourceJob: "Job",
      sourceStudy: "Studied",
      sourceSkills: "Skills",
      sourceLanguages: "Languages",
      sourceExtras: "Other",
    },
    cvisor: {
      brand: "CVisor",
      tryButton: "Try CVisor",
      openButton: "Create with CVisor",
      improveButton: "Improve",
      improving: "Writing…",
      suggestionTitle: "CVisor's suggestion",
      acceptSuggestion: "Keep it",
      discardSuggestion: "Discard",
      regenerateSuggestion: "Rewrite",
      generateButton: "Write my CV",
      generating: "Working…",
      errorMissingFields: "Fill in your details before continuing.",
      errorTooLong: "That text is too long. Trim it a little.",
      errorRateLimited: "You have hit today's usage limit. Try again later.",
      errorRateLimitedInHours: "You have hit today's usage limit. Try again in {v} hours.",
      errorRateLimitedInOneHour: "You have hit today's usage limit. Try again in 1 hour.",
      errorRefused: "CVisor could not process that text.",
      errorUnavailable: "The AI service is temporarily unavailable. Try again shortly.",
      errorGeneric: "Something went wrong. Try again.",
      title: "CVisor",
      runningTitle: "CVisor is working",
      runningSteps: [
        "Reading the job ad and your details",
        "Writing the first draft",
        "Checking for invented facts and weak wording",
        "Rewriting whatever failed the check",
      ],
      verified: "Passed every check",
      verifiedHint: "Every employer, skill and figure was verified against your own text.",
      unverified: "Some issues remain",
      unverifiedHint:
        "CVisor ran out of rounds before fixing everything. The CV is ready, but look at the points below before you send it anywhere.",
      fabricationTitle: "I couldn't find these in your own words",
      fabricationHint:
        "You never mentioned them, so don't leave them as they are: delete or correct them in the editor.",
      blockingLeft: "{0} points still fail the quality checks. CVscan shows them in full.",
      changesTitle: "What it did",
      apply: "Apply to my CV",
      back: "Back",
      close: "Close",
      retry: "Try again",
    },
    cvfix: {
      badge: "CVfix",
      title: "Let's fix it",
      body: "First CVfix untangles your file's structure and puts the content into the right fields — this step changes no wording at all, and every sentence is automatically verified to appear verbatim in your original. Then it proposes improvements to the wording, one at a time, for you to accept or skip.",
      button: "Fix it with CVfix",
      running: "CVfix is working…",
      runningRound: "Round",
      cancel: "Cancel",
      windowTitle: "CVfix",
      windowIntro:
        "It reads your CV against the same standards CVscan grades it by, and proposes specific corrections.",
      scanning: "Reading your CV…",
      reviewHint: "Nothing is applied unless you approve it. See what each change replaces and keep the ones you want.",
      noChangesTitle: "Nothing worth proposing",
      noChangesBody:
        "Your CV clears the checks CVscan measures. If you target a different job ad, run CVfix again to tailor it to that one.",
      before: "Before",
      after: "After",
      addition: "New line",
      accept: "Apply",
      accepted: "Will be applied",
      skip: "Skip",
      skipped: "Skipped",
      acceptAll: "Select all",
      applyCount: "Apply {0} changes",
      applyOne: "Apply 1 change",
      applyNone: "Pick at least one",
      close: "Close",
      metricVerbs: "open with a verb",
      metricCoverage: "job ad coverage",
      metricBullets: "bullets",
      toolbarButton: "CVfix",
      targetLabel: "The job you're targeting",
      targetPlaceholder: "Paste the ad here, so the wording is matched to it.",
      targetNone: "No job ad — these suggestions are about the CV in general.",
      targetSet: "Tailored to the job ad you gave.",
      targetAdd: "Add a job ad",
      targetChange: "Change",
      rerun: "Run again",
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
    skillSuggestions: {
      label: "Suggested skills from the job ad — tap to add:",
    },
    auth: {
      signIn: "Sign in with Google",
      signingIn: "Signing in…",
      signOut: "Sign out",
      deleteAccount: "Delete account",
      deleteAccountConfirm: "This permanently deletes your account and every CV saved in it. This cannot be undone. Continue?",
      deleteAccountDone: "Your account has been deleted.",
      deleteAccountError: "Deletion failed. Please try again or email us.",
    },
    myCvsPage: {
      title: "My CVs",
      subtitle: "The CVs you've saved to your account.",
      signInPrompt: "Sign in with Google to save CVs and reopen them from any device.",
      empty: "You haven't saved any CVs yet.",
      loading: "Loading…",
      untitled: "Untitled",
      updated: "Last edited",
      open: "Open",
      duplicate: "Duplicate",
      duplicatePrompt: "Name for the new copy:",
      rename: "Rename",
      renamePrompt: "New name:",
      delete: "Delete",
      deleteConfirm: "Permanently delete this CV?",
      share: "Public link",
      shareOn: "On — visible to anyone with the link",
      shareOff: "Off",
      copyLink: "Copy link",
      linkCopied: "Link copied.",
      limitReached: "You've reached your saved-CV limit.",
      loadError: "Couldn't load your CVs.",
      actionError: "Something went wrong. Please try again.",
      newCta: "Create new",
    },
    profile: {
      navLink: "My profile",
      title: "My profile",
      subtitle:
        "Write everything down once — every job, every qualification, every skill. Then each CV just picks what belongs in it, and you never type any of it twice.",
      signInPrompt: "Sign in with Google to build your profile.",
      loading: "Loading…",
      loadError: "Couldn't load your profile.",
      saving: "Saving…",
      saved: "Saved",
      saveError: "Couldn't save",
      completeTitle: "Profile completeness",
      completeHint: "The fuller your profile, the less you have to write for each new CV.",
      completeDone: "Your profile is complete. Every new CV now starts ready.",
      missingLabel: "Still missing:",
      checks: {
        name: "Full name",
        jobTitle: "Job title",
        email: "Email",
        phone: "Phone",
        summary: "Summary",
        experience: "At least one role",
        education: "At least one qualification",
        skills: "At least five skills",
        languages: "At least one language",
        photo: "Photo",
      },
      importButton: "Import from profile",
      importTitle: "Import from profile",
      importSubtitle: "Pick what goes into this CV.",
      importEmpty: "Nothing in your profile for this section — or it is all in the CV already.",
      importAll: "Select all",
      importClear: "Clear",
      importConfirm: "Import ({v})",
      importCancel: "Cancel",
      saveBack: "{v} of these aren't in your profile.",
      saveBackButton: "Save to profile",
      saveBackDone: "Added to your profile.",
      openBuilder: "Create a CV",
    },
    legal: {
      privacyLink: "Privacy",
      termsLink: "Terms",
      backHome: "← Home",
      disclaimer: "This is a good-faith, plain-language description of how CVsible works — it is not legal advice.",
    },
    cvHistory: {
      toggle: "Application history",
      empty: "You haven't logged any applications yet.",
      add: "Add",
      company: "Company",
      role: "Role",
      date: "Date",
      url: "Job ad link (optional)",
      note: "Note (optional)",
      viewAd: "Job ad",
      status: {
        sent: "Sent",
        interviewing: "Interviewing",
        offer: "Offer",
        rejected: "Rejected",
        no_response: "No response",
      },
    },
    publicCv: {
      badge: "Public CV via CVsible",
      notFound: "This link is no longer active, or never existed.",
      loading: "Loading CV…",
      cta: "Build your own for free on CVsible",
      download: "Download PDF",
    },
    support: {
      footerLink: "Support CVsible ☕",
      badgeLabel: "Support CVsible",
      modalTitle: "Your CV is ready! 🎉",
      modalBody: "If CVsible was useful to you, a small tip helps us keep it free for everyone.",
      modalClose: "Close",
      qrHint: "Scan to pay from your phone",
      primaryButton: "Buy us a coffee ☕",
      secondaryButton: "Maybe after I land the job 😉",
    },
  },
};
