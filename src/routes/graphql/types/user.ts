import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLString
} from 'graphql';
import {
  ResolveTree,
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';
import { ContextType } from './context.js';
import { PostType } from './posts.js';
import { ProfileType } from './profile.js';
import { UUIDType } from './uuid.js';

export interface IUserType {
  id: string;
  name: string;
  balance: number;
}

type UserSubs = {
  userId: string;
  authorId: string;
};

type SubscriberType = {
  subscriberId: string;
  authorId: string;
};

export const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields() {
    return {
      id: { type: UUIDType },
      name: { type: GraphQLString },
      balance: { type: GraphQLFloat },
      profile: {
        type: ProfileType,
        resolve: async (root: IUserType, args, context: ContextType) => {
          const { dataLoaders } = context;
          return await dataLoaders.profile.load(root.id);
        },
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve: async (root: IUserType, _, context: ContextType) => {
          const { dataLoaders } = context;
          return await dataLoaders.posts.load(root.id);
        },
      },
      subscribedToUser: {
        type: new GraphQLList(UserType),
        resolve: async (
          root: IUserType & { subscribedToUser?: SubscriberType[] },
          _,
          context: ContextType,
        ) => {
          const { dataLoaders } = context;
          if (Array.isArray(root.subscribedToUser) && root.subscribedToUser.length > 0) {
            const ids = root.subscribedToUser.map((i) => i.subscriberId);
            return await dataLoaders.user.loadMany(ids);
          }
          return [];
        },
      },
      userSubscribedTo: {
        type: new GraphQLList(UserType),
        resolve: async (
          root: IUserType & { userSubscribedTo?: SubscriberType[] },
          _,
          context: ContextType,
        ) => {
          const { dataLoaders } = context;
          if (Array.isArray(root.userSubscribedTo) && root.userSubscribedTo.length > 0) {
            const ids = root.userSubscribedTo.map((i) => i.authorId);
            return await dataLoaders.user.loadMany(ids);
          }
          return [];
        },
      },
    };
  },
});

export const UserQueries = {
  user: {
    type: UserType,
    args: { id: { type: UUIDType } },
    resolve: async (_, args: { id: string }, context: ContextType) => {
      const { dataLoaders } = context;
      return await dataLoaders.user.load(args.id);
    },
  },
  users: {
    type: new GraphQLList(UserType),
    resolve: async (_, _args, context: ContextType, info: GraphQLResolveInfo) => {
      const { dataBase, dataLoaders } = context;
      const parsedResolveInfo = parseResolveInfo(info) as ResolveTree;
      const { fields } = simplifyParsedResolveInfoFragmentWithType(
        parsedResolveInfo,
        new GraphQLList(UserType),
      );
      const users = await dataBase.user.findMany({
        include: {
          subscribedToUser: 'subscribedToUser' in fields && !!fields.subscribedToUser,
          userSubscribedTo: 'userSubscribedTo' in fields && !!fields.userSubscribedTo,
        },
      });

      users.forEach((res) => {
        dataLoaders.user.prime(res.id, res);
      });

      return users;
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

type UserBodyType = {
  dto: {
    name: string;
    balance: number;
  };
};

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
    resolve: async (_, args: UserBodyType, context: ContextType) => {
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
    resolve: async (_, args: UserBodyType & { id: string }, context: ContextType) => {
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
    resolve: async (_, args: { id: string }, context: ContextType) => {
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
    resolve: async (_, args: UserSubs, context: ContextType) => {
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
    resolve: async (_, args: UserSubs, context: ContextType) => {
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

export const userDataLoader = (dataBase: PrismaClient) => {
  return new DataLoader(async (keys: readonly string[]) => {
    const users = await dataBase.user.findMany({
      where: {
        id: {
          in: keys as string[],
        },
      },
      include: {
        userSubscribedTo: true,
        subscribedToUser: true,
      },
    });

    return keys.map((id) => users.find((u) => u.id === id));
  });
};
