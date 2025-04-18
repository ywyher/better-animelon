import { AnimeFormat, AnimeSeason, AnimeSort, AnimeSource, AnimeStatus } from "@/types/anime"

export const statuses: AnimeStatus[] = [
    "CANCELLED",
    "FINISHED",
    "HIATUS",
    "NOT_YET_RELEASED",
    "RELEASING"
]

export const formats: AnimeFormat[] = [
    "TV",
    "TV_SHORT",
    "MOVIE",
    "SPECIAL",
    "OVA",
    "ONA",
    "MUSIC",
    "MANGA",
    "NOVEL",
    "ONE_SHOT",
]

export const seasons: AnimeSeason[] = [
    "FALL",
    "SPRING",
    "SUMMER",
    "WINTER"
]

export const sources: AnimeSource[] = [
    "ORIGINAL",
    "MANGA",
    "LIGHT_NOVEL",
    "VISUAL_NOVEL",
    "VIDEO_GAME",
    "OTHER",
    "NOVEL",
    "DOUJINSHI",
    "ANIME",
    "WEB_NOVEL",
    "LIVE_ACTION",
    "GAME",
    "COMIC",
    "MULTIMEDIA_PROJECT",
    "PICTURE_BOOK",
]

export const sort: AnimeSort[] = [
    "ID",	
    "ID_DESC",	
    "TITLE_ROMAJI",	
    "TITLE_ROMAJI_DESC",	
    "TITLE_ENGLISH",	
    "TITLE_ENGLISH_DESC",	
    "TITLE_NATIVE",	
    "TITLE_NATIVE_DESC",	
    "TYPE",	
    "TYPE_DESC",	
    "FORMAT",	
    "FORMAT_DESC",	
    "START_DATE",	
    "START_DATE_DESC",	
    "END_DATE",	
    "END_DATE_DESC",	
    "SCORE",	
    "SCORE_DESC",	
    "POPULARITY",	
    "POPULARITY_DESC",	
    "TRENDING",	
    "TRENDING_DESC",	
    "EPISODES",	
    "EPISODES_DESC",	
    "DURATION",	
    "DURATION_DESC",	
    "STATUS",	
    "STATUS_DESC",	
    "CHAPTERS",	
    "CHAPTERS_DESC",	
    "VOLUMES",	
    "VOLUMES_DESC",	
    "UPDATED_AT",	
    "UPDATED_AT_DESC",	
    "SEARCH_MATCH",	
    "FAVOURITES",	
    "FAVOURITES_DESC"	
]

export const countries = [
    {
        value: "JP",
        label: "Japan"
    },
    {
        value: "KR",
        label: "South Korea"
    },
    {
        value: "TW",
        label: "Taiwan"
    },
    {
        value: "CN",
        label: "China"
    }
];

export const subtitleTranscriptions = ['japanese', 'hiragana', 'katakana', 'romaji', 'english'] as const
export const subtitleFormats = [
    "vtt",
    'srt',
    'ass'
] as const

export const vttEn = "https://s.megastatics.com/subtitle/6422ef1d64b31a672f041ef180be0c1b/6422ef1d64b31a672f041ef180be0c1b.vtt"
export const srtJp = "https://jimaku.cc/entry/2184/download/%5BAC%5D%20Boku%20dake%20ga%20Inai%20Machi%20-%2004%20%5B720p%5D%5BLucifer22%5D%5BCrunchyroll%20Timed%5D.ja.srt" 
export const srtEn = "https://gist.githubusercontent.com/matibzurovski/d690d5c14acbaa399e7f0829f9d6888e/raw/63578ca30e7430be1fa4942d4d8dd599f78151c7/example.srt" 

export const ankiFieldsValues = [
    "expression",
    "sentance",
    "image",
    "definition"
]