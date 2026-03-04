package com.kiranakart.service;

import com.kiranakart.model.Product;
import com.kiranakart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<String> getAllCategories() {
        return productRepository.findAllCategories();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id).map(product -> {
            product.setName(updatedProduct.getName());
            product.setCategory(updatedProduct.getCategory());
            product.setPrice(updatedProduct.getPrice());
            product.setStock(updatedProduct.getStock());
            product.setUnit(updatedProduct.getUnit());
            product.setDescription(updatedProduct.getDescription());
            product.setImageUrl(updatedProduct.getImageUrl());
            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    public Product updatePrice(Long id, BigDecimal newPrice) {
        return productRepository.findById(id).map(product -> {
            product.setPrice(newPrice);
            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    public Product updateStock(Long id, Integer newStock) {
        return productRepository.findById(id).map(product -> {
            product.setStock(newStock);
            return productRepository.save(product);
        }).orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public void initializeSampleData() {
        if (productRepository.count() == 0) {
            String[][] products = {
                {"Rice (Basmati)", "Grains & Staples", "85.00", "100", "kg", "Premium long-grain basmati rice"},
                {"Wheat Flour (Atta)", "Grains & Staples", "45.00", "80", "kg", "Whole wheat flour for chapati"},
                {"Sugar", "Grains & Staples", "42.00", "60", "kg", "Pure refined white sugar"},
                {"Salt", "Grains & Staples", "20.00", "50", "kg", "Iodized table salt"},
                {"Toor Dal", "Pulses & Lentils", "120.00", "40", "kg", "Split pigeon peas"},
                {"Moong Dal", "Pulses & Lentils", "110.00", "35", "kg", "Split green gram"},
                {"Chana Dal", "Pulses & Lentils", "85.00", "30", "kg", "Split bengal gram"},
                {"Sunflower Oil", "Oils & Ghee", "165.00", "50", "litre", "Refined sunflower cooking oil"},
                {"Coconut Oil", "Oils & Ghee", "200.00", "30", "litre", "Pure virgin coconut oil"},
                {"Desi Ghee", "Oils & Ghee", "550.00", "20", "kg", "Pure cow ghee"},
                {"Tomatoes", "Vegetables", "40.00", "50", "kg", "Fresh red tomatoes"},
                {"Onions", "Vegetables", "35.00", "70", "kg", "Fresh onions"},
                {"Potatoes", "Vegetables", "30.00", "80", "kg", "Fresh potatoes"},
                {"Garlic", "Vegetables", "60.00", "20", "kg", "Fresh garlic bulbs"},
                {"Ginger", "Vegetables", "80.00", "15", "kg", "Fresh ginger root"},
                {"Full Cream Milk", "Dairy & Eggs", "60.00", "100", "litre", "Fresh pasteurized milk"},
                {"Curd (Dahi)", "Dairy & Eggs", "50.00", "40", "kg", "Fresh set curd"},
                {"Eggs", "Dairy & Eggs", "6.00", "200", "piece", "Farm fresh eggs"},
                {"Paneer", "Dairy & Eggs", "300.00", "20", "kg", "Fresh cottage cheese"},
                {"Turmeric Powder", "Spices", "12.00", "30", "100g", "Pure turmeric powder"},
                {"Red Chilli Powder", "Spices", "15.00", "25", "100g", "Hot red chilli powder"},
                {"Coriander Powder", "Spices", "10.00", "28", "100g", "Aromatic coriander powder"},
                {"Garam Masala", "Spices", "25.00", "20", "100g", "Blended spice mix"},
                {"Bananas", "Fruits", "35.00", "60", "dozen", "Fresh ripe bananas"},
                {"Apples", "Fruits", "150.00", "30", "kg", "Crisp red apples"},
                {"Lemon", "Fruits", "5.00", "100", "piece", "Fresh green lemon"},
                {"Tea (CTC)", "Beverages", "120.00", "40", "250g", "Strong CTC tea leaves"},
                {"Coffee Powder", "Beverages", "180.00", "20", "200g", "Aromatic coffee powder"},
                {"Biscuits (Parle-G)", "Snacks", "10.00", "100", "packet", "Classic glucose biscuits"},
                {"Bread", "Bakery", "35.00", "50", "loaf", "Soft sandwich bread"}
            };

            for (String[] p : products) {
                Product product = new Product();
                product.setName(p[0]);
                product.setCategory(p[1]);
                product.setPrice(new BigDecimal(p[2]));
                product.setStock(Integer.parseInt(p[3]));
                product.setUnit(p[4]);
                product.setDescription(p[5]);
                productRepository.save(product);
            }
        }
    }
}
