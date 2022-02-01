import { importedUserTimelines, InformationStrength, Tweet, userInfo } from "./fakeNewsTypes";

export function IS(relatedTweets: Tweet[], userTimelines: importedUserTimelines, userInfo: userInfo) : InformationStrength[]{
    const informationStrengthArray: InformationStrength[] = [];
    if(relatedTweets.length === 0){
        // No sense in creating an IS graph
        return informationStrengthArray;
    }

    // tweets are sorted where relatedTweets[0] is the newest en relatedTweets[relatedTweets.length-1] is the oldest
    let counter = 0;
    console.log(relatedTweets);
    for (const currentTweet of relatedTweets){
        const currentAuthor = currentTweet.author_id;
        let currentUserInformationStrength: InformationStrength = {
            screenname: userInfo[currentAuthor].username,
            created_at: currentTweet.created_at,
            trustyUsers: {}
        }
        const authorsToCheck: string[] = [];
        for(let p = counter-1; p >= 0; p--){
            authorsToCheck.push(userInfo[relatedTweets[p].author_id].username);
        }
        if(!(currentAuthor in userTimelines)){
            console.log(userInfo[currentAuthor].username, "has no public timeline 😢");
            continue;
        }
        const currentTimeline = userTimelines[currentAuthor];
        for (const tweet of currentTimeline){
            // console.log(tweet);
            if(tweet.entities){
                if(tweet.entities.mentions){
                    for(const mention of tweet.entities.mentions){
                        // check if there is a retweet of an authorToCheck
                        if(tweet.text[0] === "R" && tweet.text[1] === "T" && mention.start === 3){
                            for(const author of authorsToCheck){
                                if(author === mention.username){
                                    // add to retweet
                                    console.log(userInfo[currentAuthor].username, "retweeted", author,);
                                    if(author in currentUserInformationStrength.trustyUsers){
                                        currentUserInformationStrength.trustyUsers[author].retweets += 1;
                                    }else{
                                        currentUserInformationStrength.trustyUsers[author] = {
                                            retweets: 1,
                                            quotes: 0,
                                            mentions: 0
                                        }
                                    }
                                }
                            }
                        }else{
                            // check if there is a mention of an authorToCheck
                            for(const author of authorsToCheck){
                                if(author === mention.username){
                                    // add to mention
                                    console.log(userInfo[currentAuthor].username, "mentioned", author,);
                                    if(author in currentUserInformationStrength.trustyUsers){
                                        currentUserInformationStrength.trustyUsers[author].mentions += 1;
                                    }else{
                                        currentUserInformationStrength.trustyUsers[author] = {
                                            retweets: 0,
                                            quotes: 0,
                                            mentions: 1
                                        }
                                    }
                                }
                            }
                        }                    
                    }
                }
                if(tweet.entities.urls){
                    for(const url of tweet.entities.urls){
                        const regex = /https:\/\/twitter.com\/\w{3,}\/status/;
                        const matchingURLs = url.expanded_url.match(regex);
                        if (matchingURLs){
                            for (const match of matchingURLs){
                                const authorOfQuotedTweet = match.replace("https://twitter.com/", "").replace("/status", "");
                                for(const author of authorsToCheck){
                                    if(author === authorOfQuotedTweet){
                                        // add to quote
                                        console.log(userInfo[currentAuthor].username, "quoted", author,);
                                        if(author in currentUserInformationStrength.trustyUsers){
                                            currentUserInformationStrength.trustyUsers[author].quotes += 1;
                                        }else{
                                            currentUserInformationStrength.trustyUsers[author] = {
                                                retweets: 0,
                                                quotes: 1,
                                                mentions: 0
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        informationStrengthArray.push(currentUserInformationStrength);
        counter++;
    }

    // for every tweet, look in the userTimeline between interaction of authores who tweeted before their tweet

    // construct an IS object
    return informationStrengthArray;
}