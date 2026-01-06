-- SQL скрипт для удаления и пересоздания таблиц
-- ВНИМАНИЕ: Этот скрипт удалит ВСЕ данные из базы данных!
-- Используйте только для разработки или если вы уверены, что хотите удалить все данные

USE CargoDB;

-- Отключаем проверку внешних ключей
SET FOREIGN_KEY_CHECKS = 0;

-- Удаляем таблицы в правильном порядке (сначала зависимые, потом основные)
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS catalog;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS promocodes;
DROP TABLE IF EXISTS batch_cargos;
DROP TABLE IF EXISTS batch_cargo_orders;
DROP TABLE IF EXISTS users;

-- Включаем проверку внешних ключей обратно
SET FOREIGN_KEY_CHECKS = 1;

-- После выполнения этого скрипта, перезапустите Spring Boot приложение
-- Hibernate автоматически создаст все таблицы с правильными связями
-- при условии, что в application.yml установлено:
-- spring.jpa.hibernate.ddl-auto=update
-- или
-- spring.jpa.hibernate.ddl-auto=create



