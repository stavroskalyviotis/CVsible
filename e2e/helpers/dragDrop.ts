import type { Locator } from "@playwright/test";

/** Playwright's locator.dragTo() drives mouse events and doesn't reliably
 *  trigger the browser's native HTML5 drag-and-drop (draggable="true") event
 *  sequence under CDP automation. Dispatching the DragEvents directly is the
 *  documented workaround, and matches exactly what EntryCard/SectionOrderList
 *  listen for (dragstart on the handle, dragover + drop on the container). */
export async function simulateHtml5Drag(source: Locator, target: Locator): Promise<void> {
  const page = source.page();
  await page.evaluate(
    ([sourceEl, targetEl]) => {
      const dataTransfer = new DataTransfer();
      sourceEl.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer }));
      targetEl.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer }));
      targetEl.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
      sourceEl.dispatchEvent(new DragEvent("dragend", { bubbles: true, cancelable: true, dataTransfer }));
    },
    [await source.elementHandle(), await target.elementHandle()],
  );
}
