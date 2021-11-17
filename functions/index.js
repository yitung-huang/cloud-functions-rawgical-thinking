'use strict';

var _templateObject = _taggedTemplateLiteral(['\n    type BlogPost {\n        date: String\n        description: String\n        duration: Int\n        title: String\n        views: Int\n    }\n    type MailingListItem {\n        city: String\n        email: String\n        name: String\n        phone: String\n    }\n    type Mutation {\n        subscribeToIodineWebsiteMailingList(\n            city: String!\n            email: String!\n            name: String!\n            phone: String!\n        ): Boolean\n    }\n    type Query {\n        hello: String\n        blogposts: [BlogPost]\n        mailingList(uid: String!): [MailingListItem]\n    }\n'], ['\n    type BlogPost {\n        date: String\n        description: String\n        duration: Int\n        title: String\n        views: Int\n    }\n    type MailingListItem {\n        city: String\n        email: String\n        name: String\n        phone: String\n    }\n    type Mutation {\n        subscribeToIodineWebsiteMailingList(\n            city: String!\n            email: String!\n            name: String!\n            phone: String!\n        ): Boolean\n    }\n    type Query {\n        hello: String\n        blogposts: [BlogPost]\n        mailingList(uid: String!): [MailingListItem]\n    }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var firebaseFunctions = require('firebase-functions');
var firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp();

var _require = require('apollo-server-cloud-functions'),
    ApolloServer = _require.ApolloServer,
    gql = _require.gql;

var nodemailer = require('nodemailer');
var cors = require('cors')({ origin: true });

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hippopotommy@gmail.com',
        pass: 'Ionia still stands!'
    }
});

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

var containersCommon = 'max-width:600px;margin:0 auto;color:black;text-align:center;';
var tableCellStyles = 'border: 1px solid #245966; padding: 0.5em 1em;color:black;';
var thStyles = tableCellStyles + 'text-align: center;background-color: #d4f8f8;';
var tdStyles = tableCellStyles + 'text-align: left;background-color: #f2ffff;';

var greetings = ['上工啦！又有人訂閱囉！', '老闆娘，人客喔！', '要快『碘』通知我喔！', '偶也不太蘇胡捏...你們也看人嗎？', '希望你們快點開工喔！', '我聽說澳洲有隻狗叫做慕斯，她so可愛的耶 ♥', '『唉唷叮』到底是什麼東西蛤？', '我自願當貢品！', '你不要一直看恐怖片啦！', '凜冬將至...', '既然你誠心誠意的發問了...我們就大發慈悲的告訴你！'];

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

                var mailOptions = {
                    from: '躺馬式 <hippopotommy@gmail.com>',
                    to: 'yitunghuang83@gmail.com',
                    cc: 'whytihuang@gmail.com',
                    subject: '[碘131​貓甲亢治療中心] 新通知名單已加入',
                    html: '\n                        <header style="' + containersCommon + 'background-color: #A4E2E2;padding:20px 10px;">\n                            <h1 style="font-size: 32px;margin:0.75em;">\u7898131\u200B\u8C93\u7532\u4EA2\u6CBB\u7642\u4E2D\u5FC3</h1>\n                        </header>\n                        <div style="' + containersCommon + '">\n                            <p style="text-align:center;">' + greetings[Math.floor(Math.random() * greetings.length)] + '</p>\n                            <table style="border-collapse:collapse;border:2px solid #245966;margin:0 auto;">\n                                <tr>\n                                    <th style="' + thStyles + '">\u59D3\u540D</th>\n                                    <td style="' + tdStyles + '">' + name + '</td>\n                                </tr>\n                                <tr>\n                                    <th style="' + thStyles + '">\u96FB\u8A71</th>\n                                    <td style="' + tdStyles + '">' + phone + '</td>\n                                </tr>\n                                <tr>\n                                    <th style="' + thStyles + '">Email</th>\n                                    <td style="' + tdStyles + '">' + email + '</td>\n                                </tr>\n                                <tr>\n                                    <th style="' + thStyles + '">\u7E23\u5E02</th>\n                                    <td style="' + tdStyles + '">' + city + '</td>\n                                </tr>\n                            </table>\n                        </div>\n                        <footer style="' + containersCommon + 'background-color:#CFCFCF;padding:10px;margin-top:60px;">\n                            \xA9 2021 by Miao Cat Hospital\n                        </footer>'
                };
                transporter.sendMail(mailOptions);

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