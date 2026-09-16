package com.inventory.service;

import com.inventory.model.Product;
import com.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts(String search, String category, String ordering) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdDate");

        if (ordering != null && !ordering.trim().isEmpty()) {
            boolean isDesc = ordering.startsWith("-");
            String fieldName = isDesc ? ordering.substring(1) : ordering;
            
            // Map snake_case to camelCase field names if needed
            if ("product_name".equals(fieldName)) fieldName = "productName";
            else if ("created_date".equals(fieldName)) fieldName = "createdDate";
            else if ("updated_date".equals(fieldName)) fieldName = "updatedDate";

            sort = isDesc ? Sort.by(Sort.Direction.DESC, fieldName) : Sort.by(Sort.Direction.ASC, fieldName);
        }

        if ((search != null && !search.trim().isEmpty()) || (category != null && !category.trim().isEmpty())) {
            return productRepository.searchAndFilter(
                (search != null && !search.trim().isEmpty()) ? search.trim() : null,
                category,
                sort
            );
        }

        return productRepository.findAll(sort);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product details) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        if (details.getProductName() != null) existing.setProductName(details.getProductName().trim());
        if (details.getCategory() != null) existing.setCategory(details.getCategory());
        if (details.getQuantity() != null) existing.setQuantity(details.getQuantity());
        if (details.getPrice() != null) existing.setPrice(details.getPrice());
        if (details.getSupplier() != null) existing.setSupplier(details.getSupplier().trim());

        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}

