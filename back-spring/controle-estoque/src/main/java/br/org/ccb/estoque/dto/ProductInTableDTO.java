package br.org.ccb.estoque.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
public class ProductInTableDTO {
    private Long id;
    private String name;
    @JsonDeserialize(as = LinkedHashMap.class)
    private Map<String, Object> fields;
}
