package br.org.ccb.estoque.service;

import br.org.ccb.estoque.entity.Notificacao;
import br.org.ccb.estoque.entity.Sector;
import br.org.ccb.estoque.repository.NotificacaoRepository;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;

    public NotificacaoService(NotificacaoRepository notificacaoRepository) {
        this.notificacaoRepository = notificacaoRepository;
    }

    public List<Notificacao> getBySector(Sector sector) {
        return notificacaoRepository.findBySector(sector);
    }

    public Notificacao createNotification(Notificacao n) {
        return notificacaoRepository.save(n);
    }

    public Notificacao markAsRead(Long id) {
        Notificacao n = notificacaoRepository.findById(id).orElseThrow();
        n.setLida(true);
        return notificacaoRepository.save(n);
    }

    @Transactional
    public void deleteAllBySector(Sector sector) {
        notificacaoRepository.deleteBySector(sector);
    }
}
