import Fastify, { FastifyRequest } from "fastify";
import { prisma } from "./lib/prismaClient";

const fastify = Fastify();

type CreateUserBody = {
  name: string;
  email: string;
};

type UpdateUserBody = {
  name?: string;
  email?: string;
  age?: number;
  isActive?: boolean;
};

fastify.post(
  "/users",
  async (request: FastifyRequest<{ Body: CreateUserBody }>, reply) => {
    const { email, name } = request.body;

    const user = await prisma.user.create({
      data: {
        email,
        name,
      },
      select: {
        id: true,
      },
    });

    return reply.code(201).send({ user });
  }
);

fastify.post(
  "/users/batch",
  async (
    request: FastifyRequest<{ Body: { users: CreateUserBody[] } }>,
    reply
  ) => {
    const { users } = request.body;

    const createdUsers = await prisma.user.createManyAndReturn({
      data: users,
      skipDuplicates: true,
      select: {
        id: true,
        name: true,
      },
    });

    return reply.code(201).send({ createdUsers });
  }
);

fastify.get("/users", async (request, reply) => {
  const users = await prisma.user.findMany();

  return reply.code(200).send({ users });
});

fastify.get("/stats", async (request, reply) => {
  const {
    _avg: { age: averageAge },
    _count: { email: totalsEmail, id: totalsPerson },
    _max: { age: oldestPerson },
    _min: { age: youngestPerson },
  } = await prisma.user.aggregate({
    _count: { email: true, id: true },
    _max: { age: true },
    _min: { age: true },
    _avg: { age: true },
  });

  return reply.send({
    stats: {
      totalsPerson,
      totalsEmail,
      oldestPerson,
      youngestPerson,
      averageAge,
    },
  });
});

fastify.put(
  "/users/:id",
  async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserBody }>,
    reply
  ) => {
    const { id } = request.params;

    const { age, email, isActive, name } = request.body;

    const user = await prisma.user.update({
      data: {
        age,
        email,
        isActive,
        name,
      },
      where: {
        id,
      },
    });

    return reply.send({ user });
  }
);

fastify.delete(
  "/users/:id",
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { id } = request.params;

    const user = await prisma.user.delete({
      where: {
        id,
      },
      select: { id: true, email: true },
    });

    return reply.send({ user });
  }
);

fastify
  .listen({
    port: 3000,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log(`> Server started`);
  });
