// src/app/interfaces/product-in-table.ts
export interface ProdutoInTable {
  id: number;
  name: string;
  fields: { [campoNome: string]: any };
}
