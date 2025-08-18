package br.org.ccb.estoque.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HistoricoDTO {
    private Long userId;
    private Long tabelaId;
    private Long produtoId;
    private Integer delta;
    private String acao; // "adicionar" ou "diminuir"
    private String fornecedor;
    private Double valorProduto;
    private Long sectorId;
}
