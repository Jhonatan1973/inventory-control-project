package br.org.ccb.estoque.service;

import br.org.ccb.estoque.entity.User;
import br.org.ccb.estoque.entity.UserTable;
import br.org.ccb.estoque.repository.UserTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Service
public class UserTableService {

    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Autowired
    private UserTableRepository userTableRepository;

    public void inserirUserTable(Long userId, Long sectorId, String tableName, String description, String columnsJson) {
        String sql = "INSERT INTO user_tables (user_id, sector_id, name_table, description_table, columns_structure) " +
                "VALUES (:userId, :sectorId, :tableName, :description, CAST(:columnsJson AS JSONB))";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("userId", userId)
                .addValue("sectorId", sectorId)
                .addValue("tableName", tableName)
                .addValue("description", description)
                .addValue("columnsJson", columnsJson);

        namedParameterJdbcTemplate.update(sql, params);
    }

    public List<UserTable> buscarPorSetor(Long sectorId) {
        return userTableRepository.findBySectorId(sectorId);
    }
}
