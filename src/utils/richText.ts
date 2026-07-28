const ALLOWED_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "BR", "DIV", "P", "SPAN"]);

const SAFE_STYLE_VALUES: Record<string, RegExp> = {
  "font-weight": /^(bold|bolder|normal|[1-9]00)$/,
  "font-style": /^(italic|normal)$/,
  "text-decoration": /^(underline|line-through|none)$/,
  "text-decoration-line": /^(underline|line-through|none)$/,
};

function sanitizeStyle(style: string): string {
  return style
    .split(";")
    .map((declaration) => {
      const [rawProperty, ...rest] = declaration.split(":");
      const property = rawProperty?.trim().toLowerCase();
      const value = rest.join(":").trim().toLowerCase();
      if (!property || !value) return "";
      const pattern = SAFE_STYLE_VALUES[property];
      if (!pattern || !pattern.test(value)) return "";
      return `${property}: ${value}`;
    })
    .filter(Boolean)
    .join("; ");
}

function cleanNode(node: Node): void {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      if (!ALLOWED_TAGS.has(element.tagName)) {
        while (element.firstChild) element.parentNode?.insertBefore(element.firstChild, element);
        element.parentNode?.removeChild(element);
        return;
      }
      const safeStyle = element.hasAttribute("style") ? sanitizeStyle(element.getAttribute("style") ?? "") : "";
      Array.from(element.attributes).forEach((attr) => element.removeAttribute(attr.name));
      if (safeStyle) element.setAttribute("style", safeStyle);
      cleanNode(element);
    } else if (child.nodeType !== Node.TEXT_NODE) {
      child.parentNode?.removeChild(child);
    }
  });
}

export function sanitizeRichText(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  cleanNode(template.content);
  return template.innerHTML;
}

export function plainText(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  return (template.content.textContent ?? "").trim();
}

export function hasRichText(html: string): boolean {
  return plainText(html).length > 0;
}
