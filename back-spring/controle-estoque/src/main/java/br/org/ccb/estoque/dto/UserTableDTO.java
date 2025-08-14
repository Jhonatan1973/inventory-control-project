package br.org.ccb.estoque.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserTableDTO {
    private Long id;
    private String tableName;
    private String description;
    private LocalDateTime createdAt;
    private int quantityItems;

}
