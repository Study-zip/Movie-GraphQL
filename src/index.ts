import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = ` #graphql
    type User {
        id: ID
        username: String!
        firstName: String!
        lastName: String
    }
    type Tweet {
        id: ID
        text: String!
        author: User
    }
    type Query {
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
    }
    type Mutation {
      postTweet(text: String!, userId: ID!): Tweet
      deleteTweet(id:ID!): Boolean!
    }
`;
let allTweets = [
  {
    id: "1",
    text: "아 심심하다",
  },
  {
    id: "2",
    text: "추우니까 더 졸리네",
  },
];

const resolvers = {
  Query: {
    allTweets: () => allTweets,
    tweet(root, { id }) {
      return allTweets.find((tweet) => tweet.id === id);
    },
  },
  Mutation: {
    postTweet(_, { text, userId }) {
      const newTweet = {
        id: String(allTweets.length + 1),
        text,
      };
      allTweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(_, { id }) {
      const tweet = allTweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      allTweets = allTweets.filter((tweet) => tweet.id !== id);
      return true;
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
