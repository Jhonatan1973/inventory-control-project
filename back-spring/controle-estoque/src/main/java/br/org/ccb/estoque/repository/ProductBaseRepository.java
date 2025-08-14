package br.org.ccb.estoque.repository;

import br.org.ccb.estoque.entity.ProductBase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductBaseRepository extends JpaRepository<ProductBase, Long> {
}
