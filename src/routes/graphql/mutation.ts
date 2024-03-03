import { GraphQLObjectType } from 'graphql';
import { UserMutations } from './types/user.js';
import { PostMutations } from './types/posts.js';
import { ProfileMutations } from './types/profile.js';

export const Mutations = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    ...UserMutations,
    ...PostMutations,
    ...ProfileMutations,
  },
});
