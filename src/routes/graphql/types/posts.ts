import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import { ContextType } from './context.js';
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
    resolve: async (_, _args, context: ContextType) => {
      const { dataBase } = context;
      return await dataBase.post.findMany();
    },
  },
  post: {
    type: PostType,
    args: { id: { type: UUIDType } },
    resolve: async (_, args: { id: string }, context: ContextType) => {
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

type ChangePostBody = {
  dto: {
    content: string;
    title: string;
    authorId: string;
  };
};

export const PostMutations = {
  createPost: {
    type: PostType,
    args: {
      dto: {
        type: new GraphQLNonNull(CreatePostInput),
      },
    },
    resolve: async (root, args: ChangePostBody, context: ContextType) => {
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
    resolve: async (
      _,
      args: Omit<ChangePostBody, 'authorId'> & { id: string },
      context: ContextType,
    ) => {
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
    resolve: async (_, args: { id: string }, context: ContextType) => {
      const { dataBase } = context;
      await dataBase.post.delete({
        where: {
          id: args.id,
        },
      });
    },
  },
};

export const postDataLoader = (dataBase: PrismaClient) => {
  return new DataLoader(async (keys: readonly string[]) => {
    const posts = await dataBase.post.findMany({
      where: {
        authorId: {
          in: keys as string[],
        },
      },
    });
    return keys.map((id) => {
      const item = posts.find((p) => p.authorId === id);
      return item ? [item] : [];
    });
  });
};
