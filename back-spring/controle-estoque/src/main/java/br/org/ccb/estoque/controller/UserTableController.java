package br.org.ccb.estoque.controller;

import br.org.ccb.estoque.dto.ProductInTableDTO;
import br.org.ccb.estoque.dto.HistoricoDTO;
import br.org.ccb.estoque.entity.User;
import br.org.ccb.estoque.entity.UserTable;
import br.org.ccb.estoque.repository.UserRepository;
import br.org.ccb.estoque.service.UserTableService;
import br.org.ccb.estoque.service.HistoricoService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-tables")
public class UserTableController {

    @Autowired
    private UserTableService userTableService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HistoricoService historicoService;

    @PostMapping("/create")
    public ResponseEntity<?> createUserTable(
            @RequestBody CreateUserTableRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");
        }
        User user = userOpt.get();
        String roleName = user.getRole() != null ? user.getRole().getName() : "";
        if (!roleName.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Apenas admins podem criar tabelas");
        }
        Long sectorId = user.getSectorId();
        userTableService.inserirUserTable(
                user.getId(),
                sectorId,
                request.getTableName(),
                request.getDescription(),
                request.getColumnsJson()
        );
        return ResponseEntity.ok("Tabela criada com sucesso");
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserTable(@PathVariable Long id) {
        boolean deleted = userTableService.deleteTableById(id);
        if (deleted) {
            return ResponseEntity.ok("Tabela excluída com sucesso!");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Tabela não encontrada");
        }
    }
    @PostMapping("/{tabelaId}/produtos/novo")
    public ResponseEntity<?> adicionarProdutoNovo(
            @PathVariable Long tabelaId,
            @RequestBody ProductInTableDTO produto) {
        try {
            userTableService.adicionarProdutoNovo(tabelaId, produto);
            return ResponseEntity.ok("Produto adicionado com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro: " + e.getMessage());
        }
    }
    @PutMapping("/{tabelaId}/produtos/{produtoId}/quantidade")
    public ResponseEntity<?> atualizarQuantidade(
            @PathVariable Long tabelaId,
            @PathVariable Long produtoId,
            @RequestBody AtualizarQuantidadeRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");
            }
            User user = userOpt.get();
            userTableService.atualizarQuantidadeProduto(
                    tabelaId,
                    produtoId,
                    request.getDelta(),
                    request.getAcao()
            );
            HistoricoDTO historicoDTO = new HistoricoDTO();
            historicoDTO.setUserId(user.getId());
            historicoDTO.setTabelaId(tabelaId);
            historicoDTO.setProdutoId(produtoId);
            historicoDTO.setDelta(request.getDelta());
            historicoDTO.setAcao(request.getAcao());
            historicoDTO.setFornecedor(request.getFornecedor());
            historicoDTO.setValorProduto(request.getValorProduto());
            historicoDTO.setSectorId(user.getSectorId());
            historicoService.salvarHistorico(historicoDTO);

            return ResponseEntity.ok("Quantidade atualizada com sucesso e histórico registrado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro: " + e.getMessage());
        }
    }
    @GetMapping("/by-sector")
    public ResponseEntity<List<UserTable>> listarPorSetor(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long sectorId = userOpt.get().getSectorId();
        List<UserTable> tabelas = userTableService.buscarPorSetor(sectorId);
        return ResponseEntity.ok(tabelas);
    }
    @Getter @Setter
    public static class CreateUserTableRequest {
        private String tableName;
        private String description;
        private String columnsJson;
    }
    @Getter @Setter
    public static class AtualizarQuantidadeRequest {
        private int delta;
        private String acao;
        private String fornecedor;
        private Double valorProduto;
    }
    @Getter @Setter
    public static class ProdutoQuantidadeDTO {
        private Long produtoId;
        private Integer delta;
        private String acao;
        private String fornecedor;
        private Double valorProduto;
    }
}
