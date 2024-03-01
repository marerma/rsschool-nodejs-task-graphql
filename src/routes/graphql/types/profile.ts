import { GraphQLObjectType, GraphQLBoolean, GraphQLInt, GraphQLString, GraphQLList } from "graphql";
import { UserType } from "./user.js";
import { UUIDType } from "./uuid.js";
import { MemberType, MemberTypeEnum } from "./member.js";

export interface IProfileType {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: MemberTypeEnum;
}


export const ProfileType = new GraphQLObjectType({
  name: 'ProfileType',
  fields () {
    return ({
      id: {type: UUIDType},
      isMale: {type: GraphQLBoolean},
      yearOfBirth: {type: GraphQLInt},
      userId: {type: UUIDType},
      memberTypeId: {type: GraphQLString},
      user: {
        type: UserType,
        resolve: async (root, args, context, info) => {
          const {dataBase} = context;
          return await dataBase.user.findUnique({ where: { id: root.userId } })
        },
      },
      memberType: {
        type: MemberType,
        resolve: async (root, args, context, info) => {
          const {dataBase} = context;
          return await dataBase.memberType.findUnique({ where: { id: root.memberTypeId } })
        },
      }
    })
}
})

export const ProfileQueries = {
  profile: {
    type: ProfileType,
    args: {id: {type: UUIDType}},
    resolve: async (root, args, context, info) => {
      const {dataBase} = context;
      return await dataBase.profile.findUnique({ where: { id: args.id } })
    }
  },
  profiles: {
    type: new GraphQLList(ProfileType),
    resolve: async (root, args, context, info) => {
      const {dataBase} = context;
      return await dataBase.profile.findMany()
    }
  },
}