package com.kiranakart.controller;

import com.kiranakart.model.Product;
import com.kiranakart.service.ClaudeAIService;
import com.kiranakart.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired private ProductService productService;
    @Autowired private ClaudeAIService claudeAIService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productService.getProductById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public List<Product> getByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String q) {
        return productService.searchProducts(q);
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return productService.getAllCategories();
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            return ResponseEntity.ok(productService.updateProduct(id, product));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/price")
    public ResponseEntity<Product> updatePrice(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        try {
            BigDecimal price = BigDecimal.valueOf(body.get("price"));
            return ResponseEntity.ok(productService.updatePrice(id, price));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        try {
            return ResponseEntity.ok(productService.updateStock(id, body.get("stock")));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/ai-price-suggestion")
    public ResponseEntity<Map<String, String>> getAIPriceSuggestion(@PathVariable Long id) {
        return productService.getProductById(id).map(product -> {
            String suggestion = claudeAIService.getPricingSuggestion(
                product.getName(), product.getCategory(),
                product.getPrice().doubleValue(), product.getStock()
            );
            return ResponseEntity.ok(Map.of("suggestion", suggestion));
        }).orElse(ResponseEntity.notFound().build());
    }
}
