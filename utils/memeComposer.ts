
import { HumorStyle } from "../types";

/**
 * Composites text onto a 400x400 canvas.
 * Simplified layout: Clean black bars, sharp white text, no filters.
 */
export const createMemeImage = (
  snapshotBase64: string,
  title: string,
  caption: string,
  style: HumorStyle
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const SIZE = 400;
    const BAR_HEIGHT = 70; 
    
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(snapshotBase64);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SIZE, SIZE);

    const img = new Image();
    img.onload = () => {
      const imageSectionHeight = SIZE - (BAR_HEIGHT * 2);
      const scale = Math.max(SIZE / img.width, imageSectionHeight / img.height);
      const x = (SIZE / 2) - (img.width / 2) * scale;
      const y = BAR_HEIGHT + (imageSectionHeight / 2) - (img.height / 2) * scale;
      
      // Draw image clearly with no filters for that classic look
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, BAR_HEIGHT, SIZE, imageSectionHeight);
      ctx.clip();
      ctx.filter = 'none'; 
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      
      const drawText = (
        text: string, 
        yCenter: number, 
        initialFontSize: number, 
        maxHeight: number,
        weight: string = '900'
      ) => {
        let currentFontSize = initialFontSize;
        let lines: string[] = [];
        const maxWidth = SIZE - 30;
        const fontName = 'Arial, sans-serif'; // Solid, readable classic font

        while (currentFontSize > 10) {
          ctx.font = `${weight} ${currentFontSize}px ${fontName}`;
          const words = text.toUpperCase().split(' ');
          let line = '';
          lines = [];

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              lines.push(line);
              line = words[n] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          const totalTextHeight = lines.length * (currentFontSize * 1.2);
          if (totalTextHeight <= maxHeight - 10) break;
          currentFontSize -= 1;
        }

        const lineHeight = currentFontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        const startY = yCenter - (totalHeight / 2) + (lineHeight / 2);

        lines.forEach((l, i) => {
          ctx.fillText(l.trim(), SIZE / 2, startY + (i * lineHeight));
        });
      };

      // Use consistent bold sizing for both bars
      drawText(title, BAR_HEIGHT / 2, 22, BAR_HEIGHT, '900');
      drawText(caption, SIZE - (BAR_HEIGHT / 2), 20, BAR_HEIGHT, '700');

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = snapshotBase64;
  });
};
