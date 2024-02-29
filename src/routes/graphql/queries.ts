import { GraphQLObjectType } from 'graphql';
import { ProfileQueries } from './types/profile.js';
import { UserQueries } from './types/user.js';


export const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    ...UserQueries,
    ...ProfileQueries,
  }
});
