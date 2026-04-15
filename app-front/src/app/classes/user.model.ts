export type TipoSanguineoType = 
  | 'A_POSITIVO' | 'A_NEGATIVO' 
  | 'B_POSITIVO' | 'B_NEGATIVO' 
  | 'AB_POSITIVO' | 'AB_NEGATIVO' 
  | 'O_POSITIVO' | 'O_NEGATIVO';
export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  age: number;
  weight: number;
  createdAt: Date;
  bornAt: Date;
  tipoSanguineo: TipoSanguineoType | '';
 
  constructor(partial: Partial<User> = {}) {
    this.id       = partial.id        ?? '';
    this.name      = partial.name      ?? '';
    this.email     = partial.email     ?? '';
    this.password  = partial.password  ?? '';
    this.age       = partial.age       ?? 0;
    this.weight    = partial.weight    ?? 0;
    this.createdAt = partial.createdAt ?? new Date();
    this.bornAt    = partial.bornAt    ?? new Date();
    this.tipoSanguineo = partial.tipoSanguineo ?? '';
  }
}