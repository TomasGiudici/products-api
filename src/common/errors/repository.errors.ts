export class RepositoryUniqueConstraintError extends Error {
  constructor() {
    super('A unique constraint was violated.');
    this.name = RepositoryUniqueConstraintError.name;
  }
}
