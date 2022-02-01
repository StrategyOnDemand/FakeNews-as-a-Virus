import fs from "fs";
import { edge, importedUserTimelines, Tweet, urlConnection, urlNode, userInfo, userNode } from "./fakeNewsTypes";
import { IS } from "./informationStrength";
import parseJson from 'parse-json';
import { pythonBridge } from "python-bridge";

function createDOT(userNodes: userNode[], urlNodes: urlNode[], edges: edge[], originalAuthor: string): string[] {
    const dotFileLines: string[] = [];
    dotFileLines.push("graph SIDN {");
    for (const userNode of userNodes) {
        if (userNode.screenname === originalAuthor) {
            dotFileLines.push(`\t${userNode.screenname} [label = "${userNode.screenname}", createdAt="${userNode.creation_date.split(".")[0].replace("T", " ")}", color="red"];`);
        } else {
            dotFileLines.push(`\t${userNode.screenname} [label = "${userNode.screenname}", createdAt="${userNode.creation_date.split(".")[0].replace("T", " ")}"];`);
        }
    }
    for (const urlNode of urlNodes) {
        dotFileLines.push(`\t${urlNode.base_url} [label = "${urlNode.base_url}", color="blue"];`);
    }
    for (const edge of edges) {
        dotFileLines.push(`\t${edge.from} -> ${edge.to};`);
    }
    dotFileLines.push("}");
    return dotFileLines;
}

async function SIDN() {
    console.log("starting the algoritm 🎉");

    // Get the tweet ID for the main tweet
    const TweetID: string = "[tweet-id]";

    // Collect related tweets from twitter
    // for now we just load-in the sample JSON which was collected with the python version of this algoritm
    const relatedTweets: Tweet[] = [];
    const relatedTweetsRaw = parseJson(fs.readFileSync(`../data/tweets.json`, 'utf-8'));
    for (let i = 0; i < relatedTweetsRaw.length; i++) {
        relatedTweets.push(relatedTweetsRaw[i]);
    }

    let userInfo: userInfo = {};
    for (let i = 0; i < relatedTweetsRaw.includes.users.length; i++) {
        userInfo[relatedTweetsRaw.includes.users[i].id] = relatedTweetsRaw.includes.users[i];
    }
    console.log(`Found ${relatedTweets.length} related tweets ✅`);

    // Collect the user timelines for all the authors of the relevant tweets
    let userTimelines: importedUserTimelines = {};
    const userTimelineFolder = "../data/userTimelines/";
    const files = fs.readdirSync(userTimelineFolder);
    for (let i = 0; i < files.length; i++) {
        userTimelines[files[i].split(".")[0]] = JSON.parse(fs.readFileSync(`${userTimelineFolder}${files[i]}`, 'utf-8'));
    }
    console.log(`Found ${Object.keys(userTimelines).length} related userTimelines ✅`);

    // Calculate a botscore for the users
    // --> NOT IMPLEMENTED IN THIS VERSION 😢

    // Define the information-strenght graph between the authors
    const informationStrengthObjects = IS(relatedTweets as Tweet[], userTimelines, userInfo);

    // Select only the relevant tweets, i.e. the tweets which have a dot product above the threshold
    function getOriginalTweet(): Tweet | null {
        for (const tweet of relatedTweets) {
            if (tweet.id === TweetID) {
                return tweet;
            }
        }
        return null;
    }
    const originalTweet = getOriginalTweet();


    const dot = (a: number[], b: number[]) => a.map((x: any, i: number) => {
        return a[i] * b[i];
    }).reduce((m: any, n: any) => m + n);

    for (const tweet of relatedTweets) {
        if (originalTweet !== null && tweet.embeddings && originalTweet.embeddings) {
            tweet.similarity_score = dot(originalTweet.embeddings, tweet.embeddings);
        }
    }

    // extract urls from relatedTweets
    const toBaseURL = (fullURL: string): string => {
        return fullURL.replace(/(http(s)?:\/\/)|(\/.*){1}/g, '');
    };

    const urlConnections: urlConnection[] = [];
    for (const tweet of relatedTweets) {
        if (tweet.entities && tweet.entities.urls) {
            for (const url of tweet.entities.urls) {
                urlConnections.push({
                    screenname: userInfo[tweet.author_id].username,
                    expanded_url: url.expanded_url,
                    base_url: toBaseURL(url.expanded_url)
                });
            }
        }
    }

    // Calculate the dot product between the articles in the database 
    // No valid databases were found

    // again select only the relevant articles, i.e. the articles with a dot product above the threshold


    // Visualise the data and return a list of nodes and edges
    // create IS nodes
    const userNodes: userNode[] = [];
    const edges: edge[] = [];
    for (const informationStrength of informationStrengthObjects) {
        userNodes.push({
            screenname: informationStrength.screenname,
            creation_date: informationStrength.created_at
        });
        for (const trustyUser in informationStrength.trustyUsers) {
            edges.push({
                from: trustyUser,
                to: informationStrength.screenname
            });
        }
    }

    const urlNodes: urlNode[] = [];
    for (const url of urlConnections) {
        urlNodes.push({
            base_url: url.base_url
        });
        edges.push({
            from: url.base_url,
            to: url.screenname
        });
    }

    // create the .dot file
    if (originalTweet) {
        const dotStringArray: string[] = createDOT(userNodes, urlNodes, edges, userInfo[originalTweet.author_id].username);
        const dotFile = fs.createWriteStream('output.dot');
        dotFile.on('error', function (err) { console.log(err) });
        dotStringArray.forEach((dotLine) => { dotFile.write(dotLine + '\n'); });
        dotFile.end();
    }


    console.log("Done 🔥");
}

SIDN();