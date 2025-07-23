package com.example.demo.Services;




import com.example.demo.Entity.Product;
import com.example.demo.Repository.ProductRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Data
public class ProductService {

    @Autowired
    private ProductRepository productRepository;


    public Product findProductById(Long id)
    {
        Product product = productRepository.findById(id).orElse(null);
        return product;
    }

    public void saveProduct(Product product)
    {
        productRepository.save(product);

    }


}
