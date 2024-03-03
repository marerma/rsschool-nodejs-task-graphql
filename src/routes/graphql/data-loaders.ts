import { PrismaClient } from '@prisma/client';
import { userDataLoader } from './types/user.js';
import { postDataLoader } from './types/posts.js';
import { memberTypeDataLoader } from './types/member.js';
import { profileDataLoader } from './types/profile.js';

export const createLoaders = (dataBase: PrismaClient) => {
  return {
    user: userDataLoader(dataBase),
    profile: profileDataLoader(dataBase),
    memberType: memberTypeDataLoader(dataBase),
    posts: postDataLoader(dataBase),
  }
}

export type DataLoaderType = ReturnType<typeof createLoaders>