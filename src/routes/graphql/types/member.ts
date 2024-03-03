import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
} from 'graphql';
import { ContextType } from './context.js';

export const enum MemberTypeEnum {
  business = 'business',
  basic = 'basic',
}

export const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeIdEnum },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
  }),
});

export const MemberTypeQueries = {
  memberTypes: {
    type: new GraphQLList(MemberType),
    resolve: async (_, _args, context: ContextType) => {
      const { dataBase } = context;
      return await dataBase.memberType.findMany();
    },
  },
  memberType: {
    type: MemberType,
    args: { id: { type: MemberTypeIdEnum } },
    resolve: async (_, args: { id: string }, context: ContextType) => {
      const { dataBase } = context;

      return await dataBase.memberType.findUnique({ where: { id: args.id } });
    },
  },
};

export const memberTypeDataLoader = (dataBase: PrismaClient) => {
  return new DataLoader(async (keys: readonly string[]) => {
    const memberTypes = await dataBase.memberType.findMany({
      where: {
        id: {
          in: keys as string[],
        },
      },
    });

    return keys.map((id) => memberTypes.find((p) => p.id === id));
  });
};
