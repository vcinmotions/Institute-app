// src/errors/EmailAlreadyExistsError.ts

export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`A tenant with email "${email}" already exists.`);
    this.name = "EmailAlreadyExistsError";
  }
}
