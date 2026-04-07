import {
    CONSTITUENCIES,
    CONSTITUENCY_WARDS,
    POLLING_STATIONS,
    ALL_WARDS,
    WARD_CONSTITUENCY,
} from "@/lib/geography";

export type Lang = "sw" | "en";

export const t: Record<string, Record<Lang, string>> = {
    appTitle:               { sw: "VoterCore Shambani",                en: "VoterCore Field" },
    submitReport:           { sw: "Wasilisha Ripoti",                  en: "Submit Report" },
    constituency:           { sw: "Jimbo",                             en: "Constituency" },
    ward:                   { sw: "Kata",                              en: "Ward" },
    location:               { sw: "Kituo cha Kura",                    en: "Polling Station" },
    reportType:             { sw: "Aina ya Ripoti",                    en: "Report Type" },
    candidate:              { sw: "Mgombea",                           en: "Candidate" },
    mood:                   { sw: "Hisia za Wapiga kura",              en: "Voter Mood" },
    notes:                  { sw: "Maelezo",                           en: "Notes" },
    photo:                  { sw: "Picha",                             en: "Photo" },
    voterSentiment:         { sw: "Hisia",                             en: "Sentiment" },
    oppositionSighting:     { sw: "Upinzani",                          en: "Opposition" },
    eventAttended:          { sw: "Tukio",                             en: "Event" },
    voterContact:           { sw: "Mawasiliano",                       en: "Contact" },
    alert:                  { sw: "Tahadhari",                         en: "Alert" },
    submitting:             { sw: "Inatuma...",                        en: "Sending..." },
    submitted:              { sw: "✓ Ripoti imetumwa",                 en: "✓ Report sent" },
    savedOffline:           { sw: "✓ Imehifadhiwa — itatumwa mtandao utakapowaka", en: "✓ Saved offline — will sync when online" },
    selectConstituency:     { sw: "— Chagua Jimbo —",                  en: "— Select Constituency —" },
    selectWard:             { sw: "— Chagua Kata —",                   en: "— Select Ward —" },
    selectStation:          { sw: "— Chagua Kituo —",                  en: "— Select Station —" },
    selectConstituencyFirst:{ sw: "— Chagua Jimbo kwanza —",           en: "— Select constituency first —" },
    selectWardFirst:        { sw: "— Chagua Kata kwanza —",            en: "— Select ward first —" },
    selectCandidate:        { sw: "— Chagua Mgombea —",                en: "— Select Candidate —" },
    login:                  { sw: "Ingia",                             en: "Login" },
    myReports:              { sw: "Ripoti zangu",                      en: "My Reports" },
    wardStandings:          { sw: "Hali ya Mgombea",                   en: "Candidate Standings" },
    recentAlerts:           { sw: "Tahadhari za Hivi Karibuni",        en: "Active Alerts" },
    voiceNote:              { sw: "Sauti",                             en: "Voice" },
    syncPending:            { sw: "Zinasubiri kutumwa",                en: "Pending sync" },
    offlineBanner:          { sw: "Bila mtandao — ripoti zitahifadhiwa hapa hapa", en: "Offline — reports will be saved and synced later" },
    syncBanner:             { sw: "ripoti zinasubiri kutumwa",         en: "reports waiting to sync" },
    newReport:              { sw: "Ripoti Mpya",                       en: "New Report" },
    history:                { sw: "Historia",                          en: "History" },
    syncing:                { sw: "Inatuma...",                        en: "Syncing..." },
    synced:                 { sw: "Zimetumwa!",                        en: "Synced!" },
};

export function tr(key: string, lang: Lang): string {
    return t[key]?.[lang] ?? key;
}

// Re-export geography constants for convenience in field app
export {
    CONSTITUENCIES,
    CONSTITUENCY_WARDS,
    POLLING_STATIONS,
    ALL_WARDS,
    WARD_CONSTITUENCY,
};

// Legacy alias — Ol Kalou wards only (backwards compat for field page)
export const OL_KALOU_WARDS = CONSTITUENCY_WARDS["Ol Kalou"];
