import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { UUIDType } from './uuid.js';

export const PostType = new GraphQLObjectType({
  name: 'PostType',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  }),
});

export const PostTypeQueries = {
  posts: {
    type: new GraphQLList(PostType),
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.post.findMany();
    },
  },
  post: {
    type: PostType,
    args: { id: { type: UUIDType } },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.post.findUnique({ where: { id: args.id } });
    },
  },
};
