import type { Organization } from '../lib/types';

/** Mock organisations. All names are fictional placeholders. */
export const ORGS: Organization[] = [
  { id: 'org-a', name: { en: 'Example Company A', si: 'උදාහරණ සමාගම A' }, type: 'workplace', district: { en: 'Colombo', si: 'කොළඹ' }, sector: { en: 'Garment manufacturer', si: 'ඇඟලුම් නිෂ්පාදන' }, verified: true },
  { id: 'org-b', name: { en: 'Sample University B', si: 'නියැදි විශ්වවිද්‍යාලය B' }, type: 'university', district: { en: 'Kandy', si: 'මහනුවර' }, sector: { en: 'Higher education', si: 'උසස් අධ්‍යාපනය' }, verified: true },
  { id: 'org-c', name: { en: 'Demo Hotel C', si: 'ආදර්ශ හෝටලය C' }, type: 'hotel', district: { en: 'Galle', si: 'ගාල්ල' }, sector: { en: 'Hospitality', si: 'ආගන්තුක සත්කාර' }, verified: true },
  { id: 'org-d', name: { en: 'Example Transit D', si: 'උදාහරණ ප්‍රවාහන D' }, type: 'transport', district: { en: 'Gampaha', si: 'ගම්පහ' }, sector: { en: 'Bus operator', si: 'බස් සේවා' }, verified: true },
  { id: 'org-e', name: { en: 'Sample Finance E', si: 'නියැදි මූල්‍ය ආයතනය E' }, type: 'workplace', district: { en: 'Colombo', si: 'කොළඹ' }, sector: { en: 'Banking and finance', si: 'බැංකු හා මූල්‍ය' }, verified: true },
  { id: 'org-f', name: { en: 'Demo Institute F', si: 'ආදර්ශ ආයතනය F' }, type: 'university', district: { en: 'Kurunegala', si: 'කුරුණෑගල' }, sector: { en: 'Vocational training', si: 'වෘත්තීය පුහුණු' }, verified: false },
  { id: 'org-g', name: { en: 'Sample Hospital G', si: 'නියැදි රෝහල G' }, type: 'workplace', district: { en: 'Kurunegala', si: 'කුරුණෑගල' }, sector: { en: 'Healthcare', si: 'සෞඛ්‍ය සේවා' }, verified: true },
  { id: 'org-h', name: { en: 'Demo Supermarket H', si: 'ආදර්ශ සුපිරි වෙළඳසැල H' }, type: 'workplace', district: { en: 'Gampaha', si: 'ගම්පහ' }, sector: { en: 'Retail', si: 'සිල්ලර වෙළඳාම' }, verified: true },
  { id: 'org-i', name: { en: 'Example College I', si: 'උදාහරණ විද්‍යාලය I' }, type: 'university', district: { en: 'Matara', si: 'මාතර' }, sector: { en: 'Private higher education', si: 'පෞද්ගලික උසස් අධ්‍යාපනය' }, verified: true },
  { id: 'org-j', name: { en: 'Sample Rail Services J', si: 'නියැදි දුම්රිය සේවා J' }, type: 'transport', district: { en: 'Colombo', si: 'කොළඹ' }, sector: { en: 'Rail operator', si: 'දුම්රිය සේවා' }, verified: true },
];
