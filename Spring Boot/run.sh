#!/bin/bash

# Загружаем переменные окружения из .env файла
set -a
source .env
set +a

# Запускаем Spring Boot приложение
mvn spring-boot:run








