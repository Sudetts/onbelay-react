import imageCompression from 'browser-image-compression';

export async function comprimiImmagine(file) {
  // Comprimiamo solo le immagini, altri file (es. GPX) passano invariati
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const opzioni = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  };

  try {
    const fileCompresso = await imageCompression(file, opzioni);
    return fileCompresso;
  } catch (errore) {
    console.error('Errore nella compressione, uso il file originale:', errore);
    return file;
  }
}