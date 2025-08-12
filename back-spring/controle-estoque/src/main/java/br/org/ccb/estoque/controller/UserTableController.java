package br.org.ccb.estoque.controller;

import br.org.ccb.estoque.entity.User;
import br.org.ccb.estoque.entity.UserTable;
import br.org.ccb.estoque.repository.UserRepository;
import br.org.ccb.estoque.repository.UserTableRepository;
import br.org.ccb.estoque.service.UserTableService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
            @RequestBody CreateUserTableRequest request,  // <-- agora import do Spring
            Authentication authentication) {

        // Pegar o email do usuário autenticado (admin)
        String email = authentication.getName();

        // Buscar o usuário no banco
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");
        }
        User user = userOpt.get();

        // Só admin pode criar
        String roleName = user.getRole() != null ? user.getRole().getName() : "";
        if (!roleName.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Apenas admins podem criar tabelas");
        }

        // Usa o sector do usuário autenticado
        Long sectorId = user.getSectorId();

        // Chama o service para inserir
        userTableService.inserirUserTable(
                user.getId(),
                sectorId,
                request.getTableName(),
                request.getDescription(),
                request.getColumnsJson()
        );

        return ResponseEntity.ok("Tabela criada com sucesso");
    }


    @GetMapping("/by-sector")
    public ResponseEntity<List<UserTable>> listarPorSetor(Authentication authentication) {
        String email = authentication.getName();

        // Buscar usuário logado
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long sectorId = userOpt.get().getSectorId();

        List<UserTable> tabelas = userTableService.buscarPorSetor(sectorId);

        return ResponseEntity.ok(tabelas);
    }
    @Getter
    @Setter
    // DTO para receber dados do front
    public static class CreateUserTableRequest {
        private String tableName;
        private String description;
        private String columnsJson;

        // getters e setters
    }
}
