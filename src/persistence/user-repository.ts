import { User, UserWithId } from "../domain/user/user.js";
import { Argon2idHasher } from "../tools/argon2idHasher.js";
import { prisma } from "../tools/prisma.js";
import { Result, resultFailure, resultSuccess } from "../tools/result.js";
import { IUserRepository } from "./interfaces/user-repository.js";

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<Result<UserWithId>> {
    if (!user.password) {
      return resultFailure("Senha não definida para o usuário");
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
      return resultFailure("Erro ao criar usuário");
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
    return resultSuccess(userReturn as UserWithId);
  }

  async update(user: User): Promise<Result<void>> {
    if (!user.id) {
      return resultFailure("ID do usuário não definido");
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
      return resultFailure("Erro ao atualizar usuário");
    }
    return resultSuccess();
  }

  async findById(userId: number): Promise<Result<UserWithId | null>> {
    let foundUser:
      | Awaited<ReturnType<typeof prisma.usuario.findUnique>>
      | undefined;
    try {
      foundUser = await prisma.usuario.findUnique({
        where: { idusuario: userId },
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return resultFailure("Erro ao buscar usuário");
    }
    if (!foundUser) {
      return resultSuccess(null);
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
    user.verifiedEmail = foundUser.email_verificado;
    return resultSuccess(user as UserWithId);
  }

  async findByUsername(username: string): Promise<Result<UserWithId | null>> {
    let foundUser:
      | Awaited<ReturnType<typeof prisma.usuario.findUnique>>
      | undefined;
    try {
      foundUser = await prisma.usuario.findUnique({
        where: { nomeusuario: username },
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return resultFailure("Erro ao buscar usuário");
    }
    if (!foundUser) {
      return resultSuccess(null);
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
    return resultSuccess(user as UserWithId);
  }

  async confirmEmail(userId: number, tokenId: string): Promise<Result<void>> {
    try {
      await prisma.$transaction([
        prisma.usuario.update({
          where: { idusuario: userId },
          data: { email_verificado: true },
        }),
        prisma.confirmacaoEmail.update({
          where: { id_token: tokenId },
          data: { revogado: true },
        }),
      ]);
      return resultSuccess();
    } catch (error) {
      let errorMessage = "Erro ao confirmar email: ";
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += String(error);
      }
      return resultFailure(errorMessage);
    }
  }
}
