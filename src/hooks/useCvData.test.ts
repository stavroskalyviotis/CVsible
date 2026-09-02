import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StrictMode } from "react";
import { act, renderHook } from "@testing-library/react";
import { useCvData } from "./useCvData";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCvData — undo/redo", () => {
  it("starts with nothing to undo or redo", () => {
    const { result } = renderHook(() => useCvData());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("does not show a phantom undo step under React StrictMode's dev-only double-mount", () => {
    // Regression test: StrictMode intentionally runs mount effects twice
    // (setup -> cleanup -> setup) against the same initial data. A hook that
    // tracks "first run" with a plain ref (instead of comparing data) mistakes
    // the second simulated mount for a real edit and enables Undo for nothing.
    const { result } = renderHook(() => useCvData(), { wrapper: StrictMode });
    expect(result.current.canUndo).toBe(false);
  });

  it("marks canUndo true immediately on the first edit (pending, pre-coalesce)", () => {
    const { result } = renderHook(() => useCvData());
    act(() => result.current.setThemeColor("#112233"));
    expect(result.current.canUndo).toBe(true);
  });

  it("undo reverts a single committed edit and enables redo", () => {
    const { result } = renderHook(() => useCvData());
    act(() => result.current.setThemeColor("#112233"));
    act(() => vi.advanceTimersByTime(700)); // past COALESCE_MS, checkpoint committed

    act(() => result.current.undo());
    expect(result.current.data.themeColor).not.toBe("#112233");
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.redo());
    expect(result.current.data.themeColor).toBe("#112233");
    expect(result.current.canRedo).toBe(false);
  });

  it("collapses a burst of rapid edits into a single undo step", () => {
    const { result } = renderHook(() => useCvData());
    const original = result.current.data.themeColor;

    act(() => result.current.setThemeColor("#111111"));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setThemeColor("#222222"));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setThemeColor("#333333"));
    act(() => vi.advanceTimersByTime(700)); // now settle past COALESCE_MS

    expect(result.current.data.themeColor).toBe("#333333");
    act(() => result.current.undo());
    // One undo should return all the way to before the whole burst, not to "#222222".
    expect(result.current.data.themeColor).toBe(original);
    expect(result.current.canUndo).toBe(false);
  });

  it("undo works even mid-burst, before the coalesce timer has fired", () => {
    const { result } = renderHook(() => useCvData());
    const original = result.current.data.themeColor;

    act(() => result.current.setThemeColor("#111111"));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setThemeColor("#222222"));
    // No advance past COALESCE_MS: the pending edit was never committed to `past`.

    act(() => result.current.undo());
    expect(result.current.data.themeColor).toBe(original);
  });

  it("a fresh edit after undo clears the redo stack", () => {
    const { result } = renderHook(() => useCvData());
    act(() => result.current.setThemeColor("#111111"));
    act(() => vi.advanceTimersByTime(700));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.setThemeColor("#999999"));
    expect(result.current.canRedo).toBe(false);
  });

  it("redo is a no-op with nothing to redo", () => {
    const { result } = renderHook(() => useCvData());
    const before = result.current.data;
    act(() => result.current.redo());
    expect(result.current.data).toBe(before);
  });

  it("list helpers (experience.add) participate in undo like any other edit", () => {
    const { result } = renderHook(() => useCvData());
    act(() =>
      result.current.experience.add({
        id: "e1",
        role: "Engineer",
        company: "Acme",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      }),
    );
    act(() => vi.advanceTimersByTime(700));
    expect(result.current.data.experience).toHaveLength(1);

    act(() => result.current.undo());
    expect(result.current.data.experience).toHaveLength(0);
  });

  it("persists to localStorage after each edit", () => {
    const { result } = renderHook(() => useCvData());
    act(() => result.current.setThemeColor("#abcabc"));
    const stored = JSON.parse(localStorage.getItem("cvsible:cv-data") ?? "null");
    expect(stored?.themeColor).toBe("#abcabc");
  });
});
