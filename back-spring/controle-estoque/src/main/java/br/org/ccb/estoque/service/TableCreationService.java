package br.org.ccb.estoque.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TableCreationService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Cria uma tabela no banco com base no nome e nas colunas fornecidas
     * @param tableName nome da tabela a ser criada
     * @param columns lista de nomes de colunas (strings)
     */
    public void criarTabelaDinamica(String tableName, List<String> columns) {
        // Monta a string SQL para criação da tabela
        StringBuilder sql = new StringBuilder();
        sql.append("CREATE TABLE IF NOT EXISTS ").append(tableName).append(" (");
        sql.append("id BIGSERIAL PRIMARY KEY, "); // id padrão

        for (int i = 0; i < columns.size(); i++) {
            String col = columns.get(i);
            sql.append(col).append(" VARCHAR(255)");
            if (i < columns.size() - 1) {
                sql.append(", ");
            }
        }
        sql.append(");");

        // Executa o comando SQL
        jdbcTemplate.execute(sql.toString());
    }
}
