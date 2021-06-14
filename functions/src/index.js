const firebaseFunctions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp();

const { ApolloServer, gql } = require('apollo-server-cloud-functions');

const BlogPosts = firebaseAdmin.firestore().collection('blogposts');

const firestoreDocToArray = (snapshot) =>
    snapshot.docs.map((doc) => doc.data());

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
    type BlogPost {
        date: String
        description: String
        duration: Int
        title: String
        views: Int
    }
    type Query {
        hello: String
        blogposts: [BlogPost]
    }
`;

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        blogposts: () =>
            BlogPosts.get().then((querySnapshot) => {
                return querySnapshot.docs.map((doc) => doc.data());
            })
    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({
        headers: req.headers,
        req,
        res
    }),
    playground: true
});

exports.graphql = firebaseFunctions.https.onRequest(
    server.createHandler({
        cors: {
            origin: '*',
            credentials: true
        }
    })
);
