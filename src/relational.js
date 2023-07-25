const { createYoga } = require("graphql-yoga");
const { createSchema } = require("graphql-yoga");
const { createServer } = require("node:http");
const { v4: uuidv4 } = require("uuid");

// users array
let users = [
  {
    id: "1",
    name: "Andrew",
    email: "andrew@example.com",
    age: 27,
  },
  {
    id: "2",
    name: "Sarah",
    email: "sarah@example.com",
  },
  {
    id: "3",
    name: "Mike",
    email: "mike@example.com",
  },
];

// posts array
let posts = [
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

// comments array
let comments = [
  {
    id: "102",
    text: "This worked well for me. Thanks!",
    author: "3",
    post: "10",
  },
  {
    id: "103",
    text: "Glad you enjoyed it.",
    author: "1",
    post: "10",
  },
  {
    id: "104",
    text: "This did no work.",
    author: "2",
    post: "11",
  },
  {
    id: "105",
    text: "Nevermind. I got it to work.",
    author: "1",
    post: "11",
  },
];

// scaller Type String, Boolean, Int, Float, ID
// without ! => optional => can be give null, with ! => required can not give null
const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      users(query: String): [User!]!
      posts(query: String): [Post!]!
      comments: [Comment!]!
      me: User!
      post: Post!
    }

    type User {
      id: ID!
      name: String!
      email: String!
      age: Int
      posts: [Post!]!
    }

    type Post {
      id: ID!
      title: String!
      body: String!
      published: Boolean!
      author: User!
    }

    type Comment {
      id: ID!
      text: String!
      author: User!
      post: Post!
    }

    type Mutation {
      createUser(data: createUserInput): User!
      createPost(data: createPostInput): Post!
      createComment(data: createCommentInput): Comment!
      deleteUser(id: ID!): User!
      deletePost(id: ID!): Post!
      deleteComment(id: ID!): Comment!
      updateUser(id: ID!, data: updateUserInput!): User!
      updatePost(id: ID!, data: updatePostInput!): Post!
      updateComment(id: ID!, data: updateCommentInput): Comment!
    }

    input createUserInput {
      name: String!
      email: String!
      age: Int
    }

    input createPostInput {
      title: String!
      body: String!
      published: Boolean!
      author: ID!
    }

    input createCommentInput {
      text: String!
      author: String!
      post: ID!
    }

    input updateUserInput {
      name: String
      email: String
      age: Int
    }

    input updatePostInput {
      title: String
      body: String
      published: Boolean
      author: ID
    }

    input updateCommentInput {
      text: String
    }
  `,
  resolvers: {
    Query: {
      users(parent, args, ctx, info) {
        if (!args.query) {
          return users;
        }

        return users.filter((user) => {
          return user.name.toLowerCase().includes(args.query.toLowerCase());
        });
      },
      posts(parent, args, ctx, info) {
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
      comments(parent, args, ctx, info) {
        return comments;
      },
      me() {
        return {
          id: "123098",
          name: "Mike",
          email: "mike@example.com",
        };
      },
      post() {
        return {
          id: "092",
          title: "GraphQL 101",
          body: "",
          published: false,
        };
      },
    },
    Post: {
      author(parent, args, ctx, info) {
        return users.find((user) => {
          return user.id === parent.author;
        });
      },
    },
    User: {
      posts(parent, args, ctx, info) {
        return posts.filter((post) => {
          return post.author === parent.id;
        });
      },
    },
    Mutation: {
      createUser: (parent, args, ctx, info) => {
        const email = users.some((user) => user.email === args.data.email);
        if (email) {
          throw new Error("Email taken");
        }
        const user = {
          id: uuidv4(),
          ...args.data,
        };
        users.push(user);
        return user;
      },
      createPost: (parent, args, ctx, info) => {
        const userExists = users.some((user) => user.id === args.data.author);
        if (!userExists) {
          throw new Error("User not extis");
        }
        const post = {
          id: uuidv4(),
          ...args.data,
        };
        posts.push(post);
        return post;
      },
      createComment: (parent, args, ctx, info) => {
        const userExists = users.some((user) => user.id === args.data.author);
        const postExists = posts.some((post) => post.id === args.data.post);
        if (!userExists || !postExists) {
          throw new Error("Unable to find user and post");
        }

        const comment = {
          id: uuidv4(),
          ...args.data,
        };

        comments.push(comment);
        return comment;
      },
      deleteUser: (parent, args, ctx, info) => {
        const userIndex = users.findIndex((user) => user.id === args.id);
        if (userIndex === -1) {
          throw new error("User not found");
        }
        const deleteUser = users.splice(userIndex, 1);
        posts = posts.filter((post) => {
          const match = post.author === args.id;
          if (match) {
            comments = comments.filter((comment) => comment.post !== post.id);
          }
          return !match;
        });
        comments = comments.filter((comment) => comment.author !== args.id);
        return deleteUser[0];
      },

      deletePost: (parent, args, ctx, info) => {
        const postIndex = posts.findIndex((post) => post.id === args.id);

        if (postIndex === -1) {
          throw new Error("Post not found");
        }

        const deletedPosts = posts.splice(postIndex, 1);

        comments = comments.filter((comment) => comment.post !== args.id);
        return deletedPosts[0];
      },

      deleteComment(parent, args, ctx, info) {
        const commentIndex = comments.findIndex(
          (comment) => comment.id === args.id
        );

        if (commentIndex === -1) {
          throw new Error("Comment not found");
        }

        const deletedComments = comments.splice(commentIndex, 1);

        return deletedComments[0];
      },

      updateUser(parent, args, ctx, info) {
        const { id, data } = args;
        const user = users.find((user) => user.id === id);
        if (!user) {
          throw new Error("User Not Found");
        }

        if (typeof data.email === "string") {
          user.email = data.email;
        }
        if (typeof data.name === "string") {
          user.name = data.name;
        }
        if (typeof data.age !== "undefined") {
          user.age = data.age;
        }
        return user;
      },

      updatePost(parent, args, ctx, info) {
        const { id, data } = args;
        const post = posts.find((user) => user.id === id);
        if (!post) {
          throw new Error("Post Not Found");
        }
        if (typeof data.title === "string") {
          post.title = data.title;
        }
        if (typeof data.body === "string") {
          post.body = data.body;
        }
        if (typeof data.published === "boolean") {
          post.published = data.published;
        }

        return post;
      },

      updateComment(parent, args, ctx, info) {
        const { id, data } = args;
        const commment = comments.find((comment) => comment.id === id);
        if (!commment) {
          throw new Error("Comment Not Found");
        }
        if (typeof data.text === "string") {
          commment.text = data.text;
        }
        return commment;
      },
    },
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
