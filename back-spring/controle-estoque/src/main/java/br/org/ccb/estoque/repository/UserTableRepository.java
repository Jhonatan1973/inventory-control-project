package br.org.ccb.estoque.repository;

import br.org.ccb.estoque.entity.UserTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserTableRepository extends JpaRepository<UserTable, Long> {
    List<UserTable> findBySectorId(Long sectorId);
}
