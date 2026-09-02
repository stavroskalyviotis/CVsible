import type { LanguageCode } from "../types";

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  sections: LegalSection[];
}

const CONTACT_EMAIL = "stavroskaliviotis97@gmail.com";

export const PRIVACY_CONTENT: Record<LanguageCode, LegalDoc> = {
  el: {
    title: "Πολιτική Απορρήτου",
    updated: "Τελευταία ενημέρωση: Σεπτέμβριος 2026",
    sections: [
      {
        heading: "Χωρίς λογαριασμό",
        body: [
          "Αν δεν συνδεθείς, το βιογραφικό που φτιάχνεις μένει αποκλειστικά στη συσκευή σου (localStorage του browser). Δεν φτάνει σε κανέναν server μας παρά μόνο όταν εσύ ζητήσεις κάτι από τον CVisor/CVfix ή τον έλεγχο ATS με upload αρχείου.",
          "Ο δεικτης/έλεγχος ATS πάνω στο βιογραφικό που φτιάχνεις (το ποσοστό στην κορυφή) τρέχει εξ ολοκλήρου στον browser σου — δεν στέλνεται πουθενά.",
        ],
      },
      {
        heading: "Λειτουργίες τεχνητής νοημοσύνης (CVisor, CVfix)",
        body: [
          "Όταν χρησιμοποιείς τον CVisor ή το CVfix, το κείμενο που δίνεις (εμπειρία, αγγελία, ή το υπάρχον βιογραφικό σου) στέλνεται στους δικούς μας servers και από εκεί στο API της Anthropic (Claude) για να παραχθεί το αποτέλεσμα.",
          "Δεν αποθηκεύουμε αυτό το περιεχόμενο μόνιμα στους servers μας και δεν κρατάμε logs με το περιεχόμενο του βιογραφικού σου — μόνο τεχνικά σφάλματα, χωρίς το κείμενο.",
          "Για την προστασία από κατάχρηση, κρατάμε έναν απλό μετρητή χρήσεων (πόσες φορές χρησιμοποιήθηκε η λειτουργία σήμερα) συνδεδεμένο με τη διεύθυνση IP σου ή τον λογαριασμό σου — όχι το περιεχόμενο.",
        ],
      },
      {
        heading: "Αν συνδεθείς με Google",
        body: [
          "Παίρνουμε από τη Google το email, το όνομα και τη φωτογραφία προφίλ σου — όχι τον κωδικό σου. Η σύνδεση γίνεται μέσω του Supabase Auth.",
          "Αν αποθηκεύσεις ένα βιογραφικό στον λογαριασμό σου, το περιεχόμενό του αποθηκεύεται στη βάση δεδομένων μας (Supabase/Postgres), συνδεδεμένο μόνο με τον δικό σου λογαριασμό. Κανένας άλλος χρήστης δεν μπορεί να το δει.",
          "Αν ενεργοποιήσεις «Δημόσιο σύνδεσμο» για ένα βιογραφικό, όποιος έχει αυτόν τον συγκεκριμένο σύνδεσμο μπορεί να το δει — σαν σύνδεσμο κοινοποίησης του Google Docs. Δεν το δημοσιεύουμε ούτε το κάνουμε αναζητήσιμο εμείς.",
        ],
      },
      {
        heading: "Ποιοι άλλοι βλέπουν δεδομένα",
        body: [
          "Anthropic — για να παράγει κείμενο μέσω του CVisor/CVfix.",
          "Supabase — φιλοξενεί τη σύνδεση με Google και τα αποθηκευμένα βιογραφικά.",
          "Upstash — κρατάει τον μετρητή χρήσεων για την προστασία από κατάχρηση.",
          "Vercel — φιλοξενεί το site, και μετράει βασικά, ανώνυμα στατιστικά επισκεψιμότητας/απόδοσης (χωρίς διαφημιστικά cookies ή cross-site tracking).",
          "Δεν πουλάμε δεδομένα σε κανέναν, και δεν υπάρχει διαφήμιση στο CVsible.",
          "Κάθε πάροχος έχει τη δική του πολιτική απορρήτου για το πώς επεξεργάζεται δεδομένα ως εκτελών επεξεργασία για λογαριασμό μας.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "Δεν χρησιμοποιούμε διαφημιστικά ή tracking cookies. Η σύνδεσή σου κρατιέται στο localStorage του browser (όχι cookie), όπως και η προτίμηση γλώσσας.",
        ],
      },
      {
        heading: "Πόσο καιρό κρατάμε τα δεδομένα",
        body: [
          "Βιογραφικό που φτιάχνεις χωρίς λογαριασμό: μένει στη συσκευή σου όσο δεν καθαρίζεις τα δεδομένα του browser — εμείς δεν έχουμε καν αντίγραφο.",
          "Αποθηκευμένο βιογραφικό σε λογαριασμό: παραμένει όσο δεν το διαγράφεις εσύ ή δεν διαγράψεις τον λογαριασμό σου.",
          "Κείμενο που στέλνεις στον CVisor/CVfix: χρησιμοποιείται μόνο για να παραχθεί η απάντηση εκείνη τη στιγμή, δεν αποθηκεύεται μόνιμα από εμάς.",
        ],
      },
      {
        heading: "Τα δικαιώματά σου",
        body: [
          "Μπορείς να κατεβάσεις το βιογραφικό σου ως αρχείο JSON ανά πάσα στιγμή (κουμπί λήψης στον editor) — αυτό είναι το δικαίωμα φορητότητας δεδομένων.",
          "Μπορείς να διαγράψεις οποιοδήποτε αποθηκευμένο βιογραφικό από τη σελίδα «Τα βιογραφικά μου».",
          "Μπορείς να διαγράψεις ολόκληρο τον λογαριασμό σου (και ό,τι έχει αποθηκευτεί σε αυτόν) από την ίδια σελίδα — είναι μόνιμο και άμεσο.",
          `Για οτιδήποτε άλλο σχετικό με τα δεδομένα σου, γράψε μας στο ${CONTACT_EMAIL}.`,
        ],
      },
      {
        heading: "Ασφάλεια & τοποθεσία δεδομένων",
        body: [
          "Χρησιμοποιούμε κρυπτογραφημένη σύνδεση (HTTPS) παντού, και κανόνες πρόσβασης στη βάση δεδομένων (Row Level Security) που επιτρέπουν σε κάθε χρήστη να βλέπει μόνο τα δικά του δεδομένα.",
          "Οι πάροχοι που χρησιμοποιούμε (Anthropic, Supabase, Vercel, Upstash) μπορεί να επεξεργάζονται δεδομένα σε servers εκτός Ελλάδας (ΕΕ/ΗΠΑ), σύμφωνα με τους δικούς τους όρους.",
        ],
      },
      {
        heading: "Ανήλικοι",
        body: ["Το CVsible δεν απευθύνεται σε παιδιά κάτω των 16 ετών."],
      },
      {
        heading: "Αλλαγές",
        body: ["Αν αλλάξει ουσιαστικά αυτή η πολιτική, θα ενημερωθεί η ημερομηνία στην κορυφή της σελίδας."],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: September 2026",
    sections: [
      {
        heading: "Without an account",
        body: [
          "If you don't sign in, the CV you build stays only on your device (your browser's localStorage). It never reaches our servers unless you actively use CVisor/CVfix or upload a file for the ATS check.",
          "The ATS score shown while you build (the number at the top) is computed entirely in your browser — nothing is sent anywhere for it.",
        ],
      },
      {
        heading: "AI features (CVisor, CVfix)",
        body: [
          "When you use CVisor or CVfix, the text you provide (your background, a job ad, or your existing CV) is sent to our servers and from there to Anthropic's API (Claude) to produce the result.",
          "We don't permanently store that content on our servers, and we don't log the content of your CV — only technical error events, without the text itself.",
          "To prevent abuse, we keep a simple usage counter (how many times a feature was used today) tied to your IP address or account — not the content.",
        ],
      },
      {
        heading: "If you sign in with Google",
        body: [
          "We receive your email, name, and profile photo from Google — never your password. Sign-in is handled by Supabase Auth.",
          "If you save a CV to your account, its content is stored in our database (Supabase/Postgres), tied only to your account. No other user can see it.",
          "If you turn on a \"Public link\" for a CV, anyone with that specific link can view it — like a Google Docs share link. We don't publish it anywhere or make it searchable ourselves.",
        ],
      },
      {
        heading: "Who else sees data",
        body: [
          "Anthropic — to generate text through CVisor/CVfix.",
          "Supabase — hosts Google sign-in and your saved CVs.",
          "Upstash — holds the usage counter used to prevent abuse.",
          "Vercel — hosts the site, and measures basic, anonymous traffic/performance stats (no advertising cookies or cross-site tracking).",
          "We never sell data, and there is no advertising on CVsible.",
          "Each provider has its own privacy policy for how it processes data as our data processor.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We don't use advertising or tracking cookies. Your sign-in session is kept in your browser's localStorage (not a cookie), as is your language preference.",
        ],
      },
      {
        heading: "How long we keep data",
        body: [
          "A CV built without an account: stays on your device for as long as you don't clear your browser data — we don't even have a copy.",
          "A CV saved to an account: stays until you delete it, or delete your account.",
          "Text sent to CVisor/CVfix: used only to produce that one response, we don't store it permanently.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can download your CV as a JSON file at any time (the download button in the editor) — that's your data-portability right, self-serve.",
          "You can delete any saved CV from the \"My CVs\" page.",
          "You can delete your entire account, and everything saved in it, from the same page — this is permanent and immediate.",
          `For anything else about your data, write to us at ${CONTACT_EMAIL}.`,
        ],
      },
      {
        heading: "Security & data location",
        body: [
          "We use encrypted connections (HTTPS) throughout, and database access rules (Row Level Security) that let each user see only their own data.",
          "The providers we use (Anthropic, Supabase, Vercel, Upstash) may process data on servers outside Greece (EU/US), under their own terms.",
        ],
      },
      {
        heading: "Children",
        body: ["CVsible is not directed at children under 16."],
      },
      {
        heading: "Changes",
        body: ["If this policy changes materially, the date at the top of this page will be updated."],
      },
    ],
  },
};

export const TERMS_CONTENT: Record<LanguageCode, LegalDoc> = {
  el: {
    title: "Όροι Χρήσης",
    updated: "Τελευταία ενημέρωση: Σεπτέμβριος 2026",
    sections: [
      {
        heading: "Η υπηρεσία",
        body: [
          "Το CVsible είναι δωρεάν εργαλείο δημιουργίας βιογραφικών, ελέγχου ATS-συμβατότητας, και AI-βοηθός κειμένου. Παρέχεται «ως έχει», χωρίς εγγύηση διαθεσιμότητας ή καταλληλότητας για συγκεκριμένο σκοπό.",
          "Σήμερα όλες οι λειτουργίες είναι δωρεάν. Στο μέλλον ενδέχεται να προστεθούν πληρωμένα πλάνα ή όρια χρήσης, κυρίως γύρω από τις λειτουργίες τεχνητής νοημοσύνης — αν συμβεί, θα ενημερωθείς καθαρά πριν χρεωθείς οτιδήποτε, και θα ενημερωθούν οι παρόντες όροι αναλόγως.",
        ],
      },
      {
        heading: "Το περιεχόμενό σου",
        body: [
          "Το βιογραφικό που φτιάχνεις είναι δικό σου — εσύ είσαι υπεύθυνος/η για την ακρίβεια των στοιχείων που καταχωρείς.",
          "Ο CVisor και το CVfix προσπαθούν να μην εφευρίσκουν γεγονότα που δεν έχεις γράψει, αλλά τα αποτελέσματα τεχνητής νοημοσύνης μπορεί περιστασιακά να μην είναι τέλεια — έλεγξέ τα πριν τα χρησιμοποιήσεις σε αίτηση εργασίας.",
        ],
      },
      {
        heading: "Λογαριασμός & αποθηκευμένα βιογραφικά",
        body: [
          "Η σύνδεση γίνεται μέσω του λογαριασμού Google σου. Είσαι υπεύθυνος/η για την ασφάλεια της συσκευής/λογαριασμού σου.",
          "Υπάρχει όριο στον αριθμό αποθηκευμένων βιογραφικών ανά λογαριασμό, για λόγους διαχείρισης πόρων.",
          "Αν ενεργοποιήσεις δημόσιο σύνδεσμο, είσαι εσύ υπεύθυνος/η για το ποιον ενημερώνεις γι' αυτόν.",
        ],
      },
      {
        heading: "Αποδεκτή χρήση",
        body: [
          "Μην προσπαθήσεις να παρακάμψεις τα όρια χρήσης, να υπερφορτώσεις το σύστημα, ή να χρησιμοποιήσεις τις λειτουργίες AI για να φτιάξεις παραπλανητικά ή δόλια έγγραφα.",
          "Διατηρούμε το δικαίωμα να περιορίσουμε ή να αναστείλουμε πρόσβαση σε λογαριασμό που κάνει κατάχρηση της υπηρεσίας.",
        ],
      },
      {
        heading: "Πνευματική ιδιοκτησία",
        body: [
          "Το περιεχόμενο του βιογραφικού σου και το εξαγόμενο PDF είναι δικά σου, να τα χρησιμοποιήσεις ελεύθερα.",
          "Ο κώδικας, το όνομα CVsible και ο σχεδιασμός των προτύπων ανήκουν σε εμάς.",
        ],
      },
      {
        heading: "Περιορισμός ευθύνης",
        body: [
          "Η υπηρεσία παρέχεται δωρεάν. Στο μέγιστο βαθμό που επιτρέπει ο νόμος, δεν φέρουμε ευθύνη για έμμεσες ζημιές που προκύπτουν από τη χρήση της.",
        ],
      },
      {
        heading: "Τερματισμός",
        body: [
          "Μπορούμε να διακόψουμε ή να τροποποιήσουμε λειτουργίες της υπηρεσίας οποτεδήποτε. Μπορείς να διαγράψεις τον λογαριασμό σου οποτεδήποτε.",
        ],
      },
      {
        heading: "Εφαρμοστέο δίκαιο",
        body: ["Οι παρόντες όροι διέπονται από το Ελληνικό δίκαιο."],
      },
      {
        heading: "Επικοινωνία",
        body: [`Ερωτήσεις για αυτούς τους όρους: ${CONTACT_EMAIL}.`],
      },
    ],
  },
  en: {
    title: "Terms of Use",
    updated: "Last updated: September 2026",
    sections: [
      {
        heading: "The service",
        body: [
          "CVsible is a free resume builder, ATS-compatibility checker, and AI writing assistant. It's provided \"as is\", with no guarantee of availability or fitness for a particular purpose.",
          "Everything is free today. In the future we may introduce paid plans or usage limits, mainly around the AI features — if that happens, you'll be clearly notified before you're ever charged, and these terms will be updated accordingly.",
        ],
      },
      {
        heading: "Your content",
        body: [
          "The CV you build is yours — you're responsible for the accuracy of what you enter.",
          "CVisor and CVfix try not to invent facts you didn't write, but AI output can occasionally be imperfect — review it before using it in a job application.",
        ],
      },
      {
        heading: "Account & saved CVs",
        body: [
          "Sign-in uses your Google account. You're responsible for keeping your device/account secure.",
          "There's a cap on the number of saved CVs per account, for resource-management reasons.",
          "If you turn on a public link, you're responsible for who you share it with.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "Don't try to bypass usage limits, overload the system, or use the AI features to produce misleading or fraudulent documents.",
          "We reserve the right to limit or suspend access for an account that abuses the service.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "Your CV's content and the exported PDF are yours to use freely.",
          "The code, the CVsible name, and the template designs belong to us.",
        ],
      },
      {
        heading: "Limitation of liability",
        body: [
          "The service is provided free of charge. To the maximum extent permitted by law, we're not liable for indirect damages arising from its use.",
        ],
      },
      {
        heading: "Termination",
        body: [
          "We may discontinue or change features of the service at any time. You may delete your account at any time.",
        ],
      },
      {
        heading: "Governing law",
        body: ["These terms are governed by Greek law."],
      },
      {
        heading: "Contact",
        body: [`Questions about these terms: ${CONTACT_EMAIL}.`],
      },
    ],
  },
};
