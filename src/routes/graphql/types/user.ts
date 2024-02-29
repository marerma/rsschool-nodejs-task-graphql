import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { ProfileType } from './profile.js';
import { UUIDType } from './uuid.js';

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
