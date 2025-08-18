package br.org.ccb.estoque.service;

import br.org.ccb.estoque.dto.HistoricoDTO;
import br.org.ccb.estoque.entity.Historico;
import br.org.ccb.estoque.repository.HistoricoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HistoricoService {

    @Autowired
    private HistoricoRepository historicoRepository;
    public Historico salvarHistorico(HistoricoDTO dto) {
        Historico h = new Historico();
        h.setUserId(dto.getUserId());
        h.setTabelaId(dto.getTabelaId());
        h.setProdutoId(dto.getProdutoId());
        h.setDelta(dto.getDelta());
        h.setAcao(dto.getAcao());
        h.setFornecedor(dto.getFornecedor());
        h.setValorProduto(dto.getValorProduto());
        h.setSectorId(dto.getSectorId());
        return historicoRepository.save(h);
    }
    public List<Historico> buscarPorUsuario(Long userId) {
        return historicoRepository.findByUserId(userId);
    }
    public List<Historico> buscarPorTabela(Long tabelaId) {
        return historicoRepository.findByTabelaId(tabelaId);
    }
    public List<Historico> buscarPorSetor(Long sectorId) {
        return historicoRepository.findBySectorId(sectorId);
    }
}
