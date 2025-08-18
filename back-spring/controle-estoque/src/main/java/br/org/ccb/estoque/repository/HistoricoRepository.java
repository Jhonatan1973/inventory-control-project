package br.org.ccb.estoque.repository;

import br.org.ccb.estoque.entity.Historico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoRepository extends JpaRepository<Historico, Long> {
    List<Historico> findByUserId(Long userId);
    List<Historico> findByTabelaId(Long tabelaId);
    List<Historico> findBySectorId(Long sectorId);
}
