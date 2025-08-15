package br.org.ccb.estoque.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import br.org.ccb.estoque.dto.ProductInTableDTO;
import br.org.ccb.estoque.entity.UserTable;
import br.org.ccb.estoque.repository.UserTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Service
public class UserTableService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Autowired
    private UserTableRepository userTableRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public void adicionarProdutosNaTabela(Long tabelaId, List<ProductInTableDTO> produtos) throws Exception {
        UserTable tabela = userTableRepository.findById(tabelaId)
                .orElseThrow(() -> new RuntimeException("Tabela não encontrada"));

        Map<String, Object> jsonMap = new HashMap<>();

        if (tabela.getColumnsStructure() != null && !tabela.getColumnsStructure().isEmpty()) {
            try {
                jsonMap = objectMapper.readValue(tabela.getColumnsStructure().traverse(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                List<String> colunas = objectMapper.readValue(tabela.getColumnsStructure().traverse(), new TypeReference<List<String>>() {});
                jsonMap.put("colunas", colunas);
            }
        }

        Object itensObj = jsonMap.get("itens");
        List<Map<String, Object>> itens;
        if (itensObj instanceof List) {
            itens = (List<Map<String, Object>>) itensObj;
        } else {
            itens = new ArrayList<>();
        }
        for (ProductInTableDTO produto : produtos) {
            boolean existe = itens.stream()
                    .anyMatch(item -> produto.getId().equals(item.get("id")));
            if (!existe) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", produto.getId());
                itemMap.put("nome", produto.getName());
                itemMap.put("campos", produto.getFields());
                itens.add(itemMap);
            }
        }

        jsonMap.put("itens", itens);
        String jsonAtualizado = objectMapper.writeValueAsString(jsonMap);
        tabela.setColumnsStructure(objectMapper.valueToTree(jsonMap));
        userTableRepository.save(tabela);
    }
    public boolean deleteTableById(Long id) {
        if (userTableRepository.existsById(id)) {
            userTableRepository.deleteById(id);
            return true;
        }
        return false;
    }
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
