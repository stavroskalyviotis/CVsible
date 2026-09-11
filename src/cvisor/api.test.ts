import { describe, it, expect, vi, afterEach } from "vitest";
import { suggestSectionText } from "./api";

function respondWith(suggestion: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ data: { suggestion } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

async function suggest(): Promise<string> {
  return suggestSectionText({ section: "summary", text: "", language: "en" });
}

afterEach(() => vi.unstubAllGlobals());

/** The model writes this text, and it writes it while reading a job ad the
 *  candidate pasted in from somewhere on the internet. Neither half is ours,
 *  and the result is rendered as HTML and then stored, so it is cleaned the
 *  moment it arrives rather than at each of the places it ends up. */
describe("suggestSectionText", () => {
  it("keeps the formatting a suggestion is allowed to use", async () => {
    respondWith("<ul><li>Ran the till <strong>daily</strong>.</li></ul>");
    expect(await suggest()).toBe("<ul><li>Ran the till <strong>daily</strong>.</li></ul>");
  });

  it("drops a script that came back with the suggestion", async () => {
    respondWith("<p>Hello</p><script>alert(1)</script>");
    const result = await suggest();
    expect(result).not.toContain("script");
    expect(result).toContain("Hello");
  });

  it("drops an event handler smuggled onto an allowed tag", async () => {
    respondWith('<p onclick="steal()">Hello</p>');
    const result = await suggest();
    expect(result).not.toContain("onclick");
    expect(result).toContain("Hello");
  });

  it("drops an image with an onerror payload, keeping the words around it", async () => {
    respondWith('<p>Before</p><img src="x" onerror="steal()"><p>After</p>');
    const result = await suggest();
    expect(result).not.toContain("onerror");
    expect(result).not.toContain("<img");
    expect(result).toContain("Before");
    expect(result).toContain("After");
  });

  it("drops a javascript: link but keeps its text", async () => {
    respondWith('<p>See <a href="javascript:steal()">this</a></p>');
    const result = await suggest();
    expect(result).not.toContain("javascript:");
    expect(result).toContain("this");
  });
});
