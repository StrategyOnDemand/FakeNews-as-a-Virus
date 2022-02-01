export interface userTimeline {
    "text": string;
    "id": string;
    "entities"?: {
        "mentions"?: 
            {
                "start": number;
                "end": number;
                "username": string;
                "id": string;
            }[],
        "urls"?:
            {
                "start": number;
                "end": number;
                "url": string;
                "expanded_url": string;
                "display_url": string;
            }[]
    }
}

export interface importedUserTimelines {
    [key: string] : userTimeline[];
}

export interface Tweet {
    "id": string;
    "author_id": string;
    "created_at": string;
    "text": string;
    "embeddings"?: number[];
    "similarity_score"?: number;
        "entities"?: {
            "mentions"?: 
            {
                "start": number;
                "end": number;
                "username": string;
                "id": string;
            }[],
        "urls"?:
            {
                "start": number;
                "end": number;
                "url": string;
                "expanded_url": string;
                "display_url": string;
            }[],
        "hashtags"?:
            {
                "start": number;
                "end": number;
                "tag": string;
            }[]
    }
}

export interface urlConnection {
    "screenname": string;
    "base_url": string;
    "expanded_url": string;
}

export interface InformationStrength {
    "screenname": string;
    "created_at": string;
    "trustyUsers": {
        [key: string]:{
            "retweets": number;
            "mentions": number;
            "quotes": number;
        }
    }
}

export interface userInfo{
    [key: string]: {
        id: string;
        name: string;
        username: string;
    }
}

export interface userNode{
    screenname: string;
    creation_date: string;
}

export interface urlNode{
    "base_url": string;
}

export interface edge{
    "from": string;
    "to": string;
}