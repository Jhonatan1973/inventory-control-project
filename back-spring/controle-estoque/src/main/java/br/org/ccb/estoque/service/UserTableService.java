package br.org.ccb.estoque.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import br.org.ccb.estoque.dto.ProductInTableDTO;
import br.org.ccb.estoque.entity.UserTable;
import br.org.ccb.estoque.repository.UserTableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserTableService {

    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Autowired
    private UserTableRepository userTableRepository;

    @Autowired
    private ObjectMapper objectMapper;
    public void atualizarQuantidadeProduto(Long tabelaId, Long produtoId, int delta, String acao) throws Exception {
        UserTable tabela = userTableRepository.findById(tabelaId)
                .orElseThrow(() -> new RuntimeException("Tabela não encontrada"));
        Map<String, Object> jsonMap = new HashMap<>();
        if (tabela.getColumnsStructure() != null) {
            JsonNode node = tabela.getColumnsStructure();
            jsonMap = objectMapper.convertValue(node, Map.class);
        }
        List<Map<String, Object>> itens = (List<Map<String, Object>>) jsonMap.getOrDefault("itens", new ArrayList<>());
        Map<String, Object> itemExistente = itens.stream()
                .filter(item -> produtoId.equals(Long.valueOf(String.valueOf(item.get("id")))))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Produto não encontrado na tabela"));
        Object qtdObj = itemExistente.getOrDefault("quantidade", 0);
        int qtdAtual = qtdObj instanceof Number ? ((Number) qtdObj).intValue() : Integer.parseInt(qtdObj.toString());
        if ("adicionar".equalsIgnoreCase(acao)) {
            itemExistente.put("quantidade", qtdAtual + delta);
        } else if ("diminuir".equalsIgnoreCase(acao)) {
            itemExistente.put("quantidade", Math.max(qtdAtual - delta, 0));
        }
        jsonMap.put("itens", itens);
        tabela.setColumnsStructure(objectMapper.valueToTree(jsonMap));
        userTableRepository.save(tabela);
    }
    public void adicionarProdutoNovo(Long tabelaId, ProductInTableDTO produto) throws Exception {
        UserTable tabela = userTableRepository.findById(tabelaId)
                .orElseThrow(() -> new RuntimeException("Tabela não encontrada"));
        Map<String, Object> jsonMap = new HashMap<>();
        if (tabela.getColumnsStructure() != null) {
            JsonNode node = tabela.getColumnsStructure();
            jsonMap = objectMapper.convertValue(node, Map.class);
        }
        List<Map<String, Object>> itens = (List<Map<String, Object>>) jsonMap.getOrDefault("itens", new ArrayList<>());
        boolean produtoExistente = itens.stream()
                .anyMatch(item -> produto.getId().equals(Long.valueOf(String.valueOf(item.get("id")))));
        if (produtoExistente) {
            throw new RuntimeException("Produto já existe na tabela");
        }
        Map<String, Object> itemMap = new HashMap<>();
        itemMap.put("id", produto.getId());
        itemMap.put("nome", produto.getName());
        Object qtdObj = produto.getFields().getOrDefault("quantidade", 0);
        int qtd = qtdObj instanceof Number ? ((Number) qtdObj).intValue() : Integer.parseInt(qtdObj.toString());
        itemMap.put("quantidade", qtd);
        List<String> validadeArray = new ArrayList<>();
        Object novaVal = produto.getFields().get("validadeArray");
        if (novaVal instanceof List) {
            for (Object o : (List<?>) novaVal) validadeArray.add(String.valueOf(o));
        }
        itemMap.put("validadeArray", validadeArray);
        itens.add(itemMap);
        jsonMap.put("itens", itens);
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
        try {
            Map<String, Object> jsonMap = new HashMap<>();
            jsonMap.put("colunas", objectMapper.readValue(columnsJson, List.class));
            jsonMap.put("itens", new ArrayList<>());
            String sql = "INSERT INTO user_tables (user_id, sector_id, name_table, description_table, columns_structure) " +
                    "VALUES (:userId, :sectorId, :tableName, :description, CAST(:columnsJson AS JSONB))";
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("userId", userId)
                    .addValue("sectorId", sectorId)
                    .addValue("tableName", tableName)
                    .addValue("description", description)
                    .addValue("columnsJson", objectMapper.writeValueAsString(jsonMap));
            namedParameterJdbcTemplate.update(sql, params);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao criar tabela: " + e.getMessage());
        }
    }
    public List<UserTable> buscarPorSetor(Long sectorId) {
        return userTableRepository.findBySectorId(sectorId);
    }
}
