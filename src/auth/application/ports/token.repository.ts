import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export interface TokenRepositoryPort {
  save(token: RefreshToken): Promise<RefreshToken>;
  findRefreshToken(userId: string): Promise<RefreshToken>;
}

export const TOKEN_REPOSITORY = Symbol('TOKEN_REPOSITORY');
