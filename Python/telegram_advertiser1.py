from telethon import TelegramClient
from telethon.errors import (
    FloodWaitError, ChatWriteForbiddenError, PeerFloodError,
    UserBannedInChannelError, UserNotParticipantError,
    ChannelsTooMuchError, InviteHashExpiredError,
    InviteHashInvalidError, ChannelPrivateError
)
from telethon.tl.functions.channels import JoinChannelRequest
import asyncio
import random
import re
import requests
import os
from datetime import datetime

# === ДАННЫЕ ДЛЯ ПОДКЛЮЧЕНИЯ ===
api_id = 22136310
api_hash = '321107dae94b8e8857f44f3c9fd5a4ea'
session_name = 'my_session1'

client = TelegramClient(session_name, api_id, api_hash)

# URL для получения курса доставки
BACKEND_URL = "https://fluvion.by/api/exchange-rates/shipping/current"
DEFAULT_SHIPPING_RATE = 6.0  # Fallback значение

# Путь к рекламному изображению (пробуем разные форматы)
def get_ad_image_path():
    """Возвращает путь к рекламному изображению, если оно существует"""
    base_dir = os.path.dirname(__file__)
    possible_names = ['cargo.jpg', 'cargo.png', 'cargo.jpeg', 'cargo_ad.png', 'cargo_ad.jpg', 'ad_image.png', 'ad_image.jpg']
    for name in possible_names:
        path = os.path.join(base_dir, name)
        if os.path.exists(path):
            return path
    return None

AD_IMAGE_PATH = get_ad_image_path()

