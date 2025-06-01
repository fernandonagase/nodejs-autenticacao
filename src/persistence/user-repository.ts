import { User } from "../domain/user/user.js";
import { Argon2idHasher } from "../tools/argon2idHasher.js";
import { prisma } from "../tools/prisma.js";
import { Result } from "../tools/result.js";
import { IUserRepository } from "./interfaces/user-repository.js";

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<Result<User>> {
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
    return Result.success(userReturn);
  }
}
