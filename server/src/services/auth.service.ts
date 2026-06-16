import { User } from "@prisma/client";
import prisma from "../lib/prisma";

export async function createUser(username: string, password: string): Promise<User> {
  return await prisma.user.create({
    data: {
      username,
      password
    }
  });
}

export async function findUser(username: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { username }
  });
}