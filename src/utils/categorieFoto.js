export const OPZIONI_CATEGORIA = [
  { value: 'attacco', label: 'Attacco della via' },
  { value: 'tiro', label: 'Un tiro / parete' },
  { value: 'sosta', label: 'Una sosta' },
  { value: 'calata', label: 'Calata / discesa' },
  { value: 'avvicinamento', label: 'Avvicinamento' },
  { value: 'panorama', label: 'Vista panoramica' },
  { value: 'altro', label: 'Altro dettaglio utile' },
];

export const ETICHETTE_CATEGORIA = OPZIONI_CATEGORIA.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});