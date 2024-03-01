import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
} from 'graphql';

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
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.memberType.findMany();
    },
  },
  memberType: {
    type: MemberType,
    args: { id: { type: MemberTypeIdEnum } },
    resolve: async (root, args, context, info) => {
      const { dataBase } = context;
      return await dataBase.memberType.findUnique({ where: { id: args.id } });
    },
  },
};
