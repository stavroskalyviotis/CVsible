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
    languages: string;
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
    languageName: string;
    languageLevel: string;
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
    languageName: string;
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
  languageLevels: string[];
  emptyStates: {
    experience: string;
    education: string;
    skills: string;
    languages: string;
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
      languages: "Γλώσσες",
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
      languageName: "Γλώσσα",
      languageLevel: "Επίπεδο",
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
      languageName: "π.χ. Αγγλικά",
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
    languageLevels: [
      "Βασικό",
      "Μέτριο",
      "Καλό",
      "Πολύ καλό",
      "Άριστο",
      "Μητρική γλώσσα",
    ],
    emptyStates: {
      experience: "Δεν έχεις προσθέσει ακόμα εργασιακή εμπειρία.",
      education: "Δεν έχεις προσθέσει ακόμα εκπαίδευση.",
      skills: "Δεν έχεις προσθέσει ακόμα δεξιότητες.",
      languages: "Δεν έχεις προσθέσει ακόμα γλώσσες.",
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
      languages: "Languages",
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
      languageName: "Language",
      languageLevel: "Level",
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
      languageName: "e.g. English",
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
    languageLevels: [
      "Basic",
      "Intermediate",
      "Good",
      "Fluent",
      "Excellent",
      "Native",
    ],
    emptyStates: {
      experience: "You haven't added any work experience yet.",
      education: "You haven't added any education yet.",
      skills: "You haven't added any skills yet.",
      languages: "You haven't added any languages yet.",
      certifications: "You haven't added any certifications yet.",
      projects: "You haven't added any projects yet.",
      contacts: "You haven't added any contact links yet.",
    },
  },
};
