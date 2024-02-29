import { GraphQLObjectType } from "graphql";
import { UserMutations } from "./types/user.js";

export const Mutations = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    ...UserMutations,
  }
});