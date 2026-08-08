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
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number;
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

export interface CvData {
  themeColor: string;
  fontFamily: FontFamily;
  density: Density;
  showPhoto: boolean;
  photo: string | null;
  photoPosition: { x: number; y: number };
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  softSkills: SoftSkillItem[];
  languages: LanguageItem[];
  interests: InterestItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  sidebarOrder: SidebarSectionType[];
  mainOrder: MainSectionOrderType[];
}
