import { CommentoDto } from "./CommentoDto";
import { LikeDto } from "./LikeDto";

export interface PostDto {
  id: number;
  idUtente: number;
  nomeUtente: string;
  dataOra: string; // LocalDateTime viene mappato come string in ISO format
  contenuto: string;
  commenti: CommentoDto[];
  like: LikeDto[];
}