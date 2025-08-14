package br.org.ccb.estoque.controller;

import br.org.ccb.estoque.entity.ProductBase;
import br.org.ccb.estoque.repository.ProductBaseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products-base")
public class ProductBaseController {

    private final ProductBaseRepository productBaseRepository;

    public ProductBaseController(ProductBaseRepository productBaseRepository) {
        this.productBaseRepository = productBaseRepository;
    }

    @GetMapping
    public List<ProductBase> listarTodos() {
        return productBaseRepository.findAll();
    }

}
