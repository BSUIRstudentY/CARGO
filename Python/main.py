import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    ConversationHandler,
    ContextTypes,
    filters,
)
import requests
import os

# Настройки
BOT_TOKEN = "8456312459:AAEMqPTOxxu8Wg8JUDkr2KYtgGNldJ5mZ74"
CHANNEL_ID = "@FLUVIONN"
BACKEND_URL = "http://localhost:8080/api/telegram"
SITE_URL = "https://fluvion.by"

# Состояния (только для верификации телефона)
ENTER_PHONE, ENTER_PHONE_CODE = range(2)

logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

def escape_markdown(text: str) -> str:
    chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']
    for char in chars:
        text = text.replace(char, f'\\{char}')
    return text

def main_menu() -> InlineKeyboardMarkup:
    keyboard = [
        [InlineKeyboardButton("🔄 Проверить подписку", callback_data="check_subscription")],
        [InlineKeyboardButton("📱 Верифицировать телефон", callback_data="verify_phone")],
        [InlineKeyboardButton("ℹ️ Помощь и информация", callback_data="help")],
        [InlineKeyboardButton("📊 Мой статус", callback_data="status")],
        [InlineKeyboardButton("✅ Вернуться на сайт", url=SITE_URL)]
    ]
    return InlineKeyboardMarkup(keyboard)

# Проверка подписки на канал
def _check_subscription(user_id: str) -> bool:
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getChatMember?chat_id={CHANNEL_ID}&user_id={user_id}"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if data.get("ok"):
            status = data["result"].get("status")
            return status in ["member", "administrator", "creator"]
        return False
    except Exception as e:
        logger.error(f"Ошибка проверки подписки: {e}")
        return False

