package br.org.ccb.estoque.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_tables")
public class UserTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "sector_id")
    private Long sectorId;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "name_table")
    private String tableName;

    @Column(name = "description_table")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "columns_structure")
    private JsonNode columnsStructure;

    @Column(name = "quantity_items")
    private Integer quantityItems;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
