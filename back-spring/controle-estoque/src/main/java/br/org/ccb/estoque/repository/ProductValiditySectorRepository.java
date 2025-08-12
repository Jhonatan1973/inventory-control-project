package br.org.ccb.estoque.repository;

import br.org.ccb.estoque.entity.ProductValiditySector;
import br.org.ccb.estoque.entity.ProductBase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductValiditySectorRepository extends JpaRepository<ProductValiditySector, Long> {
    List<ProductValiditySector> findByProductAndSectorId(ProductBase product, Long sectorId);

}
