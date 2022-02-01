import os
import json
import re
from pytwitter import Api
import time

class TwitterAPIFunctions():

    def __init__(self, api_keys_file_location: str) -> None:

        # check if it is a valid file
        if not os.path.isfile(api_keys_file_location):
            raise FileNotFoundError
        
        # obtain the bearer-token from the file
        key_file_data = json.load(open(api_keys_file_location, "r"))
        if "bearer-token" not in key_file_data.keys():
            raise ModuleNotFoundError

        bearer_token = key_file_data["bearer-token"]
        self.twitter_endpoint = Api(bearer_token=bearer_token)


    def collect_tweet_information(self, tweet_id: str) -> json:
        # collect the tweet infor by using:
        # https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/introduction

        # obtain:
        #   user_id
        #   tweet_text
        #   date
        tweet_info = self.twitter_endpoint.get_tweet(
            tweet_id,
            tweet_fields="author_id,text,created_at",
            return_json=True
        )

        print(tweet_info)

        if "data" in tweet_info:
            return tweet_info["data"]
        raise Exception(f"tweet {tweet_id} not found")

    def collect_tweets_from_query(self, query):
        all_tweets = []
        next_token = None
        print(query)
        page = 0
        while True:
            page += 1
            current_page_tweets = self.twitter_endpoint.search_tweets(
                query, 
                tweet_fields="author_id,text,created_at,entities",
                user_fields="username",
                expansions="author_id",
                query_type="all", 
                return_json=True, 
                next_token=next_token,
                max_results=500
                )
            json.dump(current_page_tweets, open(os.path.join('custom_files', f'sample-{page}.json'), "w"))
            
            if "data" not in current_page_tweets:
                raise Exception("no related tweets found")

            for tweet in current_page_tweets["data"]:
                all_tweets.append(tweet)

            if "next_token" in current_page_tweets["meta"]:
                next_token = current_page_tweets["meta"]["next_token"]
                time.sleep(1)
            else:
                break

        return all_tweets


    def collect_user_timeline(self, user_id):

        if os.path.exists(os.path.join('custom_files', f'{user_id}.json')):
            return json.load(open(os.path.join('custom_files', f'{user_id}.json'), "r"))

        user_timeline = self.twitter_endpoint.get_timelines(
            user_id, 
            tweet_fields="entities",
            max_results=100,
            return_json=True
        )

        if "data" in user_timeline:
            user_timeline = user_timeline["data"]

        json.dump(user_timeline, open(os.path.join('custom_files', f'{user_id}.json'), "w"))
        return user_timeline
        

