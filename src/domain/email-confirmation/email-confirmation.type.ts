export interface EmailConfirmation {
  token: string;
  tokenId: string;
  userId: number;
  exp: number;
}
