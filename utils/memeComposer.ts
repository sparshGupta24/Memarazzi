
/**
 * Manually composites the meme text onto a 400x400 canvas.
 * Follows the layout: Black header (TEXT#1), Middle image, Black footer (TEXT#2).
 */
export const createMemeImage = (
  snapshotBase64: string,
  title: string,
  caption: string
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const SIZE = 400;
    const BAR_HEIGHT = 70; // Height of the black bars
    
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(snapshotBase64);

    // 1. Draw solid black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SIZE, SIZE);

    const img = new Image();
    img.onload = () => {
      // 2. Draw Captured Image in the middle section (between the bars)
      const imageSectionHeight = SIZE - (BAR_HEIGHT * 2);
      const scale = Math.max(SIZE / img.width, imageSectionHeight / img.height);
      const x = (SIZE / 2) - (img.width / 2) * scale;
      const y = BAR_HEIGHT + (imageSectionHeight / 2) - (img.height / 2) * scale;
      
      // Clip to middle section
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, BAR_HEIGHT, SIZE, imageSectionHeight);
      ctx.clip();
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.restore();

      // 3. Configure Text Style
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      
      const titleFontSize = 24;
      const captionFontSize = 18;

      // Helper for wrapping text
      const drawText = (text: string, yPos: number, fontSize: number, weight: string = '900') => {
        ctx.font = `${weight} ${fontSize}px sans-serif`;
        const words = text.toUpperCase().split(' ');
        let line = '';
        const lines = [];
        const maxWidth = SIZE - 40;

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

        // Center multiple lines in the bar vertically
        const totalTextHeight = lines.length * fontSize;
        const startY = yPos - (totalTextHeight / 2) + (fontSize / 2);

        lines.forEach((l, i) => {
          ctx.fillText(l.trim(), SIZE / 2, startY + (i * fontSize));
        });
      };

      // 4. Draw TEXT#1 (Title) in top black bar
      drawText(title, BAR_HEIGHT / 2, titleFontSize);
      
      // 5. Draw TEXT#2 (Caption) in bottom black bar
      drawText(caption, SIZE - (BAR_HEIGHT / 2), captionFontSize, '500');

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = snapshotBase64;
  });
};
