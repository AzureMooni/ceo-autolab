/**
 * 클립보드 서식 복사 핵심 유틸리티 (복붙 서식/디자인 유지용)
 * 
 * 네이버 스마트에디터에 인라인 스타일이 적용된 HTML을 그대로 꽂아넣으며,
 * 카카오톡 인앱 브라우저 등 구형 환경에서는 document.execCommand Fallback으로 완벽 방어합니다.
 */
export async function copyHtmlToClipboard(
  htmlContent: string,
  plainTextFallback: string
): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
      const textBlob = new Blob([plainTextFallback], { type: "text/plain" });
      const clipboardItem = new ClipboardItem({
        "text/html": htmlBlob,
        "text/plain": textBlob,
      });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    } else {
      // 카카오톡 인앱 브라우저 및 레거시 Fallback 처리
      const tempEl = document.createElement("div");
      tempEl.innerHTML = htmlContent;
      tempEl.style.position = "fixed";
      tempEl.style.left = "-9999px";
      tempEl.style.top = "-9999px";
      document.body.appendChild(tempEl);

      const range = document.createRange();
      range.selectNodeContents(tempEl);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const successful = document.execCommand("copy");
      selection?.removeAllRanges();
      document.body.removeChild(tempEl);
      return successful;
    }
  } catch (error) {
    console.error("서식 복사 실패:", error);
    return false;
  }
}

export async function copyPlainText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const tempEl = document.createElement("textarea");
    tempEl.value = text;
    tempEl.style.position = "fixed";
    tempEl.style.left = "-9999px";
    document.body.appendChild(tempEl);
    tempEl.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(tempEl);
    return successful;
  } catch (err) {
    console.error("텍스트 복사 실패:", err);
    return false;
  }
}
