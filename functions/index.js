'use strict';

var _templateObject = _taggedTemplateLiteral(['\n  type Query {\n    hello: String\n  }\n'], ['\n  type Query {\n    hello: String\n  }\n']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var firebaseFunctions = require('firebase-functions');
var firebaseAdmin = require('firebase-admin');

firebaseAdmin.initializeApp();

var _require = require('apollo-server-cloud-functions'),
    ApolloServer = _require.ApolloServer,
    gql = _require.gql;

// Construct a schema, using GraphQL schema language


var typeDefs = gql(_templateObject);

// Provide resolver functions for your schema fields
var resolvers = {
  Query: {
    hello: function hello() {
      return 'Hello world!';
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
  }
});

exports.graphql = firebaseFunctions.https.onRequest(server.createHandler());