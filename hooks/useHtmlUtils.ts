// hooks/useHtmlUtils.ts
export const useHtmlUtils = () => {
  const stripHtml = (html: string): string => {
    if (typeof document === "undefined") return html;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return {
    stripHtml,
  };
};
