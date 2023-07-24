const { createYoga } = require("graphql-yoga");
const { createSchema } = require("graphql-yoga");
const { createServer } = require("node:http");

const users = [
  {
    id: 1,
    name: "Mohit",
    email: "mkpatel1234@gmail.com",
    age: 25,
  },
  {
    id: 2,
    name: "Vishal",
    email: "vbpatel1234@gmail.com",
    age: 25,
  },
  {
    id: 3,
    name: "Nirav",
    email: "nrpatel1234@gmail.com",
    age: 24,
  },
  {
    id: 4,
    name: "Sahil",
    email: "stpatel1234@gmail.com",
    age: 26,
  },
  {
    id: 5,
    name: "Tushar",
    email: "ttpatel1234@gmail.com",
    age: 23,
  },
];

const posts = [
  {
    id: "10",
    title: "GraphQL 101",
    body: "This is how to use GraphQL...",
    published: true,
    author: "1",
  },
  {
    id: "11",
    title: "GraphQL 201",
    body: "This is an advanced GraphQL post...",
    published: false,
    author: "1",
  },
  {
    id: "12",
    title: "Programming Music",
    body: "",
    published: false,
    author: "2",
  },
];
// scaller Type String, Boolean, Int, Float, ID
// without ! => optional => can be give null, with ! => required can not give null
const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      id: ID!
      name: String!
      age: Int!
      employed: Boolean!
      gpa: Float
      me: User!
      greeting(name: String!, id: ID!): String!
      grades: [Int!]!
      totalGrade(grades: [Int!]!): Int!
      users: [User!]!
      getAllUsers(query: String): [User!]!
      post: Post!
      posts(query: String): [Post!]!
    }

    type User {
      id: ID!
      name: String!
      email: String!
      age: Int
    }

    type Post {
      id: ID!
      title: String!
      body: String!
      published: Boolean!
    }
  `,
  resolvers: {
    Query: {
      id: () => "55", // ID!
      name: () => "Mohit Kapadiya", // String
      age: () => 23, // Int
      employed: () => true, // Boolean
      gpa: () => 2.23, // Float
      me: () => {
        // User!
        return {
          id: 5,
          name: "Vishal B",
          email: "vb@gmail.com", // required can not be null
          age: 25, // optional can be return null
        };
      },
      greeting: (parens, args, ctx, info) => {
        // pass argument
        if (args.name && args.id) {
          return `${args.name} are very awesome! Your id is ${args.id}`;
        }
      },
      grades: () => [1, 2, 3, 4, 5], // array
      totalGrade: (parens, args, ctx, info) => {
        // pass arguments with array
        return args.grades.reduce((accumulator, currentValue) => {
          return accumulator + currentValue;
        });
      },
      users: () => {
        return users;
      },
      getAllUsers: (parens, args, ctx, info) => {
        if (!args.query) {
          return users;
        }
        return users.filter((user) => {
          const isMatchName = user.name
            .toLowerCase()
            .includes(args.query.toLowerCase());
          const isMatchEmail = user.email
            .toLowerCase()
            .includes(args.query.toLowerCase());
          return isMatchName || isMatchEmail;
        });
      },
      posts:(parent, args, ctx, info) => {
        if (!args.query) {
          return posts;
        }

        return posts.filter((post) => {
          const isTitleMatch = post.title
            .toLowerCase()
            .includes(args.query.toLowerCase());
          const isBodyMatch = post.body
            .toLowerCase()
            .includes(args.query.toLowerCase());
          return isTitleMatch || isBodyMatch;
        });
      },
      post: () => {
        return {
          id: 1,
          title: "This is for example post",
          body: "best body",
          published: true,
          auther: "Mohit Kapadiya",
        };
      },
    }
  },
});

// Create a Yoga instance with a GraphQL schema.
const yoga = createYoga({ schema });

// Pass it into a server to hook into request handlers.
const server = createServer(yoga);

// Start the server and you're done!
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
