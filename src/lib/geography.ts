// Nyandarua County — All 5 constituencies, 25 wards, and polling stations
// Source: IEBC 2022 electoral boundaries

export type ConstituencyName =
    | "Ol Kalou"
    | "Ol Jorok"
    | "Ndaragwa"
    | "Kipipiri"
    | "Kinangop";

export const CONSTITUENCIES: ConstituencyName[] = [
    "Ol Kalou",
    "Ol Jorok",
    "Ndaragwa",
    "Kipipiri",
    "Kinangop",
];

export const CONSTITUENCY_WARDS: Record<ConstituencyName, string[]> = {
    "Ol Kalou": ["Karandi", "Mirangine", "Gathanji", "Gatimu", "Rurii"],
    "Ol Jorok": ["Olmoran", "Ngorika", "Ndunyu Njeru", "Muhotetu"],
    "Ndaragwa": ["Leshau/Pondo", "Sharati", "Ngarua", "Ndaragwa"],
    "Kipipiri": ["Wanjohi", "Kipipiri", "Geta", "Githioro"],
    "Kinangop": [
        "Gathara",
        "North Kinangop",
        "Murungaru",
        "Njabini/Kiburu",
        "Nyakio",
        "Engineer",
        "Gathabai",
        "Muringanange",
    ],
};

// Flat list of all wards across all constituencies
export const ALL_WARDS: string[] = Object.values(CONSTITUENCY_WARDS).flat();

// Which constituency a ward belongs to
export const WARD_CONSTITUENCY: Record<string, ConstituencyName> = {};
for (const [constituency, wards] of Object.entries(CONSTITUENCY_WARDS)) {
    for (const ward of wards) {
        WARD_CONSTITUENCY[ward] = constituency as ConstituencyName;
    }
}

