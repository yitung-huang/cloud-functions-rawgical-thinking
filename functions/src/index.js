const firebaseFunctions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp();

const { ApolloServer, gql } = require('apollo-server-cloud-functions');

const BlogPosts = firebaseAdmin.firestore().collection('blogposts');
const IodineMailingList = firebaseAdmin
    .firestore()
    .collection('iodine_website_mailing_list');

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
    type MailingListItem {
        city: String
        email: String
        name: String
        phone: String
    }
    type Mutation {
        subscribeToIodineWebsiteMailingList(
            city: String!
            email: String!
            name: String!
            phone: String!
        ): Boolean
    }
    type Query {
        hello: String
        blogposts: [BlogPost]
    }
`;

// Provide resolver functions for your schema fields
const resolvers = {
    Mutation: {
        subscribeToIodineWebsiteMailingList: (
            _,
            { city, email, name, phone },
            { dataSources }
        ) => {
            return IodineMailingList.add({
                city,
                email,
                name,
                phone
            })
                .then(() => {
                    console.log('Successfully added to mailing list!');
                    return true;
                })
                .catch((error) => {
                    console.error('Error: ', error);
                    return false;
                });
        }
    },
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
