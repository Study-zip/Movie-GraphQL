import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
const typeDefs = ` #graphql
    type User {
        id: ID
        firstName: String!
        lastName: String!
        """
        Is the sum of firstName + lastName as a string
        """
        fullName: String!
    }
    """
    Tweet object represents a resource for a Tweet
    """
    type Tweet {
        id: ID!
        text: String!
        author: User
    }
    type Query {
        allMovies: [Movie!]!
        allUsers: [User!]!
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
        movie(id: String!): Movie
    }
    type Mutation {
      postTweet(text: String!, userId: ID!): Tweet
      """
      Delete a Tweet if found, else returns false
      """
      deleteTweet(id:ID!): Boolean!
    }
    type Movie {
      id: Int!
      url: String!
      imdb_code: String!
      title: String!
      title_english: String!
      title_long: String!
      slug: String!
      year: Int!
      rating: Float!
      runtime: Float!
      genres: [String]!
      summary: String
      description_full: String!
      synopsis: String
      yt_trailer_code: String!
      language: String!
      background_image: String!
      background_image_original: String!
      small_cover_image: String!
      medium_cover_image: String!
      large_cover_image: String!
      }
`;
let tweets = [
    {
        id: "1",
        text: "아 심심하다",
        userId: "nami1234",
    },
    {
        id: "2",
        text: "추우니까 더 졸리네",
        userId: "dogycoin00",
    },
];
let users = [
    {
        id: "nami1234",
        firstName: "Nam",
        lastName: "Huijeong",
    },
    {
        id: "dogycoin00",
        firstName: "Elon",
        lastName: "Musk",
    },
];
const resolvers = {
    Query: {
        allTweets: () => tweets,
        tweet(root, { id }) {
            return tweets.find((tweet) => tweet.id === id);
        },
        allUsers: () => {
            console.log("allUsers called");
            return users;
        },
        async allMovies() {
            try {
                const r = await fetch("https://yts.mx/api/v2/list_movies.json", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const json = await r.json();
                if (!json || !json.data || !json.data.movies) {
                    throw new Error("Invalid response format");
                }
                return json.data.movies;
            }
            catch (error) {
                console.error("Error fetching movies:", error);
                throw error;
            }
        },
        async movie(_, { id }) {
            try {
                const r = await fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const json = await r.json();
                if (!json || !json.data || !json.data.movie) {
                    throw new Error("Invalid response format");
                }
                return json.data.movie;
            }
            catch (error) {
                console.error("Error fetching movies:", error);
                throw error;
            }
        },
    },
    Mutation: {
        postTweet(_, { text, userId }) {
            const newTweet = {
                id: String(tweets.length + 1),
                text,
                userId,
            };
            const user = users.find((user) => user.id === userId);
            if (!user)
                throw new Error(`User ID ${userId} is not found.`);
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(_, { id }) {
            const tweet = tweets.find((tweet) => tweet.id === id);
            if (!tweet)
                return false;
            tweets = tweets.filter((tweet) => tweet.id !== id);
            return true;
        },
    },
    User: {
        fullName({ firstName, lastName }) {
            return `${firstName} ${lastName}`;
        },
    },
    Tweet: {
        author({ userId }) {
            return users.find((user) => user.id === userId);
        },
    },
};
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at: ${url}`);
