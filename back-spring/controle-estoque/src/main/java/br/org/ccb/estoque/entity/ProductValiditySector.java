package br.org.ccb.estoque.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "product_validity_sector")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductValiditySector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private ProductBase product;

    @Column(name = "sector_id", nullable = false)
    private Long sectorId;

    @Column(name = "validity_date", nullable = false)
    private LocalDate validityDate;

    @Column(nullable = false)
    private Integer quantity;
}