def get_shipping_rate():
    """Получает актуальный курс доставки из API"""
    try:
        response = requests.get(BACKEND_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            rate = data.get('rate', DEFAULT_SHIPPING_RATE)
            return rate
        else:
            print(f"Ошибка получения курса: статус {response.status_code}, используем значение по умолчанию")
            return DEFAULT_SHIPPING_RATE
    except Exception as e:
        print(f"Ошибка при получении курса из API: {e}, используем значение по умолчанию")
        return DEFAULT_SHIPPING_RATE

def get_ad_message():
    """Генерирует рекламное сообщение с актуальным курсом"""
    return f"""Хотите заказывать товары из Китая быстро и выгодно? 📦✨  
Fluvion — ваш надёжный карго!  
✅ Сборные грузы от {DEFAULT_SHIPPING_RATE}$/кг  
✅ Сроки доставки от 15 дней  
✅ Минимальный заказ от 1 кг  
✅ Система скидок делает покупки ещё выгоднее  

Ближайший сборный груз 31.02.2026"""

# Количество чатов для отправки
TARGET_CHATS_COUNT = 35

# Интервал между отправками (в секундах) - 30 минут
SEND_INTERVAL = 30 * 60  # 1800 секунд


def load_chats_from_file(filename='fleamarkets_list.txt'):
    """Загружает список чатов из файла"""
    chats = []
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                # Формат: Название: айди_чата
                if ':' in line:
                    parts = line.split(':', 1)
                    if len(parts) == 2:
                        title = parts[0].strip()
                        try:
                            chat_id = int(parts[1].strip())
                            chats.append({'title': title, 'chat_id': chat_id})
                        except ValueError:
                            continue
        return chats
    except FileNotFoundError:
        print(f"Файл {filename} не найден!")
        return []
    except Exception as e:
        print(f"Ошибка при чтении файла: {e}")
        return []


async def join_channel_by_username(username):
    """Подписывается на канал по username (например @second2006)"""
    try:
        # Убираем @ если есть
        username = username.lstrip('@')

        # Получаем entity по username
        entity = await client.get_entity(username)

        # Подписываемся
        await client(JoinChannelRequest(entity))
        await asyncio.sleep(1)
        return True, f"Подписался на канал @{username}"
    except ChannelsTooMuchError:
        return False, "Слишком много подписок на каналы"
    except InviteHashExpiredError:
        return False, "Приглашение истекло"
    except InviteHashInvalidError:
        return False, "Неверное приглашение"
    except ChannelPrivateError:
        return False, "Канал приватный, нет доступа"
    except Exception as e:
        return False, f"Ошибка подписки на @{username}: {str(e)}"


async def join_channel(chat_id):
    """Подписывается на канал/чат, если требуется"""
    try:
        # Получаем информацию о чате
        entity = await client.get_entity(chat_id)

        # Проверяем, является ли это каналом или супергруппой
        if hasattr(entity, 'broadcast') and entity.broadcast:
            # Это канал - пытаемся подписаться
            try:
                await client(JoinChannelRequest(entity))
                await asyncio.sleep(1)  # Небольшая задержка после подписки
                return True, "Подписался на канал"
            except ChannelsTooMuchError:
                return False, "Слишком много подписок на каналы"
            except InviteHashExpiredError:
                return False, "Приглашение истекло"
            except InviteHashInvalidError:
                return False, "Неверное приглашение"
            except ChannelPrivateError:
                return False, "Канал приватный, нет доступа"
            except Exception as e:
                return False, f"Ошибка подписки: {str(e)}"
        elif hasattr(entity, 'megagroup') and entity.megagroup:
            # Это супергруппа - пытаемся присоединиться
            try:
                await client(JoinChannelRequest(entity))
                await asyncio.sleep(1)
                return True, "Присоединился к группе"
            except Exception as e:
                return False, f"Ошибка присоединения: {str(e)}"
        else:
            # Обычный чат или уже участник
            return True, "Уже участник"
    except Exception as e:
        return False, f"Ошибка при проверке чата: {str(e)}"


def extract_channel_usernames_from_error(error_text):
    """Извлекает username каналов из текста ошибки или сообщения"""
    usernames = []
    # Ищем паттерны типа @username или @second2006
    # Паттерн для поиска @username
    pattern = r'@(\w+)'
    matches = re.findall(pattern, error_text)
    for match in matches:
        if match not in usernames:
            usernames.append(match)
    return usernames


async def check_and_subscribe_to_required_channels(chat_id):
    """Проверяет последние сообщения в чате на требования о подписке и подписывается"""
    try:
        # Получаем последние несколько сообщений
        messages = await client.get_messages(chat_id, limit=5)

        for msg in messages:
            if msg.text:
                text_lower = msg.text.lower()
                # Проверяем, есть ли требование о подписке
                if any(keyword in text_lower for keyword in
                       ['подписаться', 'subscribe', 'необходимо подписаться', 'нужно подписаться']):
                    # Извлекаем username каналов из сообщения
                    usernames = extract_channel_usernames_from_error(msg.text)
                    if usernames:
                        print(f"  ⚠ Обнаружено требование о подписке в сообщении, подписываюсь на каналы...")
                        for username in usernames:
                            print(f"  → Подписываюсь на @{username}...")
                            join_success, join_msg = await join_channel_by_username(username)
                            if join_success:
                                print(f"  ✓ {join_msg}")
                            else:
                                print(f"  ✗ {join_msg}")
                        return True
    except Exception as e:
        # Игнорируем ошибки при проверке сообщений
        pass
    return False


async def send_message_to_chat(chat_id, message):
    """Отправляет сообщение в чат, автоматически подписываясь если нужно"""
    # Используем локальную переменную для работы с ID (может быть преобразован)
    current_chat_id = chat_id
    
    # Сначала проверяем, нет ли требований о подписке в последних сообщениях
    await check_and_subscribe_to_required_channels(current_chat_id)

    max_retries = 2
    retry_count = 0

    while retry_count < max_retries:
        try:
            # Получаем entity перед отправкой, чтобы избежать ошибки "Could not find the input entity"
            entity = None
            try:
                entity = await client.get_entity(current_chat_id)
            except ValueError as ve:
                # Если не можем найти entity, пробуем преобразовать ID в правильный формат
                error_str = str(ve)
                if ("Could not find the input entity" in error_str or "PeerChannel" in error_str) and current_chat_id > 0:
                    # Пробуем с форматом -100{id} если ID положительный
                    try:
                        new_chat_id = int(f'-100{current_chat_id}')
                        entity = await client.get_entity(new_chat_id)
                        current_chat_id = new_chat_id
                    except:
                        return False, f"Could not find the input entity for PeerChannel(channel_id={chat_id})"
                else:
                    return False, f"Could not find the input entity for PeerChannel(channel_id={chat_id})"
            
            if entity is None:
                return False, f"Не удалось получить entity для chat_id={chat_id}"
            
            # Проверяем, существует ли файл изображения
            if AD_IMAGE_PATH and os.path.exists(AD_IMAGE_PATH):
                # Отправляем изображение с текстом как подпись
                await client.send_file(entity, AD_IMAGE_PATH, caption=message)
            else:
                # Если изображения нет, отправляем только текст
                await client.send_message(entity, message)
            return True, None
        except UserNotParticipantError as e:
            # Нужно подписаться на канал
            error_str = str(e)
            print(f"  ⚠ Требуется подписка (UserNotParticipantError), пытаюсь подписаться...")

            # Пробуем извлечь username каналов из ошибки
            usernames = extract_channel_usernames_from_error(error_str)

            # Сначала пробуем подписаться по username, если нашли
            if usernames:
                for username in usernames:
                    print(f"  → Пробую подписаться на @{username}...")
                    join_success, join_msg = await join_channel_by_username(username)
                    if join_success:
                        print(f"  ✓ {join_msg}")
                    else:
                        print(f"  ✗ {join_msg}")

            # Также пробуем подписаться на сам чат
            join_success, join_msg = await join_channel(current_chat_id)
            if join_success:
                print(f"  ✓ {join_msg}")
                # Пробуем отправить снова после подписки
                await asyncio.sleep(2)
                retry_count += 1
                continue
            else:
                return False, f"Не удалось подписаться: {join_msg}"

        except FloodWaitError as e:
            # Нужно подождать перед следующей отправкой
            wait_time = e.seconds
            return False, f"FloodWait: нужно подождать {wait_time} секунд"
        except ChatWriteForbiddenError:
            return False, "Нет прав на отправку сообщений в этот чат"
        except PeerFloodError:
            return False, "Слишком много сообщений (PeerFlood)"
        except UserBannedInChannelError:
            return False, "Пользователь забанен в этом канале"
        except ChannelPrivateError:
            return False, "Канал приватный, нет доступа"
        except Exception as e:
            error_str = str(e)
            # Проверяем, не связана ли ошибка с подпиской
            if "not a participant" in error_str.lower() or "not a member" in error_str.lower() or "подписаться" in error_str.lower() or "subscribe" in error_str.lower():
                print(f"  ⚠ Требуется подписка (из текста ошибки), пытаюсь подписаться...")

                # Пробуем извлечь username каналов из ошибки
                usernames = extract_channel_usernames_from_error(error_str)

                # Подписываемся на каналы по username
                if usernames:
                    for username in usernames:
                        print(f"  → Пробую подписаться на @{username}...")
                        join_success, join_msg = await join_channel_by_username(username)
                        if join_success:
                            print(f"  ✓ {join_msg}")
                        else:
                            print(f"  ✗ {join_msg}")

                # Также пробуем подписаться на сам чат
                join_success, join_msg = await join_channel(current_chat_id)
                if join_success:
                    print(f"  ✓ {join_msg}")
                    await asyncio.sleep(2)
                    retry_count += 1
                    continue
                else:
                    return False, f"Не удалось подписаться: {join_msg}"

            # Если это не ошибка подписки, возвращаем ошибку
            if retry_count == 0:
                return False, f"Ошибка: {error_str}"
            else:
                return False, f"Ошибка после подписки: {error_str}"

    return False, "Не удалось отправить после попыток подписки"


async def send_to_chats():
    """Отправляет сообщения во все чаты из списка"""
    chats = load_chats_from_file()

    if not chats:
        print("Нет доступных чатов для отправки!")
        return

    total_chats = len(chats)

    # Перемешиваем все чаты для случайности
    shuffled_chats = chats.copy()
    random.shuffle(shuffled_chats)

    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Начинаю отправку во все {total_chats} чатов из списка...")

    successful = 0
    failed_attempts = 0

    # Отправляем во все чаты из списка
    for chat in shuffled_chats:
        chat_id = chat['chat_id']
        title = chat['title']

        ad_message = get_ad_message()
        success, error = await send_message_to_chat(chat_id, ad_message)

        if success:
            successful += 1
            print(f"✓ [{successful}/{total_chats}] Отправлено в: {title} (ID: {chat_id})")
            # Небольшая задержка между отправками
            await asyncio.sleep(2)
        else:
            failed_attempts += 1
            # Проверяем, связана ли ошибка с подпиской
            if error and (
                    "подписк" in error.lower() or "subscribe" in error.lower() or "not a participant" in error.lower() or "not a member" in error.lower()):
                print(f"✗ Не удалось отправить в: {title} (ID: {chat_id}) - {error}")
            else:
                print(f"✗ Не удалось отправить в: {title} (ID: {chat_id}) - {error}")

            # Если это FloodWait, ждем
            if "FloodWait" in error:
                wait_match = re.search(r'(\d+)', error)
                if wait_match:
                    wait_seconds = int(wait_match.group(1))
                    # Если FloodWait слишком большой (больше 5 минут), пропускаем
                    if wait_seconds > 300:
                        print(f"  FloodWait слишком большой ({wait_seconds} сек), пропускаю...")
                        continue
                    print(f"  Ожидание {wait_seconds} секунд...")
                    await asyncio.sleep(wait_seconds)
            else:
                # Небольшая задержка между попытками
                await asyncio.sleep(1)

    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Итог: успешно отправлено в {successful} из {total_chats} чатов, неудачных попыток: {failed_attempts}")

    # Логируем результат в файл
    log_file = '../advertiser_log.txt'
    with open(log_file, 'a', encoding='utf-8') as f:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        f.write(f"[{timestamp}] Отправлено: {successful}/{total_chats}, Неудачных попыток: {failed_attempts}\n")

    if successful < total_chats:
        print(f"⚠ ВНИМАНИЕ: Удалось отправить только в {successful} из {total_chats} чатов!")


async def main_loop():
    """Основной цикл отправки каждые 30 минут"""
    print("Подключение к Telegram...")
    await client.start()
    print("Подключено! Скрипт запущен.\n")
    print(f"Интервал отправки: {SEND_INTERVAL // 60} минут")
    print(f"Отправка: во все чаты из списка")
    if AD_IMAGE_PATH and os.path.exists(AD_IMAGE_PATH):
        print(f"✓ Рекламное изображение найдено: {os.path.basename(AD_IMAGE_PATH)}\n")
    else:
        print("⚠ Рекламное изображение не найдено! Будет отправляться только текст.")
        print("  Поместите изображение в папку Python с именем: cargo.jpg (или cargo.png/.jpeg)\n")

    # Начальная задержка для работы в разное время с telegram_advertiser
    # telegram_advertiser работает сразу, telegram_advertiser1 - через 15 минут
    INITIAL_DELAY = 15 * 60  # 15 минут в секундах
    print(f"⏰ Начальная задержка: {INITIAL_DELAY // 60} минут (для работы в разное время с telegram_advertiser)...")
    await asyncio.sleep(INITIAL_DELAY)
    print(f"✓ Задержка завершена, начинаю отправку...\n")

    # Отправляем после задержки
    await send_to_chats()

    # Затем отправляем каждые 30 минут
    try:
        while True:
            print(f"\nОжидание {SEND_INTERVAL // 60} минут до следующей отправки...")
            await asyncio.sleep(SEND_INTERVAL)
            await send_to_chats()
    except asyncio.CancelledError:
        print("\n\nПолучен сигнал отмены, останавливаю скрипт...")
        raise


async def main():
    """Главная функция"""
    try:
        await main_loop()
    except KeyboardInterrupt:
        print("\n\nОстановка скрипта...")
    except asyncio.CancelledError:
        print("\n\nОперация отменена...")
    except Exception as e:
        print(f"\nКритическая ошибка: {e}")
        import traceback
        traceback.print_exc()
    finally:
        try:
            await client.disconnect()
        except:
            pass


if __name__ == '__main__':
    asyncio.run(main())

