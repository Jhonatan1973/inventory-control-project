package br.org.ccb.estoque.repository;

import br.org.ccb.estoque.entity.Notificacao;
import br.org.ccb.estoque.entity.Sector;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findBySector(Sector sector);

    void deleteBySector(Sector sector);
}
