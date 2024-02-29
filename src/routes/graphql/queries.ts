import { GraphQLObjectType } from 'graphql';
import { ProfileQueries } from './types/profile.js';
import { UserQueries } from './types/user.js';
import { MemberTypeQueries } from './types/member.js';
import { PostTypeQueries } from './types/posts.js';


export const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    ...UserQueries,
    ...ProfileQueries,
    ...MemberTypeQueries,
    ...PostTypeQueries,
  }
});
