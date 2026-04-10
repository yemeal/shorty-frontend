export function downloadCanvasAsJpg(canvasId, defaultFileName, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return false;

  const quality = options.quality ?? 0.95;
  const scale = options.scale ?? 3;
  const bgColor = options.bgColor ?? "#ffffff";

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width * scale;
  exportCanvas.height = canvas.height * scale;

  const ctx = exportCanvas.getContext("2d");
  if (!ctx) return false;

  // JPEG has no transparency channel, so we paint a white background first.
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

  const jpgUrl = exportCanvas.toDataURL("image/jpeg", quality);
  const downloadLink = document.createElement("a");
  downloadLink.download = defaultFileName.endsWith(".jpg")
    ? defaultFileName
    : `${defaultFileName}.jpg`;
  downloadLink.href = jpgUrl;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  return true;
}
