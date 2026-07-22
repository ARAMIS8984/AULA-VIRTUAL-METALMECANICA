// Comprime una imagen en el navegador antes de subirla, para que la plataforma
// cargue rápido (fotos de celular pueden pesar 3-5 MB; esto las deja en 50-200 KB).
// Si el archivo no es una imagen (ej. un PDF), lo devuelve tal cual, sin tocarlo.
async function comprimirImagen(archivo, dimensionMaxima = 800, calidad = 0.7) {
  if (!archivo.type.startsWith('image/')) return archivo;

  return new Promise((resolve) => {
    const lector = new FileReader();
    lector.onload = (evento) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > dimensionMaxima) {
          height = Math.round(height * (dimensionMaxima / width));
          width = dimensionMaxima;
        } else if (height > dimensionMaxima) {
          width = Math.round(width * (dimensionMaxima / height));
          height = dimensionMaxima;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) { resolve(archivo); return; }
          const nombreNuevo = archivo.name.replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], nombreNuevo, { type: 'image/jpeg' }));
        }, 'image/jpeg', calidad);
      };
      img.onerror = () => resolve(archivo);
      img.src = evento.target.result;
    };
    lector.onerror = () => resolve(archivo);
    lector.readAsDataURL(archivo);
  });
}
