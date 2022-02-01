from wrapperFunctions import TwitterAPIFunctions
from textprocessing import ProcessingFunctions
from clusterRelatedTweets import ClusterTweets
import json
import os
import sys

if __name__ == '__main__':

    if len(sys.argv) != 3:
        print("incorrect number of arguments supplied")
        exit(1)

    tweet_id = sys.argv[1]
    token_file_location = sys.argv[2]

    # initialise twitter endpoint
    twitter_endpoint = TwitterAPIFunctions(token_file_location)
    processing_function = ProcessingFunctions()
    tweet_functions = ClusterTweets()

    # 1. check if tweet is already collected
    tweet_object = None
    if f"{tweet_id}.json" in os.listdir('custom_files'):
        tweet_object = json.load(open(os.path.join('custom_files', f"{tweet_id}.json"), "r"))
        print("loaded from history")

    # 2. collect the tweet
    if not tweet_object:
        tweet_object = twitter_endpoint.collect_tweet_information(tweet_id)
        json.dump(tweet_object, open(os.path.join('custom_files', f"{tweet_id}.json"), "w"))

    # 3. collect the named entities from the tweets
    entities = processing_function.get_named_entities(tweet_object['text'])

    # 4. build a query from the named entities
    queries = processing_function.create_queries(entities)

    # 5. collect the tweets based on the query
    related_tweets = twitter_endpoint.collect_tweets_from_query(queries[0])

    # 6. cluster relevant tweets
    relevant_tweets = tweet_functions.cluster_tweets(related_tweets, tweet_object)

    # 7. collect the tweets for the Interaction Strength
    user_timeline_dict = {}
    for relevant_tweet in relevant_tweets:
        author_id = relevant_tweet["author_id"]
        user_timeline = twitter_endpoint.collect_user_timeline(user_id=author_id)
        user_timeline_dict[author_id] = user_timeline

    # 8. Store the tweets and the user timelines
    json.dumps(relevant_tweets, open("../data/tweets.json", "w"))
    for user_timeline in user_timeline_dict.keys():
        json.dumps(user_timeline_dict[user_timeline], open(f"../data/userTimelines/{user_timeline}.json"))
