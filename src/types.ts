export type LanguageCode = "el" | "en";

export type ContactType =
  | "email"
  | "phone"
  | "location"
  | "website"
  | "linkedin"
  | "github"
  | "x"
  | "custom";

export interface ContactItem {
  id: string;
  type: ContactType;
  value: string;
  label: string;
}

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  summary: string;
  dateOfBirth: string;
  contacts: ContactItem[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  expectedGraduation: string;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number;
  /** Optional grouping label ("Kitchen", "Languages", "Frontend"). Empty for
   *  a skill the user never sorted — a CV with no categories at all still
   *  renders as one inline list, exactly as it did before. */
  category: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  link: string;
  description: string;
}

export interface SoftSkillItem {
  id: string;
  name: string;
}

export interface InterestItem {
  id: string;
  name: string;
}

export type ThemeColorId =
  | "berry"
  | "teal"
  | "navy"
  | "plum"
  | "forest"
  | "slate"
  | "custom";

export type FontFamily = "sans" | "serif" | "condensed";
export type Density = "compact" | "comfortable" | "spacious";

export type SidebarSectionType = "skills" | "softSkills" | "languages" | "interests";
export type MainSectionOrderType = "experience" | "education" | "projects" | "certifications";

/** Every reorderable section of the CV, in one namespace. `summary` is always
 *  first and is not part of the reorderable list. */
export type SectionKey = SidebarSectionType | MainSectionOrderType;

export type TemplateId = "aurora" | "meridian" | "atlas" | "compass";

/** How skill proficiency is rendered. Bars carry no meaning once a PDF is parsed,
 *  so the default is a plain text label. */
export type SkillDisplay = "none" | "text";

/** The sections a CV can pull entry-by-entry out of the master profile. */
export type ProfileListKey =
  | "experience"
  | "education"
  | "skills"
  | "softSkills"
  | "languages"
  | "interests"
  | "certifications"
  | "projects";

/** The master profile: everything the person has ever done, written once and
 *  kept in one place. A CV is a curated subset of it — the profile holds the
 *  jobs, skills and studies that no single CV would ever show together, so
 *  nothing has to be typed twice. Carries no styling: templates, colours and
 *  section order belong to a document, not to a person. */
export interface UserProfile {
  personalInfo: PersonalInfo;
  photo: string | null;
  photoPosition: { x: number; y: number };
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  softSkills: SoftSkillItem[];
  languages: LanguageItem[];
  interests: InterestItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
}

export interface CvData {
  template: TemplateId;
  themeColor: string;
  fontFamily: FontFamily;
  density: Density;
  showPhoto: boolean;
  photo: string | null;
  photoPosition: { x: number; y: number };
  skillDisplay: SkillDisplay;
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  softSkills: SoftSkillItem[];
  languages: LanguageItem[];
  interests: InterestItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  /** Single ordered list of all sections. Sidebar templates split it by
   *  which sections their sidebar can host; single-column templates use it as-is. */
  sectionOrder: SectionKey[];
}
