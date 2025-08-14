package br.org.ccb.estoque.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TableCreationService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void criarTabelaDinamica(String tableName, List<String> columns) {
        StringBuilder sql = new StringBuilder();
        sql.append("CREATE TABLE IF NOT EXISTS ").append(tableName).append(" (");
        sql.append("id BIGSERIAL PRIMARY KEY, ");
        for (int i = 0; i < columns.size(); i++) {
            String col = columns.get(i);
            sql.append(col).append(" VARCHAR(255)");
            if (i < columns.size() - 1) {
                sql.append(", ");
            }
        }
        sql.append(");");
        jdbcTemplate.execute(sql.toString());
    }
}
