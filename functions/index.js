'use strict';

var _templateObject = _taggedTemplateLiteral(['\n    type BlogPost {\n        date: String\n        description: String\n        duration: Int\n        title: String\n        views: Int\n    }\n    type Query {\n        hello: String\n        blogposts: [BlogPost]\n    }\n'], ['\n    type BlogPost {\n        date: String\n        description: String\n        duration: Int\n        title: String\n        views: Int\n    }\n    type Query {\n        hello: String\n        blogposts: [BlogPost]\n    }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var firebaseFunctions = require('firebase-functions');
var firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp();

var _require = require('apollo-server-cloud-functions'),
    ApolloServer = _require.ApolloServer,
    gql = _require.gql;

var BlogPosts = firebaseAdmin.firestore().collection('blogposts');

var firestoreDocToArray = function firestoreDocToArray(snapshot) {
    return snapshot.docs.map(function (doc) {
        return doc.data();
    });
};

// Construct a schema, using GraphQL schema language
var typeDefs = gql(_templateObject);

// Provide resolver functions for your schema fields
var resolvers = {
    Query: {
        hello: function hello() {
            return 'Hello world!';
        },
        blogposts: function blogposts() {
            return BlogPosts.get().then(function (querySnapshot) {
                return querySnapshot.docs.map(function (doc) {
                    return doc.data();
                });
            });
        }
    }
};

var server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: function context(_ref) {
        var req = _ref.req,
            res = _ref.res;
        return {
            headers: req.headers,
            req: req,
            res: res
        };
    },
    playground: true
});

exports.graphql = firebaseFunctions.https.onRequest(server.createHandler({
    cors: {
        origin: '*',
        credentials: true
    }
}));