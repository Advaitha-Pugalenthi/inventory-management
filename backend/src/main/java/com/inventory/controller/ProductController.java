package com.inventory.controller;

import com.inventory.model.Product;
import com.inventory.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "ordering", required = false) String ordering) {
        List<Product> products = productService.getAllProducts(search, category, ordering);
        return ResponseEntity.ok(products);
    }

    @GetMapping({"/{id}", "/{id}/"})
    public ResponseEntity<?> getProductById(@PathVariable("id") Long id) {
        Optional<Product> productOpt = productService.getProductById(id);
        if (productOpt.isPresent()) {
            return ResponseEntity.ok(productOpt.get());
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Product not found.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @PostMapping({"", "/"})
    public ResponseEntity<?> createProduct(@Valid @RequestBody Product product, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("errors", extractValidationErrors(bindingResult));
            return ResponseEntity.badRequest().body(errorResponse);
        }

        Product saved = productService.saveProduct(product);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product created successfully.");
        response.put("data", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping({"/{id}", "/{id}/"})
    public ResponseEntity<?> updateProductFull(
            @PathVariable("id") Long id,
            @Valid @RequestBody Product product,
            BindingResult bindingResult) {
        return handleUpdate(id, product, bindingResult);
    }

    @PatchMapping({"/{id}", "/{id}/"})
    public ResponseEntity<?> updateProductPartial(
            @PathVariable("id") Long id,
            @RequestBody Product product,
            BindingResult bindingResult) {
        return handleUpdate(id, product, bindingResult);
    }

    private ResponseEntity<?> handleUpdate(Long id, Product product, BindingResult bindingResult) {
        Optional<Product> existingOpt = productService.getProductById(id);
        if (existingOpt.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Product not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        if (bindingResult.hasErrors()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("errors", extractValidationErrors(bindingResult));
            return ResponseEntity.badRequest().body(errorResponse);
        }

        Product updated = productService.updateProduct(id, product);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Product updated successfully.");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping({"/{id}", "/{id}/"})
    public ResponseEntity<?> deleteProduct(@PathVariable("id") Long id) {
        Optional<Product> productOpt = productService.getProductById(id);
        if (productOpt.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Product not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        String productName = productOpt.get().getProductName();
        productService.deleteProduct(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", String.format("Product \"%s\" deleted successfully.", productName));
        return ResponseEntity.ok(response);
    }

    private Map<String, String> extractValidationErrors(BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : bindingResult.getFieldErrors()) {
            String field = error.getField();
            if ("productName".equals(field)) field = "product_name";
            errors.put(field, error.getDefaultMessage());
        }
        return errors;
    }
}

