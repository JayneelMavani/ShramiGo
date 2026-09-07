export function compressProfileImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select an image file."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read the image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Unable to process the image."));
      img.onload = () => {
        const maxSize = 700;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Your browser cannot process this image."));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.78);

        if (dataUrl.length > 350_000) {
          const smaller = canvas.toDataURL("image/jpeg", 0.58);
          resolve(smaller);
          return;
        }

        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
