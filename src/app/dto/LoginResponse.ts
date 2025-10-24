import { GruppoDto } from "./GruppoDto";
import { PermessoDto } from "./PermessoDto";
import { RuoloDto } from "./RuoloDto";

export interface LoginResponse {
  token: string;
  email: string;
  nome: string;
  cognome: string;
  ruoli: RuoloDto[];
  permessi: PermessoDto[];
  gruppi: GruppoDto[];
}