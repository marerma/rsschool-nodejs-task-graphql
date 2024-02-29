import { GraphQLObjectType, GraphQLBoolean, GraphQLInt, GraphQLString, GraphQLList } from "graphql";
import { UserType } from "./user.js";
import { UUIDType } from "./uuid.js";
import { MemberTypeId } from "./member.js";

export interface IProfileType {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: MemberTypeId;
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