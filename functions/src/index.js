const firebaseFunctions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp();

const { ApolloServer, gql } = require('apollo-server-cloud-functions');

const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hippopotommy@gmail.com',
        pass: 'The daylight, it burns!'
    }
});

const AuthorisedUsers = firebaseAdmin
    .firestore()
    .collection('iodine_website_authorised_users');
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
        date: String
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
        mailingList(uid: String!): [MailingListItem]
    }
`;

const containersCommon =
    'max-width:600px;margin:0 auto;color:black;text-align:center;';
const tableCellStyles =
    'border: 1px solid #245966; padding: 0.5em 1em;color:black;';
const thStyles = `${tableCellStyles}text-align: center;background-color: #d4f8f8;`;
const tdStyles = `${tableCellStyles}text-align: left;background-color: #f2ffff;`;

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
                date: new Date().toLocaleDateString('zh-TW'),
                email,
                name,
                phone
            })
                .then(() => {
                    console.log('Successfully added to mailing list!');

                    const mailOptions = {
                        from: '躺馬式 <hippopotommy@gmail.com>',
                        to: 'sonic.chou@gmail.com',
                        cc: 'orangemimi3@gmail.com',
                        subject: '[碘131​貓甲亢治療中心] 新通知名單已加入',
                        html: `
                        <header style="${containersCommon}background-color: #A4E2E2;padding:20px 10px;">
                            <h1 style="font-size: 32px;margin:0.75em;">碘131​貓甲亢治療中心</h1>
                        </header>
                        <div style="${containersCommon}">
                            <p style="text-align:center;">上工啦！又有人訂閱囉！</p>
                            <table style="border-collapse:collapse;border:2px solid #245966;margin:0 auto;">
                                <tr>
                                    <th style="${thStyles}">姓名</th>
                                    <td style="${tdStyles}">${name}</td>
                                </tr>
                                <tr>
                                    <th style="${thStyles}">電話</th>
                                    <td style="${tdStyles}">${phone}</td>
                                </tr>
                                <tr>
                                    <th style="${thStyles}">Email</th>
                                    <td style="${tdStyles}">${email}</td>
                                </tr>
                                <tr>
                                    <th style="${thStyles}">縣市</th>
                                    <td style="${tdStyles}">${city}</td>
                                </tr>
                            </table>
                        </div>
                        <footer style="${containersCommon}background-color:#CFCFCF;padding:10px;margin-top:60px;">
                            © 2021 by Miao Cat Hospital
                        </footer>`
                    };
                    transporter.sendMail(mailOptions);

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
            }),
        mailingList: (parent, { uid }) => {
            return AuthorisedUsers.where('uid', '==', uid)
                .get()
                .then((querySnapshot) => {
                    if (querySnapshot.docs.length > 0) {
                        return IodineMailingList.get().then((querySnapshot) => {
                            return querySnapshot.docs.map((doc) => doc.data());
                        });
                    }
                    throw new Error('Sorry, you are not authorised.');
                })
                .catch((error) => error);
        }
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
