from telethon import TelegramClient
from telethon.tl.types import Channel, Chat, ChannelForbidden
import asyncio
import re
from datetime import datetime

# === ДАННЫЕ ДЛЯ ПОДКЛЮЧЕНИЯ ===
api_id = 22136310
api_hash = '321107dae94b8e8857f44f3c9fd5a4ea'
session_name = 'my_session1'

client = TelegramClient(session_name, api_id, api_hash)

# Список названий чатов из вашего сообщения (точные строки)
CHAT_TITLES = [
    "Маркетплейс Беларусь Минск",
    "Куплю/Продаю/Отдаю/Меняю/Предлагаю -по всей России📌❗️❗️❗️",
    "FRAUDE | Продажа личных вещей | Барахолка вещей",
    "МАРКЕТПЛЕЙС 🇧🇾/🇷🇺",
    "Вейп Барахолка Минск",
    "Барахолка Беларусь",
    "Just Box барахолка",
    "МАРКЕТПЛЕЙС | BALD 🇧🇾",
    "Маркетплейс | Торговый чат🇧🇾",
    "Барахолка Беларусь 🇧🇾",
    "МАРКЕТПЛЕЙС BuySell 🇧🇾",
    "⏭ОБЪЯВЛЕНИЯ⏮Минск♥️ 🇧🇾",
    "МАРКЕТПЛЕЙС БАРЫГИ🇧🇾",
    "МАРКЕТПЛЕЙС РБ🇧🇾 | MARKETSPACE🪐",
    "Барахолка|РБ|Минск",
    "МАРКЕТПЛЕЙС🇧🇾|ПРИВАТ",
    "Барахолка 💤ᴋᴜʀsᴋ sʜᴏᴘ💙",
    "МАРКЕТПЛЕЙС РБ 🇧🇾 | Торговый чат",
    "Барахолка Юго-Запад Минск",
    "МАРКЕТПЛЕЙС РБ🇧🇾",
    "Maestro Marketplace",
    "МАРКЕТПЛЕЙС РБ 🇧🇾🚀",
    "БАРАХОЛКА БЕЛАРУСЬ | РБ 🇧🇾",
    "Барахолка Все Города",
    "МАРКЕТПЛЕЙС | ТОВАРНЫЙ ЧАТ",
    "COUNTRY | БАРАХОЛКА 🇷🇺",
    "Маркетплейс РБ Street Store 🇧🇾| Торговый чат",
    "Archipelag marketplace",
    "Маркетплейс 🇧🇾",
    "Маркетплейс | Торговый чат 🇧🇾",
    "🛒Маркетплейс РБ | Kastylshopp🛒",
    "МАРКЕТПЛЕЙС РБ🇧🇾",
    "Маркетплейс Frolov",
    "StoneMarketplace",
    "Маркетплейс РБ🇧🇾",
    "МАРКЕТПЛЕЙС|РБ|freak shit 🥷🏿",
    "Marketplace.seiz🇧🇾 | Торговый чат",
    "ШМОТКА🇧🇾| МАРКЕТПЛЕЙС & ЧАТ ПРОДАЖ 2",
    "| МАРКЕТПЛЕЙС | PБ | ТОВАРНЫЙ ЧАТ |",
    "КупиПродай | Маркетплейс 🇧🇾",
    "МАРКЕТПЛЕЙС | CENTRAL🇧🇾",
    "Маркетплейс|OPTDR🇧🇾",
    "🕸MARKETPLACE // PAYTINA Торговый чат - Беларусь",
    "Маркетплейс РБ 🇧🇾 👕",
    "МАРКЕТПЛЕЙС БЕЛАРУСЬ🇧🇾",
    "Маркетплейс РБ 🇧🇾",
    "🇧🇾 МАРКЕТПЛЕЙС 🇷🇺 | SLIDE",
    "Маркетплейс | RETAILL🇧🇾",
    "БАРАХОЛКА РБ (Беларусь)",
    "Гомель Чат Объявления Барахолка Недвижимость",
    "МАРКЕТПЛЕЙС РБ🇧🇾| LUNA |",
    "GANG МАРКЕТПЛЕЙС🇧🇾",
    "МАРКЕТПЛЕЙС-GSQ🇧🇾",
    "👔МАРКЕТПЛЕЙС |💸 РБ🇧🇾",
    "Маркетплейс • Беларусь",
    "ТОРГОВАЯ ПЛОЩАДКА БЕЛАРУСЬ🇧🇾",
    "Барахолка Gout shop",
    "МАРКЕТПЛЕЙС 2006",
    "Барахолка Sheksna",
    "MARKETPLACE BY LOYALSAN STORE",
    "Fast Check Marketplace",
    "ШМОТКА🇧🇾| МАРКЕТПЛЕЙС & ЧАТ ПРОДАЖ",
    "Маркетплейс | Торговый чат",
    "Маркетплейс|Godza",
    "Барахолка Беларусь 🇧🇾 МИНСК | БРЕСТ | ГРОДНО | МОГИЛЁВ | ВИТЕБСК | ГОМЕЛЬ",
    "БАРАХОЛКА SWAG🥷🦹‍♂",
    "МАРКЕТПЛЕЙС РБ 🇧🇾 | YARCHIK SHOP",
    "Huracan marketplace",
    "МАРКЕТПЛЕЙС 🇧🇾",
    "барахолка",
    "Барахолка",
    "МАРКЕТПЛЕЙС РБ l РФ",
    "Маркетплейс РБ | Минск | Беларусь",
    "DISKET MARKETPLACE",
    "Кэжуальная барахолка треп",
    "Барахолка Беларусь l Купи • Продай",
    "Гродно Чат Объявления Барахолка Недвижимость",
    "МАРКЕТПЛЕЙС БЕЛАРУСЬ🇧🇾",
    "Товарная лавка 🇧🇾💸 Барахолка.Опт, Розница.Товарка.",
    "МАРКЕТПЛЕЙС / ОДЕЖДА 🇧🇾",
    "Churks Маркетплейс ☀️🇧🇾 | Churks Marketplace ☀️🇧🇾 | Торговая Площадка | Продажа Вещей |",
    "Brand Swap Chat",
    "Минск Чат Объявления Барахолка Недвижимость",
    "Барахолка Минск | Купить, продать, отдать",
    "МАРКЕТПЛЕЙС 🇧🇾ClothSwap",
    "Marketplace | LaizenGroundSpace | BY🇧🇾",
    "🇨🇳 Alipay WeChat / Обмен ¥",
    "БАРАХОЛКА БЕЛАРУСЬ МИНСК РБ",
    "Обмен Рубли Юани / Пополнение Alipay и Wechat",
    "⚜️BRANDS⚜️ Маркетплейс🇧🇾 | Маркетплейс Беларуси | Минск",
    "ОБМЕН | Рубль-Юань (II)",
    "Geishaship|Обмен Юани на Рубли|Пополнение Alipay,WeChat",
    "URC / Обмен RUB|CNY (Юань)"
]


