import { describe, it, expect } from "vitest";
import { createEmptyProfile } from "../data/defaultData";
import { createId } from "../utils/id";
import { profileCompleteness, PROFILE_CHECKS } from "./completeness";
import type { UserProfile } from "../types";

function withSkills(profile: UserProfile, count: number): UserProfile {
  return {
    ...profile,
    skills: Array.from({ length: count }, (_, index) => ({
      id: createId(),
      name: `Skill ${index + 1}`,
      level: 70,
      category: "",
    })),
  };
}

describe("profileCompleteness", () => {
  it("reports 0% for a blank profile and lists every check as missing", () => {
    const result = profileCompleteness(createEmptyProfile());
    expect(result.percent).toBe(0);
    expect(result.missing).toEqual([...PROFILE_CHECKS]);
    expect(result.done).toEqual([]);
  });

  it("counts a filled name and job title", () => {
    const base = createEmptyProfile();
    const result = profileCompleteness({
      ...base,
      personalInfo: { ...base.personalInfo, fullName: "Jane Smith", jobTitle: "Barista" },
    });
    expect(result.done).toContain("name");
    expect(result.done).toContain("jobTitle");
    expect(result.percent).toBe(20);
  });

  it("ignores whitespace-only values", () => {
    const base = createEmptyProfile();
    const result = profileCompleteness({
      ...base,
      personalInfo: { ...base.personalInfo, fullName: "   " },
    });
    expect(result.missing).toContain("name");
  });

  it("counts a contact only when it has a value", () => {
    const base = createEmptyProfile();
    expect(profileCompleteness(base).missing).toContain("email");

    const filled: UserProfile = {
      ...base,
      personalInfo: {
        ...base.personalInfo,
        contacts: base.personalInfo.contacts.map((contact) =>
          contact.type === "email" ? { ...contact, value: "jane@example.com" } : contact,
        ),
      },
    };
    expect(profileCompleteness(filled).done).toContain("email");
  });

  it("wants five skills before the skills check passes", () => {
    const base = createEmptyProfile();
    expect(profileCompleteness(withSkills(base, 4)).missing).toContain("skills");
    expect(profileCompleteness(withSkills(base, 5)).done).toContain("skills");
  });

  it("does not count blank rows the user added but never filled in", () => {
    const base = createEmptyProfile();
    const withBlanks: UserProfile = {
      ...base,
      experience: [
        { id: createId(), role: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" },
      ],
    };
    expect(profileCompleteness(withBlanks).missing).toContain("experience");
  });

  it("reaches 100% once every check is satisfied", () => {
    const base = createEmptyProfile();
    const full: UserProfile = {
      ...withSkills(base, 5),
      personalInfo: {
        ...base.personalInfo,
        fullName: "Jane Smith",
        jobTitle: "Barista",
        summary: "<p>Ten years behind the bar.</p>",
        contacts: base.personalInfo.contacts.map((contact) =>
          contact.type === "email"
            ? { ...contact, value: "jane@example.com" }
            : contact.type === "phone"
              ? { ...contact, value: "+30 6900000000" }
              : contact,
        ),
      },
      photo: "data:image/png;base64,AAAA",
      experience: [
        {
          id: createId(),
          role: "Barista",
          company: "Coffee Lab",
          location: "Athens",
          startDate: "2020-01",
          endDate: "",
          current: true,
          description: "",
        },
      ],
      education: [
        {
          id: createId(),
          degree: "BSc",
          institution: "University",
          location: "",
          startDate: "2014-09",
          endDate: "2018-06",
          current: false,
          expectedGraduation: "",
          description: "",
        },
      ],
      languages: [{ id: createId(), name: "English", level: "Fluent" }],
    };

    const result = profileCompleteness(full);
    expect(result.percent).toBe(100);
    expect(result.missing).toEqual([]);
  });
});
