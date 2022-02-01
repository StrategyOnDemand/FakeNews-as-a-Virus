# Collecting the relevant tweets from Twitter

This part of the code base represents the code for collecting all the relevant information from Twitter and Bot-o-meter.

The algorithm works as follows:
1. Define a `root` tweet, i.e. a tweet for which you want to find the origin on Twitter.
1. Given the tweet ID the algorithm will search for that tweet.
1. Once the tweet is collected the Named Entities are extracted
1. These entities are used to collected all `related` tweets.
1. The large set of tweets is then vectorised using the space library
1. All tweets in the vectorized space that are in within proximity to the original tweet are then extracted as `usefull`, i.e. they most likely are talking about the same topic as the original tweet.
1. For each of the tweets the user timeline of the author is collected and stored.