import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { ProfileType } from './profile.js';
import { UUIDType } from './uuid.js';
import { PostType } from './posts.js';

export interface IUserType {
  id: string;
  name: string;
  balance: number;
  subscribedToUser?: {
    authorId: string;
    subscriberId: string;
  }[];
  userSubscribedTo?: {
    subscriberId: string;
    authorId: string;
  }[];
}

export const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields() {
    return {
      id: { type: UUIDType },
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat },
      profile: {
        type: ProfileType,
        resolve: async (root, args, context, info) => {
          const { dataBase } = context;
          return await dataBase.profile.findUnique({ where: { userId: root.id } });
        },
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve: async (root, args, context, info) => {
          const { dataBase } = context;
          return await dataBase.post.findMany({ where: { authorId: root.id } });
        },
      },
      subscribedToUser: {
        type: new GraphQLList(UserType),
        resolve: async (root, args, context, info) => {
          const { dataBase } = context;
          return await dataBase.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: root.id,
                },
              },
            },
          });
        },
      },
      userSubscribedTo: {
        type: new GraphQLList(UserType),
        resolve: async (root, args, context, info) => {
          const { dataBase } = context;
          return await dataBase.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: root.id,
                },
              },
            },
          });
        },
      },
    };
  },
});

export const UserQueries = {
  user: {
    type: UserType,
    args: { id: { type: UUIDType } },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.user.findUnique({ where: { id: args.id } });
    },
  },
  users: {
    type: new GraphQLList(UserType),
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.user.findMany();
    },
  },
};

const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

export const UserMutations = {
  createUser: {
    type: UserType,
    args: {
      dto: {
        type: new GraphQLNonNull(CreateUserInput),
      },
    },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.user.create({
        data: args.dto,
      });
    },
  },
  changeUser: {
    type: UserType,
    args: {
      id: { type: UUIDType },
      dto: {
        type: new GraphQLNonNull(ChangeUserInput),
      },
    },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.user.update({
        where: { id: args.id },
        data: args.dto,
      });
    },
  },
  deleteUser: {
    type: GraphQLString,
    args: {
      id: { type: UUIDType },
    },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      await dataBase.user.delete({
        where: {
          id: args.id,
        },
      });
    },
  },

  subscribeTo: {
    type: UserType,
    args: {
      userId: { type: UUIDType },
      authorId: { type: UUIDType },
    },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.user.update({
        where: { id: args.userId },
        data: {
          userSubscribedTo: {
            create: {
              authorId: args.authorId,
            },
          },
        },
      });
    },
  },
  unsubscribeFrom: {
    type: GraphQLString,
    args: {
      userId: { type: UUIDType },
      authorId: { type: UUIDType },
    },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      await dataBase.user.update({
        where: { id: args.userId },
        data: {
          userSubscribedTo: {
            deleteMany: {
              authorId: args.authorId,
            },
          },
        },
      });
    },
  },
};
