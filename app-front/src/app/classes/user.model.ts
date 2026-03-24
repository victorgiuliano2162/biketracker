export class User {
    id: string;
  name: string;
  email: string;
  password: string;
  age: number;
  weight: number;
  createdAt: Date;
  bornAt: Date;
 
  constructor(partial: Partial<User> = {}) {
    this.id       = partial.id        ?? '';
    this.name      = partial.name      ?? '';
    this.email     = partial.email     ?? '';
    this.password  = partial.password  ?? '';
    this.age       = partial.age       ?? 0;
    this.weight    = partial.weight    ?? 0;
    this.createdAt = partial.createdAt ?? new Date();
    this.bornAt    = partial.bornAt    ?? new Date();
  }
}