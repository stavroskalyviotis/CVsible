export interface FillExperienceItem {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface FillEducationItem {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface FillSkillItem {
  name: string;
  level: number;
  relevant: boolean;
}

export interface FillNamedItem {
  name: string;
}

export interface FillRelevantNamedItem {
  name: string;
  relevant: boolean;
}

export interface FillLanguageItem {
  name: string;
  level: string;
}

export interface FillCertificationItem {
  title: string;
  issuer: string;
  date: string;
}

export interface FillProjectItem {
  title: string;
  link: string;
  bullets: string[];
}

export interface FillResult {
  summary: string;
  suggestedJobTitle: string;
  experience: FillExperienceItem[];
  education: FillEducationItem[];
  skills: FillSkillItem[];
  softSkills: FillRelevantNamedItem[];
  languages: FillLanguageItem[];
  interests: FillRelevantNamedItem[];
  certifications: FillCertificationItem[];
  projects: FillProjectItem[];
  suggestedSkills: FillNamedItem[];
  suggestedSoftSkills: FillNamedItem[];
  suggestedInterests: FillNamedItem[];
  experienceTips: string[];
  educationTips: string[];
  themeColor: string;
}

const DATE_DESCRIPTION = "Μορφή YYYY-MM (π.χ. 2022-06). Άφησέ το κενό string αν δεν είναι γνωστό.";

export function buildFillSchema(languageLevels: string[], themeColorIds: readonly string[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "summary",
      "suggestedJobTitle",
      "experience",
      "education",
      "skills",
      "softSkills",
      "languages",
      "interests",
      "certifications",
      "projects",
      "suggestedSkills",
      "suggestedSoftSkills",
      "suggestedInterests",
      "experienceTips",
      "educationTips",
      "themeColor",
    ],
    properties: {
      summary: {
        type: "string",
        description:
          "Σύντομο επαγγελματικό προφίλ (2-4 προτάσεις), προσαρμοσμένο στον στόχο. Απλό κείμενο ή βασικό HTML (<p>, <strong>).",
      },
      suggestedJobTitle: {
        type: "string",
        description:
          "Πρόταση για σύντομο επαγγελματικό τίτλο (π.χ. 'Senior Product Designer'), βασισμένη στην εμπειρία του χρήστη — ρεαλιστικός για το επίπεδό του, όχι απλή αντιγραφή τίτλου θέσης από τον στόχο αν δεν ταιριάζει.",
      },
      experience: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["role", "company", "location", "startDate", "endDate", "current", "bullets"],
          properties: {
            role: { type: "string" },
            company: { type: "string" },
            location: { type: "string" },
            startDate: { type: "string", description: DATE_DESCRIPTION },
            endDate: { type: "string", description: DATE_DESCRIPTION },
            current: { type: "boolean" },
            bullets: {
              type: "array",
              description:
                "3-5 σύντομα, ξεχωριστά bullet points με αρμοδιότητες/επιτεύγματα, απλό κείμενο (χωρίς HTML, χωρίς παύλα/bullet character στην αρχή).",
              items: { type: "string" },
            },
          },
        },
      },
      education: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["degree", "institution", "location", "startDate", "endDate", "current", "bullets"],
          properties: {
            degree: { type: "string" },
            institution: { type: "string" },
            location: { type: "string" },
            startDate: { type: "string", description: DATE_DESCRIPTION },
            endDate: { type: "string", description: DATE_DESCRIPTION },
            current: { type: "boolean" },
            bullets: {
              type: "array",
              description:
                "0-3 σύντομα bullet points (π.χ. βαθμός, διπλωματική, σχετικά μαθήματα) — μόνο αν προκύπτουν από το ΚΕΙΜΕΝΟ ΧΡΗΣΤΗ. Κενός πίνακας αν δεν υπάρχει τίποτα να προσθέσεις.",
              items: { type: "string" },
            },
          },
        },
      },
      skills: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "level", "relevant"],
          properties: {
            name: { type: "string" },
            level: {
              type: "integer",
              description:
                "Επίπεδο 0-100. Αν ο χρήστης ΔΕΝ ανέφερε πόσο καλά την κατέχει, βάλε ΠΑΝΤΑ 50 (ουδέτερο) — μην υποθέσεις ότι είναι αρχάριος ή έμπειρος.",
            },
            relevant: {
              type: "boolean",
              description:
                "true αν η δεξιότητα σχετίζεται/βοηθάει για αυτόν τον συγκεκριμένο στόχο. false ΜΟΝΟ αν πραγματικά δεν έχει καμία σχέση — όχι απλά επειδή δεν αναφέρεται ρητά (πολλές χρήσιμες δεξιότητες δεν αναφέρονται ρητά). Στην αμφιβολία, true.",
            },
          },
        },
      },
      softSkills: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "relevant"],
          properties: {
            name: { type: "string" },
            relevant: {
              type: "boolean",
              description:
                "true αν η ήπια δεξιότητα ταιριάζει/βοηθάει για αυτόν τον ΣΤΟΧΟ. false ΜΟΝΟ αν πραγματικά δεν σχετίζεται καθόλου. Στην αμφιβολία, true.",
            },
          },
        },
      },
      languages: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "level"],
          properties: {
            name: { type: "string" },
            level: {
              type: "string",
              enum: languageLevels,
              description:
                "Αν ο χρήστης ανέφερε ρητά επίπεδο, χρησιμοποίησέ το. Αν όχι, χρησιμοποίησε το μεσαίο/ουδέτερο επίπεδο της λίστας — ΠΟΤΕ μην υποθέσεις άπταιστο επίπεδο ή μητρική γλώσσα χωρίς ρητή αναφορά του χρήστη.",
            },
          },
        },
      },
      interests: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "relevant"],
          properties: {
            name: { type: "string" },
            relevant: {
              type: "boolean",
              description:
                "true αν το ενδιαφέρον σχετίζεται με τον ΣΤΟΧΟ ΚΑΙ είναι κατάλληλο για επαγγελματικό βιογραφικό. false αν δεν σχετίζεται καθόλου, Ή αν είναι ριψοκίνδυνο/αμφιλεγόμενο για βιογραφικό ανεξαρτήτως ΣΤΟΧΟΥ (π.χ. τζόγος, χρήση ουσιών, ακραίος πολιτικός/θρησκευτικός ακτιβισμός). Στην αμφιβολία για απλή μη-συνάφεια, true· στην αμφιβολία για επαγγελματική καταλληλότητα, false.",
            },
          },
        },
      },
      certifications: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "issuer", "date"],
          properties: {
            title: { type: "string" },
            issuer: { type: "string" },
            date: { type: "string", description: DATE_DESCRIPTION },
          },
        },
      },
      projects: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "link", "bullets"],
          properties: {
            title: { type: "string" },
            link: { type: "string" },
            bullets: {
              type: "array",
              description: "1-4 σύντομα bullet points: τι κάνει το έργο, τεχνολογίες, αποτέλεσμα. Απλό κείμενο, χωρίς HTML.",
              items: { type: "string" },
            },
          },
        },
      },
      suggestedSkills: {
        type: "array",
        description:
          "Επιπλέον δεξιότητες που θα ήταν λογικό να έχει κάποιος για αυτόν τον στόχο — προτάσεις για να επιλέξει ο χρήστης. ΜΗΝ συμπεριλάβεις καμία δεξιότητα που ήδη υπάρχει στο skills, ούτε παραλλαγή/συνώνυμό της (π.χ. αν υπάρχει ήδη 'Python', μην προτείνεις 'Python Programming' ή 'Προγραμματισμός Python').",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name"],
          properties: { name: { type: "string" } },
        },
      },
      suggestedSoftSkills: {
        type: "array",
        description:
          "Επιπλέον ήπιες δεξιότητες που θα ταίριαζαν για αυτόν τον στόχο — προτάσεις. ΜΗΝ συμπεριλάβεις καμία που ήδη προκύπτει από το κείμενο του χρήστη (softSkills), ούτε παραλλαγή/συνώνυμό της.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name"],
          properties: { name: { type: "string" } },
        },
      },
      suggestedInterests: {
        type: "array",
        description:
          "Ενδιαφέροντα που θα έδειχναν καλά για αυτή τη θέση/εταιρεία — προτάσεις. ΜΗΝ συμπεριλάβεις κανένα που ήδη ανέφερε ο χρήστης (interests), ούτε παραλλαγή/συνώνυμό του. Ρεαλιστικά και ταιριαστά, όχι γενικόλογα.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name"],
          properties: { name: { type: "string" } },
        },
      },
      experienceTips: {
        type: "array",
        description:
          "ΜΟΝΟ αν το ΚΕΙΜΕΝΟ ΧΡΗΣΤΗ δεν περιέχει καμία εργασιακή εμπειρία: 2-4 σύντομες, χρήσιμες συμβουλές (bullets) για το τι είδους εμπειρία/επιτεύγματα θα άξιζε να αναφέρει κάποιος για αυτόν τον στόχο. Είναι γενικές συμβουλές, ΟΧΙ ισχυρισμοί για τον συγκεκριμένο χρήστη. Αν το ΚΕΙΜΕΝΟ ΧΡΗΣΤΗ έχει ήδη εμπειρία, γύρισε κενό πίνακα.",
        items: { type: "string" },
      },
      educationTips: {
        type: "array",
        description:
          "ΜΟΝΟ αν το ΚΕΙΜΕΝΟ ΧΡΗΣΤΗ δεν περιέχει καμία εκπαίδευση: 2-4 σύντομες, χρήσιμες συμβουλές (bullets) για το τι είδους σπουδές/πιστοποιήσεις θα ενίσχυαν μια αίτηση για αυτή τη θέση. Γενικές συμβουλές, ΟΧΙ ισχυρισμοί για τον συγκεκριμένο χρήστη. Αν το ΚΕΙΜΕΝΟ ΧΡΗΣΤΗ έχει ήδη εκπαίδευση, γύρισε κενό πίνακα.",
        items: { type: "string" },
      },
      themeColor: {
        type: "string",
        description: "Προτεινόμενο χρώμα θέματος για το βιογραφικό, ταιριαστό με τον κλάδο/τόνο του στόχου.",
        enum: [...themeColorIds],
      },
    },
  } as const;
}

export const SUGGEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["suggestion"],
  properties: {
    suggestion: {
      type: "string",
      description: "Η βελτιωμένη εκδοχή του κειμένου, στην ίδια μορφή (απλό κείμενο ή HTML) με το αρχικό.",
    },
  },
} as const;

export interface SuggestResult {
  suggestion: string;
}