# Универсальная обработка кнопки «Проверить подписку» (работает всегда)
async def check_subscription_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if query:
        await query.answer()

    user_id = str(update.effective_user.id)
    is_subscribed = _check_subscription(user_id)

    # Если отписался — уведомляем бэкенд
    if not is_subscribed:
        try:
            requests.post(f"{BACKEND_URL}/unsubscribe", json={"userId": user_id}, timeout=10)
        except Exception as e:
            logger.error(f"Ошибка отписки: {e}")

    if not is_subscribed:
        keyboard = [
            [InlineKeyboardButton("📢 Подписаться на канал", url="https://t.me/FLUVIONN")],
            [InlineKeyboardButton("🔄 Проверить снова", callback_data="check_subscription")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        message = (
            f"❌ Вы не подписаны на {escape_markdown(CHANNEL_ID)}\\.\n"
            "Подпишитесь на канал и нажмите «Проверить снова»\\."
        )
    else:
        message = (
            f"✅ Вы подписаны на {escape_markdown(CHANNEL_ID)}\\!\n\n"
            "*Теперь просто введите реферальный код с сайта в этот чат\\.*\n"
            "Бот автоматически привяжет аккаунт и начислит скидку\\."
        )
        reply_markup = main_menu()

    if query:
        await query.message.edit_text(message, parse_mode="MarkdownV2", reply_markup=reply_markup)
    else:
        await update.message.reply_text(message, parse_mode="MarkdownV2", reply_markup=reply_markup)

# Глобальная обработка ввода реферального кода (в любом момент, если подписан)
async def enter_referral_code(update: Update, context: ContextTypes.DEFAULT_TYPE):
    code = update.message.text.strip()
    user_id = str(update.effective_user.id)

    # Проверяем подписку
    if not _check_subscription(user_id):
        await update.message.reply_text(
            "❌ Вы не подписаны на канал\\.\n"
            "Сначала подпишитесь и проверьте подписку кнопкой ниже\\.",
            parse_mode="MarkdownV2",
            reply_markup=main_menu()
        )
        return

    try:
        response = requests.post(BACKEND_URL, json={"referralCode": code, "userId": user_id}, timeout=10)
        if response.status_code == 200:
            message = (
                "🎉 Аккаунт успешно привязан\\!\n"
                "Скидка начислена\\. Теперь вы можете верифицировать телефон \\(если нужно\\)\\.\n\n"
                f"Вернитесь на сайт: {escape_markdown(SITE_URL)}"
            )
        else:
            # Пытаемся извлечь сообщение об ошибке из ответа
            error_text = response.text
            # Если ответ содержит JSON с сообщением, пытаемся его распарсить
            try:
                import json
                error_json = json.loads(error_text)
                error_message = error_json if isinstance(error_json, str) else error_json.get('message', error_text)
            except:
                error_message = error_text
            
            # Убираем технические детали и переводим на русский
            if "Invalid referral code" in error_message or "Invalid referral code" in error_text:
                error_message = "Неверный реферальный код или аккаунт уже привязан"
            elif "already linked" in error_message or "уже привязан" in error_message:
                error_message = "Аккаунт уже привязан"
            elif "not found" in error_message or "не найден" in error_message:
                error_message = "Пользователь с данным реферальным кодом не найден"
            elif "Server error" in error_message or "Ошибка сервера" in error_message:
                error_message = "Ошибка сервера: проверьте реферальный код и попробуйте снова"
            
            # Если ошибка слишком техническая, показываем общее сообщение
            if len(error_message) > 200 or "Transaction" in error_message or "rollback" in error_message:
                error_message = "Ошибка при обработке запроса\\. Проверьте реферальный код и попробуйте снова\\."
            
            message = f"❌ {escape_markdown(error_message)}\\.\nПроверьте реферальный код и попробуйте снова\\."
    except Exception as e:
        logger.error(f"Ошибка привязки аккаунта: {e}")
        error_msg = str(e)
        if "timeout" in error_msg.lower() or "connection" in error_msg.lower():
            message = "❌ Ошибка подключения к серверу\\. Попробуйте позже\\."
        else:
            message = "❌ Ошибка сервера\\. Попробуйте позже\\."

    await update.message.reply_text(message, parse_mode="MarkdownV2", reply_markup=main_menu())

# /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = (
        "👋 Добро пожаловать в бота FLUVION\\!\n\n"
        "Чтобы получить скидку и привязать аккаунт:\n"
        "1\\. Подпишитесь на канал \\(кнопка «Проверить подписку»\\)\n"
        "2\\. Введите реферальный код с сайта прямо в чат\n"
        "3\\. При необходимости — верифицируйте телефон\n\n"
        "Начните с кнопки ниже\\."
    )
    await update.message.reply_text(message, parse_mode="MarkdownV2", reply_markup=main_menu())

# Помощь
async def help_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if query:
        await query.answer()

    message = (
        "ℹ️ *Помощь по боту*\n\n"
        "1\\. Нажмите «Проверить подписку» → подпишитесь на канал\\.\n"
        "2\\. После проверки просто введите реферальный код с сайта в чат — бот привяжет аккаунт и начислит скидку\\.\n"
        "3\\. Кнопка «Верифицировать телефон» — для верификации номера \\(только после привязки аккаунта\\)\\.\n"
        "4\\. *Важно*: Отписка от канала отменяет скидку навсегда\\!\n\n"
        "Проблемы? Напишите в поддержку на сайте\\."
    )

    if query:
        await query.message.reply_text(message, parse_mode="MarkdownV2", reply_markup=main_menu())
    else:
        await update.message.reply_text(message, parse_mode="MarkdownV2", reply_markup=main_menu())

# Статус
async def status_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if query:
        await query.answer()

    user_id = str(update.effective_user.id if query else update.message.from_user.id)
    try:
        response = requests.post(f"{BACKEND_URL}/get-status", json={"userId": user_id}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            message = (
                f"📊 *Ваш статус*\n\n"
                f"Подписка на канал: {'✅' if data.get('subscribed', False) else '❌'}\n"
                f"Аккаунт привязан \\(скидка активна\\): {'✅' if data.get('discount_active', False) else '❌'}\n"
                f"Телефон верифицирован: {'✅' if data.get('phone_verified', False) else '❌'}\n\n"
                "Если что-то не так — проверьте подписку или введите реферальный код\\."
            )
        else:
            message = "❌ Не удалось получить статус\\. Попробуйте позже\\."
    except Exception as e:
        logger.error(f"Ошибка получения статуса: {e}")
        message = "❌ Ошибка сервера\\."

    if query:
        await query.message.reply_text(message, parse_mode="MarkdownV2", reply_markup=main_menu())
    else:
        await update.message.reply_text(message, parse_mode="MarkdownV2", reply_markup=main_menu())

# Верификация телефона (многошаговая, через conversation)
async def verify_phone(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.callback_query:
        await update.callback_query.answer()

    user_id = str(update.effective_user.id)

    # Проверяем, был ли аккаунт когда-то привязан (проверяем наличие telegramUserId в БД)
    try:
        response = requests.post(f"{BACKEND_URL}/check-telegram-linked", json={"userId": user_id}, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if not data.get('telegram_linked', False):
                await update.effective_message.reply_text(
                    "❌ Сначала проверьте подписку\\!\n"
                    "Подпишитесь на канал и введите реферальный код с сайта в чат\\.",
                    parse_mode="MarkdownV2",
                    reply_markup=main_menu()
                )
                return ConversationHandler.END
        else:
            await update.effective_message.reply_text(
                "❌ Ошибка проверки статуса\\. Попробуйте позже\\.",
                parse_mode="MarkdownV2",
                reply_markup=main_menu()
            )
            return ConversationHandler.END
    except Exception as e:
        logger.error(f"Ошибка проверки статуса: {e}")
        await update.effective_message.reply_text(
            "❌ Ошибка проверки статуса\\. Попробуйте позже\\.",
            parse_mode="MarkdownV2",
            reply_markup=main_menu()
        )
        return ConversationHandler.END

    keyboard = [
        [KeyboardButton("📱 Поделиться номером телефона", request_contact=True)],
        [KeyboardButton("❌ Отмена")]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True, one_time_keyboard=True)

    message = (
        "📱 Верификация телефона:\n\n"
        "1️⃣ Нажмите кнопку ниже\n"
        "2️⃣ Получите код\n"
        "3️⃣ Введите код\n\n"
        "⚠️ Один номер — один аккаунт\\!"
    )
    await update.effective_message.reply_text(message, parse_mode="MarkdownV2", reply_markup=reply_markup)
    return ENTER_PHONE

# Получение номера телефона
async def receive_phone_number(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.contact:
        phone = update.message.contact.phone_number
    elif update.message.text and update.message.text.strip() != "❌ Отмена":
        phone = update.message.text.strip()
    else:
        await update.message.reply_text("❌ Верификация отменена\\.", parse_mode="MarkdownV2", reply_markup=main_menu())
        return ConversationHandler.END

    context.user_data["phone"] = phone
    user_id = str(update.effective_user.id)

    try:
        response = requests.post(f"{BACKEND_URL}/request-phone-verification", json={"userId": user_id}, timeout=10)
        if response.status_code == 200:
            code = response.text.strip().strip('"')
            context.user_data["phone_code"] = code
            await update.message.reply_text(
                f"📱 Номер: `{escape_markdown(phone)}`\n"
                f"🔐 Код отправлен: `{escape_markdown(code)}`\n\n"
                "Введите код для подтверждения:",
                parse_mode="MarkdownV2",
                reply_markup=ReplyKeyboardMarkup([[]], resize_keyboard=True)
            )
            return ENTER_PHONE_CODE
        else:
            error_text = response.text
            # Переводим типичные ошибки на русский
            if "Account not linked" in error_text or "аккаунт ещё не привязан" in error_text:
                error_msg = "Аккаунт ещё не привязан\\. Сначала введите реферальный код\\."
            elif "userId required" in error_text or "Требуется userId" in error_text:
                error_msg = "Ошибка запроса\\. Попробуйте позже\\."
            else:
                error_msg = escape_markdown(error_text[:200]) if len(error_text) < 200 else "Ошибка сервера\\."
            
            await update.message.reply_text(
                f"❌ {error_msg}",
                parse_mode="MarkdownV2",
                reply_markup=main_menu()
            )
    except Exception as e:
        logger.error(f"Ошибка запроса кода телефона: {e}")
        error_msg = str(e)
        if "timeout" in error_msg.lower() or "connection" in error_msg.lower():
            await update.message.reply_text(
                "❌ Ошибка подключения к серверу\\. Попробуйте позже\\.",
                parse_mode="MarkdownV2",
                reply_markup=main_menu()
            )
        else:
            await update.message.reply_text(
                "❌ Ошибка сервера\\. Попробуйте позже\\.",
                parse_mode="MarkdownV2",
                reply_markup=main_menu()
            )

    return ConversationHandler.END

# Подтверждение кода телефона
async def confirm_phone_verification(update: Update, context: ContextTypes.DEFAULT_TYPE):
    code = update.message.text.strip()
    phone = context.user_data.get("phone")
    user_id = str(update.effective_user.id)

    if not phone:
        await update.message.reply_text("❌ Ошибка: номер не найден\\. Начните заново\\.", parse_mode="MarkdownV2")
        return ConversationHandler.END

    try:
        response = requests.post(
            f"{BACKEND_URL}/confirm-phone-verification",
            json={"userId": user_id, "phoneNumber": phone, "code": code},
            timeout=10
        )
        if response.status_code == 200:
            message = (
                "✅ Телефон успешно верифицирован\\!\n"
                f"📱 Номер: `{escape_markdown(phone)}`\n\n"
                f"Вернитесь на сайт: {escape_markdown(SITE_URL)}"
            )
        else:
            error_text = response.text
            # Переводим типичные ошибки на русский
            if "Invalid or expired code" in error_text or "Неверный или истёкший код" in error_text:
                error_msg = "Неверный или истёкший код\\."
            elif "Phone already used" in error_text or "уже используется" in error_text:
                error_msg = "Номер телефона уже используется другим аккаунтом\\."
            elif "Account not found" in error_text or "Аккаунт не найден" in error_text:
                error_msg = "Аккаунт не найден\\. Начните процесс заново\\."
            elif "All fields required" in error_text or "Все поля обязательны" in error_text:
                error_msg = "Все поля обязательны для заполнения\\."
            else:
                error_msg = escape_markdown(error_text[:150]) if len(error_text) < 150 else "Ошибка верификации\\."
            
            message = f"❌ {error_msg}\nПроверьте код и попробуйте снова\\."
            await update.message.reply_text(message, parse_mode="MarkdownV2")
            return ENTER_PHONE_CODE
    except Exception as e:
        logger.error(f"Ошибка подтверждения телефона: {e}")
        error_msg = str(e)
        if "timeout" in error_msg.lower() or "connection" in error_msg.lower():
            message = "❌ Ошибка подключения к серверу\\. Попробуйте позже\\."
        else:
            message = "❌ Ошибка сервера\\. Попробуйте позже\\."

    await update.message.reply_text(message, parse_mode="MarkdownV2", reply_markup=main_menu())
    context.user_data.clear()
    return ConversationHandler.END

# Отмена
async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("❌ Действие отменено\\.", parse_mode="MarkdownV2", reply_markup=main_menu())
    return ConversationHandler.END

# Fallback для неизвестных сообщений (теперь ниже обработчика кода)
async def unknown_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 Непонятная команда\\. Используйте кнопки меню или:\n"
        "/start — начать заново\n"
        "/help — помощь\n"
        "/status — статус",
        parse_mode="MarkdownV2",
        reply_markup=main_menu()
    )

def main():
    application = Application.builder().token(BOT_TOKEN).build()

    # Обработчик кнопки верификации телефона
    async def verify_phone_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.callback_query.answer()
        return await verify_phone(update, context)

    # Conversation только для верификации телефона (многошаговая)
    phone_conv_handler = ConversationHandler(
        entry_points=[CallbackQueryHandler(verify_phone_button, pattern="^verify_phone$"), CommandHandler("verify_phone", verify_phone)],
        states={
            ENTER_PHONE: [
                MessageHandler(filters.CONTACT | (filters.TEXT & ~filters.COMMAND), receive_phone_number)
            ],
            ENTER_PHONE_CODE: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, confirm_phone_verification)
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
        per_user=True,
        per_chat=True,
        allow_reentry=True
    )

    application.add_handler(phone_conv_handler)

    # Глобальный ввод реферального кода (любое текстовое сообщение)
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, enter_referral_code))

    # Кнопки (всегда)
    application.add_handler(CallbackQueryHandler(check_subscription_handler, pattern="^check_subscription$"))
    application.add_handler(CallbackQueryHandler(verify_phone_button, pattern="^verify_phone$"))
    application.add_handler(CallbackQueryHandler(help_handler, pattern="^help$"))
    application.add_handler(CallbackQueryHandler(status_handler, pattern="^status$"))

    # Команды
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_handler))
    application.add_handler(CommandHandler("status", status_handler))

    # Fallback для всего остального
    application.add_handler(MessageHandler(filters.ALL, unknown_message))

    # Запуск
    logger.info("Запуск в polling-режиме...")
    application.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()