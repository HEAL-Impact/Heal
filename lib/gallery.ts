// Gallery photos and categories. To add a photo: put <name>.jpg (max 1600px) and
// <name>-thumb.jpg (max 640px) in public/images/gallery/ and add an entry below.
// Photos appear in the order listed; the first ten show before "See all".
// Categories aren't shown on the site right now, but keep them for sorting.

export const GALLERY_CATEGORIES = [
  'Nature Journaling',
  'Building Safe Spaces',
  'Community Building',
  'Award Ceremonies',
  'Strategic Partnerships',
  'E4Impact Incubation Program',
  'Understanding Access to SRHR Services Among Rural Women',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryPhoto {
  name: string;
  category: GalleryCategory;
  caption: string;
  captionSw?: string;
}

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { name: 'nature-journaling-rocks', category: 'Nature Journaling', caption: 'Journaling together among the rocks', captionSw: "Kuandika shajara ya mazingira pamoja kati ya miamba" },
  { name: 'nature-journaling-plants', category: 'Nature Journaling', caption: 'Looking closely at indigenous plants', captionSw: "Kuchunguza kwa makini mimea ya asili" },
  { name: 'nature-journaling-euphorbia', category: 'Nature Journaling', caption: 'Exploring a candelabra euphorbia', captionSw: "Kuchunguza mti wa euphorbia" },
  { name: 'nature-journaling-drawing', category: 'Nature Journaling', caption: 'Sharing botanical sketches', captionSw: "Kushiriki michoro ya mimea" },
  { name: 'safe-spaces-shelter-circle', category: 'Building Safe Spaces', caption: 'Community Health Promoter conducting nature journaling circle in the shade', captionSw: "Mhamasishaji wa Afya ya Jamii akiongoza kikundi cha shajara ya mazingira kivulini" },
  { name: 'safe-spaces-outdoor-circle', category: 'Building Safe Spaces', caption: 'An open-air support session', captionSw: "Kikao cha msaada nje" },
  { name: 'community-art-talk', category: 'Community Building', caption: 'Creating awareness on Nature Journaling with the Youth Flourish community', captionSw: "Kuhamasisha kuhusu shajara ya mazingira pamoja na jamii ya Youth Flourish" },
  { name: 'community-workshop', category: 'Community Building', caption: 'Working through ideas as a team', captionSw: "Kujadili mawazo kama timu" },
  { name: 'community-youth-friendly-services', category: 'Community Building', caption: 'Gathering at a youth-friendly services centre', captionSw: "Mkutano katika kituo cha huduma rafiki kwa vijana" },
  { name: 'awards-lakehub-stage', category: 'Award Ceremonies', caption: 'Winners!!! We won the Code and Cheer Hackathon in 2024', captionSw: "Washindi!!! Tulishinda Code and Cheer Hackathon mwaka 2024" },
  { name: 'awards-lakehub-laptops', category: 'Award Ceremonies', caption: 'Receiving Awards - BEST COMMUNITY CENTERED APPLICATION and BEST HEALTHCARE SOLUTION', captionSw: "Kupokea tuzo - PROGRAMU BORA INAYOLENGA JAMII na SULUHISHO BORA LA AFYA" },
  { name: 'awards-group-photo', category: 'Award Ceremonies', caption: 'The whole cohort, celebrating together at Zone01 Kisumu', captionSw: "Kundi zima likisherehekea pamoja Zone01 Kisumu" },
  { name: 'partnerships-zone01-speaker', category: 'Strategic Partnerships', caption: 'Women in tech opportunities at Zone01 Kisumu', captionSw: "Fursa za wanawake katika teknolojia, Zone01 Kisumu" },
  { name: 'partnerships-lakehub-speaker', category: 'Strategic Partnerships', caption: 'Pitching the idea', captionSw: "Kuwasilisha wazo" },
  { name: 'partnerships-online-call', category: 'Strategic Partnerships', caption: 'Connecting with partners online', captionSw: "Kuungana na washirika mtandaoni" },
  { name: 'partnerships-office-meeting', category: 'Strategic Partnerships', caption: 'Planning with a partner organisation', captionSw: "Kupanga pamoja na shirika mshirika" },
  { name: 'partnerships-reproductive-health', category: 'Strategic Partnerships', caption: 'A roundtable on reproductive health and rights', captionSw: "Mjadala kuhusu afya ya uzazi na haki" },
  { name: 'e4impact-cohort', category: 'E4Impact Incubation Program', caption: 'Our E4Impact incubation cohort', captionSw: "Kundi letu la ukuzaji biashara la E4Impact" },
  { name: 'e4impact-podium', category: 'E4Impact Incubation Program', caption: 'Pitching HEAL-Impact at E4Impact', captionSw: "Kuwasilisha HEAL-Impact katika E4Impact" },
  { name: 'e4impact-activity', category: 'E4Impact Incubation Program', caption: 'A hands-on incubation activity', captionSw: "Shughuli ya vitendo ya ukuzaji biashara" },
  { name: 'srhr-team-mural', category: 'Understanding Access to SRHR Services Among Rural Women', caption: 'The SRHR study team at the HEAL-Impact mural', captionSw: "Timu ya utafiti wa afya ya uzazi (SRHR) kwenye mchoro wa ukutani wa HEAL-Impact" },
  { name: 'srhr-discussion-circle', category: 'Understanding Access to SRHR Services Among Rural Women', caption: 'A discussion circle with rural women on access to SRHR services', captionSw: "Kikundi cha majadiliano na wanawake wa vijijini kuhusu kupata huduma za afya ya uzazi" },
  { name: 'srhr-listening-session', category: 'Understanding Access to SRHR Services Among Rural Women', caption: 'Listening to women share their experiences of SRHR services', captionSw: "Kusikiliza wanawake wakieleza uzoefu wao wa huduma za afya ya uzazi" },
  { name: 'srhr-community-visit', category: 'Understanding Access to SRHR Services Among Rural Women', caption: 'Visiting the community during the SRHR study', captionSw: "Kutembelea jamii wakati wa utafiti wa afya ya uzazi" },
  { name: 'srhr-community-presentation', category: 'Understanding Access to SRHR Services Among Rural Women', caption: 'Sharing SRHR information with community members', captionSw: "Kushiriki taarifa za afya ya uzazi na wanajamii" },
];

// Videos for the "See videos" tab. Put the file in public/video/ and add
// e.g. { src: '/video/graduation.mp4', caption: '...' }. While this is empty,
// the tab points visitors to our LinkedIn page instead.
export const GALLERY_VIDEOS: { src: string; caption: string }[] = [];

export const photoSrc =(photo: GalleryPhoto) => `/images/gallery/${photo.name}.jpg`;
export const thumbSrc = (photo: GalleryPhoto) => `/images/gallery/${photo.name}-thumb.jpg`;
