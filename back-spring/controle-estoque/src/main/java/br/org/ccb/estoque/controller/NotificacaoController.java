package br.org.ccb.estoque.controller;

import br.org.ccb.estoque.entity.Notificacao;
import br.org.ccb.estoque.entity.Sector;
import br.org.ccb.estoque.service.NotificacaoService;
import br.org.ccb.estoque.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;
    private final UserService userService;

    public NotificacaoController(NotificacaoService notificacaoService, UserService userService) {
        this.notificacaoService = notificacaoService;
        this.userService = userService;
    }

    @GetMapping("/sector/{sectorId}")
    public List<Notificacao> getNotificationsBySectorId(@PathVariable Long sectorId) {
        Sector sector = new Sector();
        sector.setId(sectorId);
        return notificacaoService.getBySector(sector);
    }

    @GetMapping("/user/{userId}")
    public List<Notificacao> getUserNotifications(@PathVariable Long userId) {
        Sector sector = userService.getSectorByUserId(userId);
        return notificacaoService.getBySector(sector);
    }

    public record NotificacaoRequest(Long sectorId, String titulo, String mensagem) {
    }

    @PostMapping
    public Notificacao create(@RequestBody NotificacaoRequest req) {
        Sector sector = new Sector();
        sector.setId(req.sectorId());

        Notificacao n = new Notificacao();
        n.setSector(sector);
        n.setTitulo(req.titulo());
        n.setMensagem(req.mensagem());

        return notificacaoService.createNotification(n);
    }

    @PutMapping("/read/{id}")
    public Notificacao markAsRead(@PathVariable Long id) {
        return notificacaoService.markAsRead(id);
    }

    @DeleteMapping("/sector/{sectorId}")
    public ResponseEntity<String> deleteAllBySector(@PathVariable Long sectorId) {
        try {
            Sector sector = new Sector();
            sector.setId(sectorId);
            notificacaoService.deleteAllBySector(sector);
            return ResponseEntity.ok("Todas as notificações do setor foram apagadas com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao apagar notificações: " + e.getMessage());
        }
    }
}
