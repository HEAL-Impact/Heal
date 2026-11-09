// Kenyan support lines used across the help flow. Numbers are the ones already
// published elsewhere in HEAL; confirm them with each service before launch.

export interface Hotline {
  id: string;
  name: string;
  nameSw: string;
  number: string; // dialable
  display: string;
  note: string;
  noteSw: string;
  free?: boolean;
}

export const EMERGENCY_LINES: Hotline[] = [
  { id: 'gbv', name: 'National GBV Hotline', nameSw: 'Simu ya Msaada ya GBV', number: '1195', display: '1195', note: 'Free, 24/7, confidential', noteSw: 'Bure, saa 24, siri', free: true },
  { id: 'police', name: 'Police emergency', nameSw: 'Polisi (dharura)', number: '999', display: '999', note: 'Ask for the Gender Desk', noteSw: 'Uliza Dawati la Jinsia', free: true },
  { id: 'eu', name: 'Emergency (any network)', nameSw: 'Dharura (mtandao wowote)', number: '112', display: '112', note: 'Works without airtime', noteSw: 'Inafanya kazi bila salio', free: true },
  { id: 'child', name: 'Childline Kenya', nameSw: 'Childline Kenya', number: '116', display: '116', note: 'For children and young people', noteSw: 'Kwa watoto na vijana', free: true },
];

export const SUPPORT_LINES: Hotline[] = [
  { id: 'befrienders', name: 'Befrienders Kenya', nameSw: 'Befrienders Kenya', number: '+254722178177', display: '+254 722 178 177', note: 'Emotional support, suicidal thoughts', noteSw: 'Msaada wa kihisia, mawazo ya kujiua' },
  { id: 'gvrc', name: 'Gender Violence Recovery Centre', nameSw: 'Kituo cha Kupona Ukatili wa Kijinsia', number: '0709400200', display: '0709 400 200', note: 'Medical care, PEP, counselling', noteSw: 'Matibabu, PEP, ushauri' },
  { id: 'fida', name: 'FIDA Kenya (legal aid)', nameSw: 'FIDA Kenya (msaada wa kisheria)', number: '0800720187', display: '0800 720 187', note: 'Free legal advice for women', noteSw: 'Ushauri wa kisheria bure kwa wanawake', free: true },
  { id: 'covaw', name: 'COVAW', nameSw: 'COVAW', number: '0800720553', display: '0800 720 553', note: 'Support for women survivors', noteSw: 'Msaada kwa wanawake walionusurika', free: true },
];

export const telHref = (line: Hotline) => `tel:${line.number}`;
