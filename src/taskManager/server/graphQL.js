const {
  fileLoader,
  mergeTypes,
  mergeResolvers,
} = require("merge-graphql-schemas");
const path = require("path");

// mergers the GraphQL schema
const typeDefs = mergeTypes(
  fileLoader(path.join(__dirname, "../graphql/schema"))
);
// Compiles the GraphQL resolvers
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, "../graphql/resolvers"))
);

module.exports.typeDefs = typeDefs;
module.exports.resolvers = resolvers;
