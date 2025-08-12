package br.org.ccb.estoque.entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sector")
public class Sector {
    @Id
    private Long id;
    private String name;
}