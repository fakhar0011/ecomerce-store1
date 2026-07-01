import { ApolloClient, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import createUploadLink from "apollo-upload-client/UploadHttpLink.mjs";

const uploadLink = new createUploadLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "",
});

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_WS_URL || "",
    connectionParams: () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      return {
        Authorization: token ? `Bearer ${token}` : "",
      };
    },
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(uploadLink),
);

// ✅ Cache with type policies to prevent data loss warnings
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getUserNotifications: {
            merge(existing = [], incoming: any[]) {
              // Replace old array with new one (no merging)
              return incoming;
            },
          },
          orders: {
            merge(existing = [], incoming: any[]) {
              // Replace old array with new one (no merging)
              return incoming;
            },
          },
        },
      },
    },
  }),
});

export default client;