// Polling stations per ward (IEBC register — verify before election day)
export const POLLING_STATIONS: Record<string, string[]> = {
    // Ol Kalou Constituency
    "Karandi": [
        "Karandi Primary School",
        "Karandi Market",
        "Karandi Social Hall",
        "Kiambaa Primary School",
        "Kihururu Primary School",
        "Kainaga Primary School",
        "Gikoe Primary School",
    ],
    "Mirangine": [
        "Mirangine Primary School",
        "Mirangine Market",
        "Mirangine Social Hall",
        "Kambiti Primary School",
        "Charagita Primary School",
        "Ngondu Primary School",
        "Mirangine ACK Church",
    ],
    "Gathanji": [
        "Gathanji Primary School",
        "Gathanji Market",
        "Gathanji Social Hall",
        "Kimunyi Primary School",
        "Gitwe Primary School",
        "Ndungu Primary School",
        "Kahuguini Primary School",
    ],
    "Gatimu": [
        "Gatimu Primary School",
        "Gatimu Market",
        "Gatimu Social Hall",
        "Gatimu ACK Church",
        "Gatitu Primary School",
        "Kirima Primary School",
        "Ngecha Primary School",
    ],
    "Rurii": [
        "Ol Kalou Social Hall",
        "Ol Kalou Primary School",
        "Ol Kalou Market",
        "Ol Kalou ACK Church Hall",
        "Mwihoko Primary School",
        "Nyakio Primary School",
        "Rurii Primary School",
    ],

    // Ol Jorok Constituency
    "Olmoran": [
        "Olmoran Primary School",
        "Olmoran Market",
        "Olmoran Social Hall",
        "Mutara Primary School",
        "Kijabe Primary School",
        "Olpusimoru Primary School",
        "Olmoran Catholic Church",
    ],
    "Ngorika": [
        "Ngorika Primary School",
        "Ngorika Market",
        "Ngorika Social Hall",
        "Njoro Primary School",
        "Ruaraka Primary School",
        "Ngorika ACK Church",
    ],
    "Ndunyu Njeru": [
        "Ndunyu Njeru Primary School",
        "Ndunyu Njeru Market",
        "Ndunyu Njeru Social Hall",
        "Kairogo Primary School",
        "Githiga Primary School",
        "Ndunyu Njeru ACK Church",
    ],
    "Muhotetu": [
        "Muhotetu Primary School",
        "Muhotetu Market",
        "Muhotetu Social Hall",
        "Kierera Primary School",
        "Kigumo Primary School",
        "Karurune Primary School",
    ],

    // Ndaragwa Constituency
    "Leshau/Pondo": [
        "Leshau Primary School",
        "Pondo Primary School",
        "Leshau Market",
        "Pondo Market",
        "Kimondo Primary School",
        "Githima Primary School",
        "Leshau Social Hall",
    ],
    "Sharati": [
        "Sharati Primary School",
        "Sharati Market",
        "Sharati Social Hall",
        "Kagaa Primary School",
        "Karanja Primary School",
        "Sharati ACK Church",
    ],
    "Ngarua": [
        "Ngarua Primary School",
        "Ngarua Market",
        "Ngarua Social Hall",
        "Kiriita Primary School",
        "Kamwenja Primary School",
        "Rironi Primary School",
        "Ngarua ACK Church",
    ],
    "Ndaragwa": [
        "Ndaragwa Primary School",
        "Ndaragwa Town Hall",
        "Ndaragwa Market",
        "Ndaragwa ACK Church",
        "Kimathi Primary School",
        "Chania Primary School",
        "Ndaragwa Social Hall",
    ],

    // Kipipiri Constituency
    "Wanjohi": [
        "Wanjohi Primary School",
        "Wanjohi Market",
        "Wanjohi Social Hall",
        "Kanjeru Primary School",
        "Rurimeria Primary School",
        "Turasha Primary School",
        "Wanjohi ACK Church",
    ],
    "Kipipiri": [
        "Kipipiri Primary School",
        "Kipipiri Market",
        "Kipipiri Social Hall",
        "Kipipiri ACK Church",
        "Shamata Primary School",
        "Kinamba Primary School",
        "Kangutu Primary School",
        "Engineer Market",
    ],
    "Geta": [
        "Geta Primary School",
        "Geta Market",
        "Geta Social Hall",
        "Geta ACK Church",
        "Kiriita Primary School",
        "Kanyua Primary School",
        "Geta Catholic Church",
    ],
    "Githioro": [
        "Githioro Primary School",
        "Githioro Market",
        "Githioro Social Hall",
        "Githioro ACK Church",
        "Githiga Primary School",
        "Githioro Catholic Church",
    ],

    // Kinangop Constituency
    "Gathara": [
        "Gathara Primary School",
        "Gathara Market",
        "Gathara Social Hall",
        "Karembu Primary School",
        "Kangari Primary School",
        "Gathara ACK Church",
    ],
    "North Kinangop": [
        "North Kinangop Primary School",
        "North Kinangop Market",
        "Kamondo Primary School",
        "Kahuguini Primary School",
        "Kianda Primary School",
        "North Kinangop Social Hall",
    ],
    "Murungaru": [
        "Murungaru Primary School",
        "Murungaru Market",
        "Murungaru Social Hall",
        "Kiriti Primary School",
        "Ngata Primary School",
        "Murungaru ACK Church",
    ],
    "Njabini/Kiburu": [
        "Njabini Primary School",
        "Njabini Market",
        "Kiburu Primary School",
        "Kiburu Market",
        "Njabini Social Hall",
        "Ngecha Primary School",
        "Njabini ACK Church",
    ],
    "Nyakio": [
        "Nyakio Primary School",
        "Nyakio Market",
        "Nyakio Social Hall",
        "Kambirwa Primary School",
        "Nyakio ACK Church",
        "Nyakio Catholic Church",
    ],
    "Engineer": [
        "Engineer Market",
        "Engineer Primary School",
        "Engineer Social Hall",
        "Kithithina Primary School",
        "Githunguri Primary School",
        "Engineer ACK Church",
    ],
    "Gathabai": [
        "Gathabai Primary School",
        "Gathabai Market",
        "Gathabai Social Hall",
        "Muthithi Primary School",
        "Kihururu Primary School",
        "Gathabai ACK Church",
    ],
    "Muringanange": [
        "Muringanange Primary School",
        "Muringanange Market",
        "Muringanange Social Hall",
        "Kiria-ini Primary School",
        "Chinga Primary School",
        "Muringanange ACK Church",
    ],
};
