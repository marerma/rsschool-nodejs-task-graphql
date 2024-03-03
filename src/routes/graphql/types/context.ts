import { PrismaClient } from '@prisma/client';
import { DataLoaderType } from '../data-loaders.js';

export type ContextType = {
  dataBase: PrismaClient;
  dataLoaders: DataLoaderType;
};