def normalize_title(title):
    """Нормализует название: нижний регистр, убирает эмодзи и лишние символы"""
    # Убираем эмодзи (диапазон Unicode)
    title = re.sub(r'[\U00010000-\U0010ffff]', '', title)
    # Убираем лишние пробелы и символы
    title = re.sub(r'[^a-zа-я0-9\s]', '', title.lower())
    title = re.sub(r'\s+', ' ', title).strip()
    return title


async def main():
    print("Подключение к Telegram...")
    await client.start()
    print("Подключено! Сканирую ваши диалоги...\n")

    normalized_search = {normalize_title(t): t for t in CHAT_TITLES}

    found_chats = []

    async for dialog in client.iter_dialogs():
        entity = dialog.entity
        # Интересуют только группы, супергруппы и каналы
        if hasattr(entity, 'title'):
            title = entity.title
            norm_title = normalize_title(title)

            if norm_title in normalized_search:
                original_title = normalized_search[norm_title]
                chat_id = getattr(entity, 'id', None)
                if chat_id:
                    # Для супергрупп ID уже отрицательный (-100...)
                    full_id = -1000000000000 - chat_id if chat_id < 1000000000000 else chat_id  # На всякий, но обычно уже правильный
                    print(f"✓ Найдено: {title} → ID: {chat_id}")
                    found_chats.append(f"{original_title}:{chat_id}")

    # Сохраняем в файл
    output_file = 'updated_fleamarkets_list.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        for line in found_chats:
            f.write(line + '\n')

    print(f"\nГотово! Найдено {len(found_chats)} чатов из {len(CHAT_TITLES)}.")
    print(f"Новый список сохранён в {output_file}")
    print("Используйте этот файл в основном скрипте рассылки.")

    await client.disconnect()


if __name__ == '__main__':
    asyncio.run(main())