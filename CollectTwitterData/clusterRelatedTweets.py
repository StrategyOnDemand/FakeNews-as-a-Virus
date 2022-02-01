import os
import json
import spacy
import numpy as np
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt

class ClusterTweets:

    def __init__(self) -> None:
        self.nlp = spacy.load("nl_core_news_lg")

    def cluster_tweets(self, tweets, original_tweet):
        # This function aims at clustering the tweets based on similair context
        # Based on the spacy library all of the tweets are vectorised
        # They are projected in a 2d space via PCA
        # Once that is done the tweets where the distance to the original tweets is to large
        # are considered to be about another topic
        vector_array = []
        text_array = []
        for tweet in tweets:
            nlp_data = self.nlp(tweet["text"])
            current_text = ""
            for token in nlp_data:
                if token.is_alpha and not token.is_stop and token.has_vector:
                    current_text += " " + token.text
            vector_data = self.nlp(current_text).vector
            text_array.append(current_text)
            vector_array.append(vector_data)

        vector_array = np.array(vector_array)
        pca = PCA(n_components=2)
        principal_components = pca.fit_transform(vector_array)

        nlp_data = self.nlp(original_tweet["text"])
        original_text_stripped = ""
        for token in nlp_data:
            if token.is_alpha and not token.is_stop and token.has_vector:
                original_text_stripped += " " + token.text
        vector_data = self.nlp(current_text).vector
        original_tweet_principal_components = pca.transform([vector_data])

        relevant_tweets = []
        for index, potential_tweet in enumerate(principal_components):
            dist = np.sqrt((potential_tweet[0] - original_tweet_principal_components[0][0]) ** 2 + (potential_tweet[1] - original_tweet_principal_components[0][1]) ** 2)
            if dist < 10:
                relevant_tweets.append(tweets[index])

        return relevant_tweets

    def plot_the_clusters(self, principal_components, original_tweet_principal_components, text_array):
        # This function is used to plot the tweets in the 2d space
        # only used during debugging
        fig,ax = plt.subplots()
        sc = plt.scatter(principal_components[:, 0],principal_components[:, 1])

        plt.scatter(original_tweet_principal_components[:, 0], original_tweet_principal_components[:, 1], c="red")

        annot = ax.annotate("", xy=(0,0), xytext=(20,20),textcoords="offset points",
                            bbox=dict(boxstyle="round", fc="w"),
                            arrowprops=dict(arrowstyle="->"),
                            fontsize=8)
        annot.set_visible(False)

        def update_annot(ind):

            pos = sc.get_offsets()[ind["ind"][0]]
            annot.xy = pos
            text = "{}, {}\n".format(" ".join(list(map(str,ind["ind"]))), 
                                " ".join([text_array[n] for n in ind["ind"]]))
            annot.set_text(text, )
            annot.get_bbox_patch().set_alpha(0.4)


        def hover(event):
            vis = annot.get_visible()
            if event.inaxes == ax:
                cont, ind = sc.contains(event)
                if cont:
                    update_annot(ind)
                    annot.set_visible(True)
                    fig.canvas.draw_idle()
                else:
                    if vis:
                        annot.set_visible(False)
                        fig.canvas.draw_idle()

        fig.canvas.mpl_connect("motion_notify_event", hover)
        plt.show()


if __name__ == "__main__":
    tweets_file = open(os.path.join("custom_files", "sample-1.json"), "r")

    tweets_json = json.load(tweets_file)

    ClusterTweets().cluster_tweets(tweets_json["data"])