import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';

const MAX_DEPTH = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const queryDocument = parse(req.body.query);

      const validationErrors = validate(schema, queryDocument, [depthLimit(MAX_DEPTH)]);

      if (validationErrors.length > 0) {
        return { errors: validationErrors };
      }
      return await graphql({
        schema,
        source: req.body.query,
        contextValue: { dataBase: fastify.prisma },
        variableValues: req.body.variables,
      });
    },
  });
};

export default plugin;
