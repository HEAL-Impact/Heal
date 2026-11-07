// Kiswahili for the built-in resource library (dashboard resources list and
// detail pages), keyed by resource id. `summary` is the short text on the list
// page; `content` is the full article. Phone numbers and web addresses are the
// same as the English versions. Needs review by a native-speaking counsellor.

export interface ResourceSw {
  title: string;
  description: string;
  summary: string;
  content: string;
}

export const RESOURCES_SW: Record<string, ResourceSw> = {
  '1': {
    title: 'Kuelewa Wasiwasi: Mwongozo Kamili',
    description: 'Jifunze kuhusu dalili za wasiwasi, vichochezi, na mbinu za kukabiliana zinazotegemea ushahidi.',
    summary:
      'Wasiwasi ni mwitikio wa kawaida wa mwili kwa msongo, lakini unapozidi unaweza kuathiri sana maisha yako ya kila siku. Mwongozo huu unaeleza aina za matatizo ya wasiwasi, dalili za kawaida kama mawazo yanayokimbia na mvutano wa mwili, na mbinu za kukabiliana kama mazoezi ya kupumua, mbinu za kujituliza, na tiba ya utambuzi na tabia.',
    content:
      'Wasiwasi ni mwitikio wa kawaida wa mwili kwa msongo, lakini unapozidi unaweza kuathiri sana maisha yako ya kila siku. Mwongozo huu kamili unaeleza aina mbalimbali za matatizo ya wasiwasi, dalili za kawaida kama mawazo yanayokimbia na mvutano wa mwili, na mbinu za vitendo za kukabiliana zikiwemo mazoezi ya kupumua, mbinu za kujituliza, na tiba ya utambuzi na tabia. Utajifunza kutambua vichochezi vyako vya wasiwasi na kujenga njia nzuri za kuitikia.\n\nMada Kuu:\n• Kuelewa matatizo ya wasiwasi\n• Kutambua dalili na vichochezi\n• Mbinu za kupumua na kutulia\n• Mbinu za tiba ya utambuzi na tabia\n• Kujenga ujuzi wa kukabiliana wa muda mrefu\n• Wakati wa kutafuta msaada wa kitaalamu',
  },
  '2': {
    title: 'Tafakari ya Kuongozwa kwa Msongo wa Mawazo',
    description: 'Tafakari ya dakika 20 iliyoundwa mahususi kusaidia kukabiliana na dalili za msongo wa mawazo.',
    summary:
      'Tafakari hii inalenga kujihurumia na kujitambua kwa upole, ikikusaidia kupitia hisia ngumu kwa wema. Inajumuisha mazoezi ya kupumua, kutambua mwili, na mazoezi ya upendo na wema yaliyoandaliwa kwa wale wanaopitia msongo wa mawazo.',
    content:
      'Tafakari hii inalenga kujihurumia na kujitambua kwa upole, ikikusaidia kupitia hisia ngumu kwa wema. Kipindi kinajumuisha mazoezi ya kupumua, kutambua mwili, na mazoezi ya upendo na wema yaliyoandaliwa mahususi kwa wale wanaopitia msongo wa mawazo. Kufanya mazoezi mara kwa mara kunaweza kusaidia kuboresha hisia, kupunguza mawazo hasi kuhusu nafsi, na kujenga ustahimilivu wa kihisia.\n\nUtakachopitia:\n• Mazoezi ya upole ya kupumua\n• Kutambua mwili na kutulia\n• Mazoezi ya kujihurumia\n• Tafakari ya upendo na wema\n• Mbinu za kukabiliana na hisia ngumu\n• Kujenga ustahimilivu wa kihisia',
  },
  '3': {
    title: 'Mbinu za Tiba ya Utambuzi na Tabia (CBT)',
    description: 'Mazoezi shirikishi ya kusaidia kutambua na kubadilisha mifumo ya mawazo hasi.',
    summary:
      'CBT ni mojawapo ya tiba bora zaidi kwa msongo wa mawazo na wasiwasi. Rasilimali hii inatoa mazoezi ya vitendo ya kutambua upotoshaji wa mawazo, kupinga mawazo hasi, na kujenga mifumo ya kufikiri iliyo na uwiano zaidi.',
    content:
      'CBT ni mojawapo ya tiba bora zaidi kwa msongo wa mawazo na wasiwasi. Rasilimali hii inatoa mazoezi ya vitendo ya kutambua upotoshaji wa mawazo, kupinga mawazo hasi, na kujenga mifumo ya kufikiri iliyo na uwiano zaidi. Inajumuisha kumbukumbu za mawazo, mbinu za kuamsha tabia, na kazi za nyumbani za kufanya kati ya vipindi.\n\nMbinu Zilizomo:\n• Fomu za kurekodi mawazo\n• Kutambua upotoshaji wa mawazo\n• Mbinu za kuamsha tabia\n• Mbinu za kutatua matatizo\n• Zana za kufuatilia hisia\n• Kupanga jinsi ya kuzuia kurudia hali',
  },
  '4': {
    title: 'Kujenga Mahusiano Mazuri',
    description: 'Mfululizo wa video kuhusu ujuzi wa mawasiliano na kuweka mipaka.',
    summary:
      'Mahusiano mazuri ni msingi wa ustawi wa akili. Mfululizo huu wa video unaeleza mbinu bora za mawasiliano, jinsi ya kuweka na kudumisha mipaka yenye afya, ujuzi wa kutatua migogoro, na kujenga uaminifu.',
    content:
      'Mahusiano mazuri ni msingi wa ustawi wa akili. Mfululizo huu wa video unaeleza mbinu bora za mawasiliano, jinsi ya kuweka na kudumisha mipaka yenye afya, ujuzi wa kutatua migogoro, na kujenga uaminifu. Jifunze kutambua mifumo isiyofaa katika mahusiano na kujenga ujuzi unaohitajika kwa uhusiano wenye maana.\n\nMada za Video:\n• Mbinu bora za mawasiliano\n• Kuweka mipaka yenye afya\n• Mbinu za kutatua migogoro\n• Kujenga na kudumisha uaminifu\n• Kutambua mifumo yenye madhara\n• Kujenga uhusiano wenye maana',
  },
  '5': {
    title: 'Jaribio la Kupima Msongo',
    description: 'Pima kiwango chako cha msongo na upate mapendekezo yanayokufaa.',
    summary:
      'Tathmini hii kamili inasaidia kutambua mifumo yako ya msongo, vichochezi, na njia unazotumia sasa kukabiliana. Kulingana na majibu yako, utapata mapendekezo yanayokufaa ya mbinu za kudhibiti msongo.',
    content:
      'Tathmini hii kamili inasaidia kutambua mifumo yako ya msongo, vichochezi, na njia unazotumia sasa kukabiliana. Kulingana na majibu yako, utapata mapendekezo yanayokufaa ya mbinu za kudhibiti msongo, mabadiliko ya mtindo wa maisha, na rasilimali za msaada zaidi.\n\nMaeneo ya Tathmini:\n• Kupima kiwango cha msongo\n• Kutambua vichochezi\n• Kuchambua njia za kukabiliana\n• Kutathmini mtindo wa maisha\n• Mapendekezo yanayokufaa\n• Kuandaa mpango wa hatua',
  },
  '6': {
    title: 'Mazoezi ya Juu ya Umakini (Mindfulness)',
    description: 'Uchunguzi wa kina wa mbinu za umakini kwa wenye uzoefu.',
    summary:
      'Mazoezi haya ya juu yanajenga juu ya ujuzi wa msingi wa umakini na yanajumuisha kuchunguza mwili, tafakari ya kutembea, kula kwa umakini, na kuingiza umakini katika shughuli za kila siku.',
    content:
      'Mazoezi haya ya juu yanajenga juu ya ujuzi wa msingi wa umakini na yanajumuisha kuchunguza mwili, tafakari ya kutembea, kula kwa umakini, na kuingiza umakini katika shughuli za kila siku. Yanafaa kwa wale ambao tayari wana mazoea ya kutafakari na wanataka kuongeza uelewa wao.\n\nMbinu za Juu:\n• Tafakari ya kuchunguza mwili\n• Mazoezi ya tafakari ya kutembea\n• Mazoezi ya kula kwa umakini\n• Kuingiza umakini katika maisha ya kila siku\n• Mbinu za juu za kupumua\n• Mazoezi ya tafakari ya kina',
  },
  'kenya-befrienders': {
    title: 'Befrienders Kenya',
    description: 'Inatoa msaada wa kihisia kwa walio na dhiki kupitia usikilizaji wa siri.',
    summary:
      'Befrienders Kenya inatoa msaada wa kihisia saa 24 kupitia watu wa kujitolea waliofunzwa wanaotoa mahali salama pa kuongea kuhusu hisia zako. Piga +254 722 178 177 kwa msaada wa bure na wa siri.',
    content:
      'Befrienders Kenya inatoa msaada wa kihisia saa 24 kupitia watu wa kujitolea waliofunzwa wanaotoa mahali salama pa kuongea kuhusu hisia zako. Wanatoa msaada wa siri kwa simu kwa watu wenye dhiki ya kihisia, msongo wa mawazo, au mawazo ya kujiua. Huduma ni bure na zinapatikana kwa Kiingereza na Kiswahili.\n\nHuduma Zinazotolewa:\n• Msaada kwa simu saa 24\n• Kusikiliza kwa siri\n• Msaada wa kihisia\n• Msaada wakati wa dharura\n• Rufaa kwa huduma za kitaalamu\n\nMawasiliano:\nPiga: +254 722 178 177\nBarua pepe: info@befrienderskenya.org\nTovuti: www.befrienderskenya.org\n\nInapatikana kwa Kiingereza na Kiswahili. Huduma zote ni bure na za siri.',
  },
  'kenya-eplus': {
    title: 'Emergency Plus Medical Services (E-Plus)',
    description: 'Inatoa huduma za gari la wagonjwa na matibabu ya dharura kabla ya kufika hospitali kote Kenya.',
    summary:
      'E-Plus inatoa huduma za dharura za matibabu saa 24 ikiwa ni pamoja na msaada wakati wa dharura. Simu ya dharura: +254 700 395 395 kwa msaada wa haraka wa matibabu na afya ya akili.',
    content:
      'E-Plus inatoa huduma za dharura za matibabu saa 24 zikiwemo gari la wagonjwa, huduma ya dharura ya matibabu, na msaada wakati wa dharura. Wana wataalamu wa afya waliofunzwa wanaoweza kushughulikia dharura za afya ya akili na kutoa msaada wa haraka huku wakikuunganisha na huduma zinazofaa za afya ya akili.\n\nHuduma Zinazotolewa:\n• Huduma za dharura za matibabu saa 24\n• Gari la wagonjwa\n• Msaada wakati wa dharura za afya ya akili\n• Huduma ya dharura kabla ya kufika hospitali\n• Ushauri wa dharura za matibabu\n• Rufaa kwa vituo vya afya ya akili\n\nMawasiliano:\nSimu ya dharura: +254 700 395 395\nNyingine: +254 733 395 395\nTovuti: www.eplus.co.ke\n\nInahudumia nchi nzima kwa wataalamu wa afya waliofunzwa.',
  },
  'kenya-redcross': {
    title: 'Chama cha Msalaba Mwekundu Kenya',
    description: 'Inatoa huduma za kibinadamu, ikiwemo kukabiliana na majanga na msaada wa dharura.',
    summary:
      'Msalaba Mwekundu Kenya inatoa huduma za msaada wa kisaikolojia na ushauri wakati wa dharura. Simu: +254 703 037 000 kwa msaada wa afya ya akili kote nchini na huduma za dharura.',
    content:
      'Msalaba Mwekundu Kenya inatoa huduma za msaada wa kisaikolojia, kukabiliana na dharura, na programu za afya ya akili za kijamii. Wanatoa ushauri wakati wa dharura, msaada kwa waliopata kiwewe, na wanaweza kukuunganisha na rasilimali za afya ya akili zilizo karibu. Wapo nchi nzima wakiwa na washauri waliofunzwa.\n\nHuduma Zinazotolewa:\n• Msaada wa kisaikolojia\n• Ushauri wakati wa dharura\n• Msaada kwa waliopata kiwewe\n• Programu za afya ya akili za kijamii\n• Kukabiliana na dharura\n• Rufaa kwa huduma za afya ya akili\n• Vikundi vya msaada\n\nMawasiliano:\nSimu: +254 703 037 000\nNyingine: +254 20 3950000\nBarua pepe: info@redcross.or.ke\nTovuti: www.redcross.or.ke\n\nWapo nchi nzima wakiwa na washauri na watu wa kujitolea waliofunzwa.',
  },
  'kenya-mental-health': {
    title: 'Chama cha Afya ya Akili Kenya (KAMH)',
    description: 'Kinajitolea kukuza uelewa wa afya ya akili na kutoa huduma za msaada.',
    summary:
      'KAMH inatoa utetezi wa afya ya akili na huduma za ushauri. Simu: +254 20 2717077 kwa ushauri wa mtu binafsi na msaada wakati wa dharura.',
    content:
      'KAMH inatoa utetezi wa afya ya akili, huduma za ushauri, na programu za kufikia jamii. Wanatoa vikundi vya msaada, ushauri wa mtu binafsi, na msaada wakati wa dharura. Pia wanatoa mafunzo na elimu kuhusu masuala ya afya ya akili.\n\nHuduma Zinazotolewa:\n• Utetezi wa afya ya akili\n• Ushauri wa mtu binafsi\n• Vikundi vya msaada\n• Msaada wakati wa dharura\n• Kufikia jamii\n• Mafunzo na elimu\n• Programu za uelewa wa afya ya akili\n\nMawasiliano:\nSimu: +254 20 2717077\nSimu ya mkononi: +254 722 364 456\nBarua pepe: info@mentalhealthkenya.org\nTovuti: www.mentalhealthkenya.org\n\nKinajitolea kuboresha upatikanaji wa huduma za afya ya akili kote Kenya.',
  },
  'kenya-police': {
    title: 'Huduma za Dharura za Polisi Kenya',
    description: 'Huduma za kitaifa za dharura za polisi kwa msaada wa haraka.',
    summary:
      'Kwa hali za dharura zinazotishia usalama wa mtu. Dharura: 999 kwa msaada wa haraka na dharura za afya ya akili.',
    content:
      'Kwa hali za dharura zinazotishia usalama wa mtu, ukatili wa nyumbani, au mtu anapokuwa hatarini mara moja. Polisi wanaweza kutoa msaada wa haraka na kukuunganisha na huduma zinazofaa za dharura za afya ya akili.\n\nWakati wa Kupiga Simu:\n• Tishio la haraka kwa usalama\n• Hali za ukatili wa nyumbani\n• Mtu yuko hatarini mara moja\n• Dharura ya afya ya akili\n• Tabia ya kujiua inayohitaji msaada wa haraka\n\nMawasiliano:\nDharura: 999\nNyingine: 112\nSimu ya polisi: +254 20 341 4906\n\nInapatikana saa 24 kwa hali za dharura zinazohitaji msaada wa haraka.',
  },
  'kenya-childline': {
    title: 'Childline Kenya',
    description: 'Simu ya msaada ya saa 24 kwa watoto na vijana walio katika shida.',
    summary:
      'Childline Kenya inatoa msaada wa bure na wa siri kwa watoto na vijana hadi miaka 18. Bila malipo: 116 kwa ushauri wakati wa dharura na msaada wa afya ya akili.',
    content:
      'Childline Kenya inatoa msaada wa bure na wa siri kwa watoto na vijana (hadi miaka 18) wanaokabiliwa na tatizo lolote, yakiwemo masuala ya afya ya akili, unyanyasaji, matatizo ya kifamilia, au mawazo ya kujiua. Washauri waliofunzwa hutoa msaada wa haraka na rufaa.\n\nHuduma Zinazotolewa:\n• Simu ya msaada ya saa 24 kwa watoto na vijana\n• Ushauri wakati wa dharura\n• Msaada wa afya ya akili\n• Kuripoti unyanyasaji na msaada\n• Upatanishi wa matatizo ya kifamilia\n• Rufaa kwa huduma zinazofaa\n• Msaada wa ufuatiliaji\n\nMawasiliano:\nBila malipo: 116\nNyingine: +254 20 2671757\nTovuti: www.childlinekenya.co.ke\n\nMsaada maalum kwa watoto na vijana hadi miaka 18.',
  },
  'kenya-gender-violence': {
    title: 'Kituo cha Kupona Ukatili wa Kijinsia (GVRC)',
    description: 'Msaada maalum kwa walionusurika ukatili wa kijinsia.',
    summary:
      'GVRC inatoa msaada kamili kwa walionusurika ukiwemo ushauri na msaada wa kisheria. Simu: +254 709 660 000 kwa msaada maalum wa afya ya akili unaozingatia kiwewe.',
    content:
      'GVRC inatoa msaada kamili kwa walionusurika ukatili wa kijinsia ukiwemo ushauri, msaada wa kisheria, msaada wa matibabu, na makazi salama. Wana washauri waliofunzwa wanaoelewa kiwewe na wanaoweza kutoa msaada maalum wa afya ya akili.\n\nHuduma Zinazotolewa:\n• Ushauri na msaada wakati wa dharura\n• Msaada wa kisheria na utetezi\n• Msaada wa matibabu na rufaa\n• Makazi salama\n• Tiba inayozingatia kiwewe\n• Vikundi vya msaada\n• Kuandamana mahakamani\n\nMawasiliano:\nSimu: +254 709 660 000\nNairobi: +254 20 2731313\nTovuti: www.gvrc.or.ke\n\nHuduma maalum inayozingatia kiwewe kwa walionusurika ukatili wa kijinsia.',
  },
  'kenya-samaritans': {
    title: 'Samaritans Kenya',
    description: 'Msaada wa kihisia na huduma za kuzuia kujiua.',
    summary:
      'Samaritans Kenya inatoa msaada wa siri wa kihisia kwa yeyote aliye na dhiki. Nairobi: +254 722 178 177 kwa kusikilizwa bila hukumu na msaada saa 24.',
    content:
      'Samaritans Kenya inatoa msaada wa siri wa kihisia kwa yeyote mwenye hisia za dhiki au kukata tamaa, wakiwemo wenye mawazo ya kujiua. Watu wa kujitolea waliofunzwa hutoa usikilizaji usio na hukumu na msaada saa 24.\n\nHuduma Zinazotolewa:\n• Msaada wa kihisia saa 24\n• Kuzuia kujiua\n• Msaada wakati wa dharura\n• Kusikiliza bila hukumu\n• Msaada wa siri\n• Rufaa kwa msaada wa kitaalamu\n• Msaada wa ufuatiliaji\n\nMawasiliano:\nNairobi: +254 722 178 177\nMombasa: +254 41 222 5555\nBarua pepe: samaritanskenya@gmail.com\n\nWatu wa kujitolea waliofunzwa wanaotoa msaada wa huruma saa 24.',
  },
};
