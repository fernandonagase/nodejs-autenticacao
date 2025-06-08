import { User } from "../domain/user/user.js";
import { Argon2idHasher } from "../tools/argon2idHasher.js";
import { prisma } from "../tools/prisma.js";
import { Result } from "../tools/result.js";
import { IUserRepository } from "./interfaces/user-repository.js";

type UserWithId = Omit<User, "id"> & { id: number };

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<Result<UserWithId>> {
    if (!user.password) {
      return Result.failure("Senha não definida para o usuário");
    }
    let createdUser:
      | Awaited<ReturnType<typeof prisma.usuario.create>>
      | undefined;
    try {
      createdUser = await prisma.usuario.create({
        data: {
          nomeusuario: user.username,
          nome: user.firstName,
          email: user.email,
          senha: user.password,
          criado_em: user.createdAt,
          alterado_em: user.updatedAt,
        },
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return Result.failure("Erro ao criar usuário");
    }
    const userReturn = new User(
      createdUser.nomeusuario,
      createdUser.nome,
      createdUser.email,
      createdUser.criado_em,
      createdUser.alterado_em,
      new Argon2idHasher(),
    );
    userReturn.id = createdUser.idusuario;
    return Result.success(userReturn as UserWithId);
  }

  async update(user: User): Promise<Result<void>> {
    if (!user.id) {
      return Result.failure("ID do usuário não definido");
    }
    try {
      await prisma.usuario.update({
        where: { idusuario: user.id },
        data: {
          nome: user.firstName,
          email_verificado: user.verifiedEmail,
          alterado_em: new Date(),
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return Result.failure("Erro ao atualizar usuário");
    }
    return Result.success();
  }

  async findById(userId: number): Promise<Result<User | null>> {
    let foundUser:
      | Awaited<ReturnType<typeof prisma.usuario.findUnique>>
      | undefined;
    try {
      foundUser = await prisma.usuario.findUnique({
        where: { idusuario: userId },
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return Result.failure("Erro ao buscar usuário");
    }
    if (!foundUser) {
      return Result.success(null);
    }
    const user = new User(
      foundUser.nomeusuario,
      foundUser.nome,
      foundUser.email,
      foundUser.criado_em,
      foundUser.alterado_em,
      new Argon2idHasher(),
    );
    user.id = foundUser.idusuario;
    user.password = foundUser.senha;
    return Result.success(user);
  }

  async findByUsername(username: string): Promise<Result<User | null>> {
    let foundUser:
      | Awaited<ReturnType<typeof prisma.usuario.findUnique>>
      | undefined;
    try {
      foundUser = await prisma.usuario.findUnique({
        where: { nomeusuario: username },
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return Result.failure("Erro ao buscar usuário");
    }
    if (!foundUser) {
      return Result.success(null);
    }
    const user = new User(
      foundUser.nomeusuario,
      foundUser.nome,
      foundUser.email,
      foundUser.criado_em,
      foundUser.alterado_em,
      new Argon2idHasher(),
    );
    user.id = foundUser.idusuario;
    user.password = foundUser.senha;
    return Result.success(user);
  }
}
