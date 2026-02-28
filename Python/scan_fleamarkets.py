from telethon import TelegramClient
from telethon.tl.types import Dialog, Channel, Chat, User
from telethon.tl.functions.messages import GetDialogFiltersRequest
import asyncio
import re

# === ДАННЫЕ ДЛЯ ПОДКЛЮЧЕНИЯ ===
api_id = 21929023
api_hash = '24e43cff538002e4eb15460f2338737f'
session_name = 'my_session'

client = TelegramClient(session_name, api_id, api_hash)

# Ключевые слова для поиска барахолок/маркетплейсов
KEYWORDS = [
    'барахолка', 'барахолки', 'барахолку',
    'маркетплейс', 'маркетплейсы',
    'купи продай', 'купи-продай', 'куплю продам',
    'продажа', 'покупка', 'продам', 'куплю',
    'объявления', 'объявление',
    'торговля', 'торговая',
    'flea market', 'marketplace',
    'buy sell', 'buy&sell',
    'обмен', 'свап', 'swap',
    'авито', 'olx', 'куфары',
    'секонд хенд', 'second hand',
    'б/у', 'б у', 'бывшее в употреблении'
]

def contains_keywords(text):
    """Проверяет, содержит ли текст ключевые слова"""
    if not text:
        return False
    text_lower = text.lower()
    for keyword in KEYWORDS:
        if keyword.lower() in text_lower:
            return True
    return False

async def scan_dialogs():
    """Сканирует все диалоги и находит группы, связанные с барахолками"""
    print("Подключение к Telegram...")
    await client.start()
    print("Подключено! Начинаю сканирование...\n")
    
    fleamarkets = []
    
    # Получаем все диалоги
    dialogs = await client.get_dialogs()
    print(f"Найдено диалогов: {len(dialogs)}\n")
    
    # Сканируем каждый диалог
    for dialog in dialogs:
        entity = dialog.entity
        
        # Пропускаем личные чаты
        if isinstance(entity, User):
            continue
        
        # Получаем название
        title = getattr(entity, 'title', None) or getattr(entity, 'first_name', None) or 'Без названия'
        
        # Получаем ID чата
        chat_id = entity.id
        
        # Проверяем название
        is_fleamarket = contains_keywords(title)
        
        # Если не нашли по названию, проверяем описание (если есть)
        if not is_fleamarket and hasattr(entity, 'about'):
            about = entity.about or ''
            is_fleamarket = contains_keywords(about)
        
        if is_fleamarket:
            fleamarkets.append({
                'title': title,
                'chat_id': chat_id,
                'type': 'channel' if isinstance(entity, Channel) else 'group',
                'username': getattr(entity, 'username', None)
            })
            print(f"✓ Найдено: {title} (ID: {chat_id})")
    
    # Проверяем папки (folders) в Telegram
    print("\nПроверяю папки...")
    try:
        # Получаем все папки через GetDialogFiltersRequest
        result = await client(GetDialogFiltersRequest())
        filters = result if isinstance(result, list) else []
        
        for folder in filters:
            folder_title = None
            if hasattr(folder, 'title') and folder.title:
                folder_title = folder.title
            elif hasattr(folder, 'filter') and hasattr(folder.filter, 'title'):
                folder_title = folder.filter.title
            
            if not folder_title:
                folder_title = 'Без названия'
            
            print(f"\nПапка: {folder_title}")
            
            # Проверяем, связана ли папка с барахолками
            is_fleamarket_folder = contains_keywords(folder_title)
            
            if is_fleamarket_folder:
                print(f"  → Папка '{folder_title}' связана с барахолками!")
            
            # Получаем список пиров из папки
            peers_to_check = []
            
            # Проверяем разные типы фильтров
            folder_filter = folder
            if hasattr(folder, 'filter'):
                folder_filter = folder.filter
            
            # Получаем пиры из include_peers
            if hasattr(folder_filter, 'include_peers') and folder_filter.include_peers:
                peers_to_check.extend(folder_filter.include_peers)
            
            # Получаем пиры из pinned_peers
            if hasattr(folder_filter, 'pinned_peers') and folder_filter.pinned_peers:
                peers_to_check.extend(folder_filter.pinned_peers)
            
            # Обрабатываем все пиры из папки
            for peer in peers_to_check:
                try:
                    # Получаем ID чата из peer
                    peer_id = None
                    if hasattr(peer, 'channel_id') and peer.channel_id:
                        peer_id = peer.channel_id
                    elif hasattr(peer, 'chat_id') and peer.chat_id:
                        peer_id = peer.chat_id
                    elif hasattr(peer, 'user_id') and peer.user_id:
                        # Пропускаем пользователей
                        continue
                    
                    if peer_id:
                        # Ищем этот чат в наших диалогах
                        for dialog in dialogs:
                            entity = dialog.entity
                            # Пропускаем пользователей
                            if isinstance(entity, User):
                                continue
                            
                            # Сравниваем ID (могут быть отрицательными для групп)
                            if abs(entity.id) == abs(peer_id):
                                title = getattr(entity, 'title', None) or 'Без названия'
                                chat_id = entity.id
                                
                                # Если папка связана с барахолками, добавляем все чаты из неё
                                # Или если сам чат содержит ключевые слова
                                should_add = is_fleamarket_folder or contains_keywords(title)
                                
                                if should_add:
                                    # Проверяем, не добавлен ли уже
                                    if not any(fm['chat_id'] == chat_id for fm in fleamarkets):
                                        fleamarkets.append({
                                            'title': title,
                                            'chat_id': chat_id,
                                            'type': 'channel' if isinstance(entity, Channel) else 'group',
                                            'username': getattr(entity, 'username', None),
                                            'folder': folder_title
                                        })
                                        print(f"  ✓ Из папки: {title} (ID: {chat_id})")
                                break
                except Exception as e:
                    print(f"  Ошибка при обработке peer: {e}")
                    continue
    except Exception as e:
        print(f"Ошибка при получении папок: {e}")
        import traceback
        traceback.print_exc()
    
    return fleamarkets

async def main():
    try:
        fleamarkets = await scan_dialogs()
        
        print(f"\n\n{'='*60}")
        print(f"ИТОГО НАЙДЕНО: {len(fleamarkets)} групп/каналов")
        print(f"{'='*60}\n")
        
        # Сохраняем результат в файл в формате: Название: айди_чата
        output_file = 'fleamarkets_list.txt'
        with open(output_file, 'w', encoding='utf-8') as f:
            for fm in fleamarkets:
                f.write(f"{fm['title']}: {fm['chat_id']}\n")
        
        print(f"Результат сохранен в файл: {output_file}\n")
        
        # Выводим список в консоль
        print("СПИСОК:")
        print("-" * 60)
        for fm in fleamarkets:
            print(f"{fm['title']}: {fm['chat_id']}")
        
    except Exception as e:
        print(f"Ошибка: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())

