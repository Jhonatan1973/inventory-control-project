package br.org.ccb.estoque.controller;

import br.org.ccb.estoque.dto.ProductInTableDTO;
import br.org.ccb.estoque.entity.User;
import br.org.ccb.estoque.entity.UserTable;
import br.org.ccb.estoque.repository.UserRepository;
import br.org.ccb.estoque.service.UserTableService;
import org.springframework.web.bind.annotation.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-tables")
public class UserTableController {

    @Autowired
    private UserTableService userTableService;

    @Autowired
    private UserRepository userRepository;

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
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Tabela não encontrada");
        }
    }
    @PostMapping("/{tabelaId}/produtos")
    public ResponseEntity<?> adicionarProdutos(
            @PathVariable Long tabelaId,
            @RequestBody List<ProductInTableDTO> produtos) {
        try {
            userTableService.adicionarProdutosNaTabela(tabelaId, produtos);
            return ResponseEntity.ok("Produtos adicionados com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao adicionar produtos: " + e.getMessage());
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
        tabelas.forEach(t -> System.out.println("columnsStructure: " + t.getColumnsStructure()));
        return ResponseEntity.ok(tabelas);

    }
    @Getter
    @Setter
    public static class CreateUserTableRequest {
        private String tableName;
        private String description;
        private String columnsJson;
    }
}
