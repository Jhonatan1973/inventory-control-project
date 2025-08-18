export interface ProdutoInTable {
  id: number;
  name: string;
  fields: { [campoNome: string]: any };
  qtdAlterar?: number;  
}