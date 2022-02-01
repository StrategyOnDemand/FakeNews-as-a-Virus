import spacy

class ProcessingFunctions():

    def __init__(self) -> None:
        # initialize the spacy library with the dutch corpus
        self.nlp = spacy.load("nl_core_news_lg", )

    def get_named_entities(self, tweet_text: str):
        # this function deals with extracting the named entities from the tweet
        # currently we use the spacy library to extract the named entities
        tweet_tokens = self.nlp(tweet_text.replace(".", " ").replace("(", " ").replace(")", " "))
        tokens = [i for i in tweet_tokens]
        ents = list(tweet_tokens.ents)

        ents_to_remove = []
        for token in tokens:
            if token.like_url:
                ents_to_remove.append(token.text)
                
        for ent in ents:
            if ent.text in ents_to_remove:
                ents.remove(ent)
        return ents

    def create_queries(self, entities, max_query_length = 1024):
        # given a set of entities we create a query suitable to search twitter
        querys = [[]]
        query_end = " -is:retweet"
        cur_query = 0
        for entity in entities:
            parsted_entity = entity.text.replace('"', "'")
            if len(" " .join([*querys[cur_query], parsted_entity])) + len(query_end) < max_query_length:
                querys[cur_query].append(f"\"{parsted_entity}\"")
            else:
                cur_query += 1
                querys[cur_query] = [f"\"{parsted_entity}\""]
        for indx, query_entities in enumerate(querys):
            querys[indx] = " ".join(query_entities) + query_end

        return querys


if __name__ == "__main__":
    sentence = "Knielen op EK leidt tot verdeeldheid, in Nederland evenveel voor- als tegenstanders"
    object_to_test = ProcessingFunctions()
    named_entities = object_to_test.get_named_entities(sentence)
    print(object_to_test.create_queries(named_entities))
    print(named_entities)