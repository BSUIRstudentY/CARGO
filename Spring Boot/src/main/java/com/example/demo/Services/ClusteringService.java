package com.example.demo.Services;


import com.example.demo.Entity.Product;
import com.example.demo.Repository.ProductRepository;
import smile.clustering.KMeans;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClusteringService {

    @Autowired
    private ProductRepository repository;

    public void performKMeans(int k) {
        List<Product> products = repository.findAll();
        if (products.isEmpty()) {
            throw new IllegalStateException("Нет данных для кластеризации");
        }

        // Подготовка данных: извлечение признаков (цена, продажи)
        double[][] data = products.stream()
                .map(p -> new double[]{p.getPrice() != null ? p.getPrice() : 0.0, p.getSalesCount() != null ? p.getSalesCount() : 0.0})
                .toArray(double[][]::new);

        // Проверка на корректность данных
        if (data.length < k) {
            throw new IllegalArgumentException("Количество товаров меньше числа кластеров");
        }

        // Кластеризация с kMeans (автоматическая инициализация центроидов)
        KMeans kmeans = KMeans.fit(data, k); // Если доступен статический метод fit
        int[] clusterLabels = kmeans.y;
        for (int i = 0; i < clusterLabels.length; i++) {
            System.out.print(clusterLabels[i] + " ");
        }

        // Присвоение кластеров товарам
        for (int i = 0; i < products.size(); i++) {
            products.get(i).setCluster(clusterLabels[i]); // Предполагается поле cluster в Product
        }
        repository.saveAll(products);
    }
}