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

export type ThemeColorId =
  | "berry"
  | "teal"
  | "navy"
  | "plum"
  | "forest"
  | "slate"
  | "custom";

export interface CvData {
  themeColor: string;
  showPhoto: boolean;
  photo: string | null;
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
}
