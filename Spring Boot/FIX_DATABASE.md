# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=CargoDB
DB_USERNAME=fluvion_user
DB_PASSWORD=1206_1105timaZ

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration (минимум 32 символа для безопасности)
JWT_SECRET=fluvion-secure-jwt-secret-key-for-production-minimum-32-chars-long
JWT_EXPIRATION=86400000

# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=fluvionbiz@gmail.com
MAIL_PASSWORD=luww omad mrqz qlyx

# bePaid Payment Gateway
BEPAID_SHOP_ID=33276
BEPAID_SECRET_KEY=7129e87495f7bb387ed05351dcccaa8631e883d8b2e936e07f3b10e2f04e659b
BEPAID_CHECKOUT_URL=https://checkout.bepaid.by/ctp/api/checkouts
BEPAID_RETURN_URL=https://fluvion.by/thanks
BEPAID_FAIL_URL=https://fluvion.by/badResponse
BEPAID_CALLBACK_URL=https://fluvion.by/api/payment/webhook
BEPAID_TEST_MODE=false

# Eupost API
EUPOST_API_URL=https://api.eurotorg.by:10352/Json
EUPOST_SERVICE_NUMBER=134C9258-5EC7-4C29-B1E4-5A385385AE8F
EUPOST_LOGIN=693299414_Kovalevsky
EUPOST_PASSWORD=JLOHVQET4U12O1F

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://fluvion.by

# Server Configuration
SERVER_PORT=8080

# Hibernate Configuration (use 'update' for development, 'validate' or 'none' for production)
HIBERNATE_DDL_AUTO=update

# Logging Configuration
SHOW_SQL=false

