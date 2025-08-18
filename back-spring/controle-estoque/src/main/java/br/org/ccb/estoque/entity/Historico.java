package br.org.ccb.estoque.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "historico")
@Getter
@Setter
public class Historico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tabela_id", nullable = false)
    private Long tabelaId;

    @Column(name = "produto_id", nullable = false)
    private Long produtoId;

    @Column(nullable = false)
    private Integer delta;

    @Column(nullable = false)
    private String acao; // "adicionar" ou "diminuir"

    private String fornecedor;

    @Column(name = "valor_produto")
    private Double valorProduto;

    @Column(name = "sector_id", nullable = false)
    private Long sectorId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
