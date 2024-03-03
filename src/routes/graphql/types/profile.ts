import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { ContextType } from './context.js';
import { MemberType, MemberTypeEnum } from './member.js';
import { UserType } from './user.js';
import { UUIDType } from './uuid.js';

export interface IProfileType {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: MemberTypeEnum;
}

export const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields() {
    return {
      id: { type: UUIDType },
      isMale: { type: GraphQLBoolean },
      yearOfBirth: { type: GraphQLInt },
      userId: { type: UUIDType },
      memberTypeId: { type: GraphQLString },
      user: {
        type: UserType,
        resolve: async (root, _, context: ContextType) => {
          const { dataBase } = context;

          return await dataBase.user.findUnique({ where: { id: root.userId } });
        },
      },
      memberType: {
        type: MemberType,
        resolve: async (root: { memberTypeId: string }, _, context: ContextType) => {
          const { dataLoaders } = context;
          return await dataLoaders.memberType.load(root.memberTypeId);
        },
      },
    };
  },
});

export const ProfileQueries = {
  profile: {
    type: ProfileType,
    args: { id: { type: UUIDType } },
    resolve: async (_, args: { id: string }, context: ContextType) => {
      const { dataBase } = context;
      return await dataBase.profile.findUnique({ where: { id: args.id } });
    },
  },
  profiles: {
    type: new GraphQLList(ProfileType),
    resolve: async (_, _args, context: ContextType) => {
      const { dataBase } = context;
      return await dataBase.profile.findMany();
    },
  },
};

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: GraphQLString },
  }),
});

const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: GraphQLString },
  }),
});

type CreateProfileBody = {
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: string;
    userId: string;
  };
};
export const ProfileMutations = {
  createProfile: {
    type: ProfileType,
    args: {
      dto: {
        type: new GraphQLNonNull(CreateProfileInput),
      },
    },
    resolve: async (_, args: CreateProfileBody, context: ContextType) => {
      const { dataBase } = context;
      return await dataBase.profile.create({
        data: args.dto,
      });
    },
  },
  changeProfile: {
    type: ProfileType,
    args: {
      id: { type: UUIDType },
      dto: {
        type: new GraphQLNonNull(ChangeProfileInput),
      },
    },
    resolve: async (
      _,
      args: CreateProfileBody & { id: string },
      context: ContextType,
    ) => {
      const { dataBase } = context;
      return await dataBase.profile.update({
        where: { id: args.id },
        data: args.dto,
      });
    },
  },
  deleteProfile: {
    type: GraphQLString,
    args: {
      id: { type: UUIDType },
    },
    resolve: async (_, args: { id: string }, context: ContextType) => {
      const { dataBase } = context;
      await dataBase.profile.delete({
        where: {
          id: args.id,
        },
      });
    },
  },
};

export const profileDataLoader = (dataBase: PrismaClient) => {
  return new DataLoader(async (keys: readonly string[]) => {
    const profiles = await dataBase.profile.findMany({
      where: {
        userId: {
          in: keys as string[],
        },
      },
    });

    return keys.map((id) => profiles.find((p) => p.userId === id));
  });
};
