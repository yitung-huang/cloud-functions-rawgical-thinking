'use strict';

var _templateObject = _taggedTemplateLiteral(['\n    type BlogPost {\n        date: String\n        description: String\n        duration: Int\n        title: String\n        views: Int\n    }\n    type MailingListItem {\n        city: String\n        email: String\n        name: String\n        phone: String\n    }\n    type Mutation {\n        subscribeToIodineWebsiteMailingList(\n            city: String!\n            email: String!\n            name: String!\n            phone: String!\n        ): Boolean\n    }\n    type Query {\n        hello: String\n        blogposts: [BlogPost]\n        mailingList(uid: String!): [MailingListItem]\n    }\n'], ['\n    type BlogPost {\n        date: String\n        description: String\n        duration: Int\n        title: String\n        views: Int\n    }\n    type MailingListItem {\n        city: String\n        email: String\n        name: String\n        phone: String\n    }\n    type Mutation {\n        subscribeToIodineWebsiteMailingList(\n            city: String!\n            email: String!\n            name: String!\n            phone: String!\n        ): Boolean\n    }\n    type Query {\n        hello: String\n        blogposts: [BlogPost]\n        mailingList(uid: String!): [MailingListItem]\n    }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var firebaseFunctions = require('firebase-functions');
var firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp();

var _require = require('apollo-server-cloud-functions'),
    ApolloServer = _require.ApolloServer,
    gql = _require.gql;

var AuthorisedUsers = firebaseAdmin.firestore().collection('iodine_website_authorised_users');
var BlogPosts = firebaseAdmin.firestore().collection('blogposts');
var IodineMailingList = firebaseAdmin.firestore().collection('iodine_website_mailing_list');

var firestoreDocToArray = function firestoreDocToArray(snapshot) {
    return snapshot.docs.map(function (doc) {
        return doc.data();
    });
};

// Construct a schema, using GraphQL schema language
var typeDefs = gql(_templateObject);

// Provide resolver functions for your schema fields
var resolvers = {
    Mutation: {
        subscribeToIodineWebsiteMailingList: function subscribeToIodineWebsiteMailingList(_, _ref, _ref2) {
            var city = _ref.city,
                email = _ref.email,
                name = _ref.name,
                phone = _ref.phone;
            var dataSources = _ref2.dataSources;

            return IodineMailingList.add({
                city: city,
                email: email,
                name: name,
                phone: phone
            }).then(function () {
                console.log('Successfully added to mailing list!');
                return true;
            }).catch(function (error) {
                console.error('Error: ', error);
                return false;
            });
        }
    },
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
        },
        mailingList: function mailingList(parent, _ref3) {
            var uid = _ref3.uid;

            return AuthorisedUsers.where('uid', '==', uid).get().then(function (querySnapshot) {
                if (querySnapshot.docs.length > 0) {
                    return IodineMailingList.get().then(function (querySnapshot) {
                        return querySnapshot.docs.map(function (doc) {
                            return doc.data();
                        });
                    });
                }
                throw new Error('Sorry, you are not authorised.');
            }).catch(function (error) {
                return error;
            });
        }
    }
};

var server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: function context(_ref4) {
        var req = _ref4.req,
            res = _ref4.res;
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