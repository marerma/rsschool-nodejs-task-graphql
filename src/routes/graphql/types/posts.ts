import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
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

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  }),
});

const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});

export const PostMutations = {
  createPost: {
    type: PostType,
    args: {
      dto: {
        type: new GraphQLNonNull(CreatePostInput),
      },
    },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.post.create({
        data: args.dto,
      });
    },
  },
  changePost: {
    type: PostType,
    args: {
      id: { type: UUIDType },
      dto: {
        type: new GraphQLNonNull(ChangePostInput),
      },
    },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.post.update({
        where: { id: args.id },
        data: args.dto,
      });
    },
  },
  deletePost: {
    type: GraphQLString,
    args: {
      id: { type: UUIDType },
    },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      await dataBase.post.delete({
        where: {
          id: args.id,
        },
      });
    },
  },
};
