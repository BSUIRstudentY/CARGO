from telethon import TelegramClient
from telethon.tl.types import Channel, Chat, User
from telethon.tl.functions.messages import GetDialogFiltersRequest
import asyncio

# === ДАННЫЕ ДЛЯ ПОДКЛЮЧЕНИЯ ===
api_id = 21929023
api_hash = '24e43cff538002e4eb15460f2338737f'
session_name = 'my_session'

client = TelegramClient(session_name, api_id, api_hash)

# Названия папок для поиска (регистр не важен)
TARGET_FOLDERS = ['Барахолка 1', 'Барахолка 2', 'барахолка 1', 'барахолка 2']

async def get_chats_from_folders():
    """Получает все чаты из указанных папок"""
    print("Подключение к Telegram...")
    await client.start()
    print("Подключено! Ищу папки...\n")
    
    # Получаем все диалоги
    all_dialogs = await client.get_dialogs()
    print(f"Всего диалогов: {len(all_dialogs)}\n")
    
    # Сначала получаем список всех папок
    try:
        result = await client(GetDialogFiltersRequest())
        
        # Извлекаем список фильтров
        filters = []
        if hasattr(result, 'filters'):
            filters = result.filters or []
        elif isinstance(result, list):
            filters = result
        
        print(f"Найдено папок в системе: {len(filters)}\n")
        
        # Выводим все папки для отладки
        print("📁 Все доступные папки:")
        folder_map = {}  # Маппинг названия папки -> folder_id
        
        for folder in filters:
            folder_title = None
            folder_id = None
            
            # Получаем ID папки
            if hasattr(folder, 'id'):
                folder_id = folder.id
            
            # Получаем название папки
            if hasattr(folder, 'title') and folder.title:
                folder_title = folder.title
            elif hasattr(folder, 'filter') and hasattr(folder.filter, 'title'):
                folder_title = folder.filter.title
            
            if not folder_title:
                folder_title = f'Папка {folder_id}' if folder_id else 'Без названия'
            
            print(f"  ID: {folder_id}, Название: {folder_title}")
            
            if folder_id and folder_title:
                folder_map[folder_id] = folder_title
        
        print()
        
        # Ищем нужные папки по названию
        target_folder_ids = []
        for folder_id, folder_title in folder_map.items():
            folder_title_lower = folder_title.lower()
            for target in TARGET_FOLDERS:
                if target.lower() in folder_title_lower or folder_title_lower in target.lower():
                    print(f"✓ Найдена папка: {folder_title} (ID: {folder_id})")
                    target_folder_ids.append(folder_id)
                    break
        
        if not target_folder_ids:
            print(f"❌ Не найдено папок с названиями: {', '.join(TARGET_FOLDERS)}")
            print("\n💡 Доступные папки:")
            for folder_id, folder_title in folder_map.items():
                print(f"  - {folder_title} (ID: {folder_id})")
            print("\n💡 Измените TARGET_FOLDERS в скрипте на точные названия из списка выше")
            return []
        
        # Получаем чаты из найденных папок
        all_chats = []
        
        for folder_id in target_folder_ids:
            folder_title = folder_map[folder_id]
            
            print(f"\n{'='*60}")
            print(f"Папка: {folder_title} (ID: {folder_id})")
            print(f"{'='*60}")
            
            try:
                # Получаем диалоги из конкретной папки
                folder_dialogs = await client.get_dialogs(folder=folder_id)
                
                print(f"Найдено диалогов в папке: {len(folder_dialogs)}\n")
                
                folder_chats = []
                
                for dialog in folder_dialogs:
                    entity = dialog.entity
                    
                    # Пропускаем пользователей
                    if isinstance(entity, User):
                        continue
                    
                    title = getattr(entity, 'title', None) or 'Без названия'
                    chat_id = entity.id
                    chat_type = 'channel' if isinstance(entity, Channel) else 'group'
                    username = getattr(entity, 'username', None)
                    
                    # Проверяем, не добавлен ли уже
                    if not any(ch['chat_id'] == chat_id for ch in folder_chats):
                        folder_chats.append({
                            'title': title,
                            'chat_id': chat_id,
                            'type': chat_type,
                            'username': username,
                            'folder': folder_title
                        })
                        print(f"  ✓ {title} (ID: {chat_id}, тип: {chat_type})")
                
                all_chats.extend(folder_chats)
                print(f"\nВсего чатов в папке '{folder_title}': {len(folder_chats)}")
                
            except Exception as e:
                print(f"❌ Ошибка при получении диалогов из папки {folder_id}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        return all_chats
        
    except Exception as e:
        print(f"❌ Ошибка при получении папок: {e}")
        import traceback
        traceback.print_exc()
        
        # Альтернативный способ - пробуем получить диалоги из папок по ID напрямую
        print("\n🔄 Пробую альтернативный способ...")
        print("Проверяю папки с ID от 1 до 10...")
        
        all_chats = []
        for folder_id in range(1, 11):
            try:
                folder_dialogs = await client.get_dialogs(folder=folder_id)
                if folder_dialogs:
                    print(f"  ✓ Найдены диалоги в папке ID {folder_id}: {len(folder_dialogs)}")
                    
                    folder_chats = []
                    for dialog in folder_dialogs:
                        entity = dialog.entity
                        if isinstance(entity, User):
                            continue
                        
                        title = getattr(entity, 'title', None) or 'Без названия'
                        chat_id = entity.id
                        chat_type = 'channel' if isinstance(entity, Channel) else 'group'
                        
                        folder_chats.append({
                            'title': title,
                            'chat_id': chat_id,
                            'type': chat_type,
                            'folder': f'Папка {folder_id}'
                        })
                    
                    all_chats.extend(folder_chats)
            except:
                pass
        
        return all_chats

async def main():
    try:
        chats = await get_chats_from_folders()
        
        if chats:
            print(f"\n\n{'='*60}")
            print(f"ИТОГО НАЙДЕНО ЧАТОВ: {len(chats)}")
            print(f"{'='*60}\n")
            
            # Группируем по папкам
            chats_by_folder = {}
            for chat in chats:
                folder = chat.get('folder', 'Без папки')
                if folder not in chats_by_folder:
                    chats_by_folder[folder] = []
                chats_by_folder[folder].append(chat)
            
            # Выводим список в формате для fleamarkets_list.txt
            print("СПИСОК ВСЕХ ЧАТОВ:")
            print("-" * 60)
            for chat in chats:
                print(f"{chat['title']}: {chat['chat_id']}")
            
            # Сохраняем в файл
            output_file = 'folder_chats_list.txt'
            with open(output_file, 'w', encoding='utf-8') as f:
                for chat in chats:
                    f.write(f"{chat['title']}: {chat['chat_id']}\n")
            
            print(f"\n✓ Результат сохранен в файл: {output_file}")
            
            # Выводим статистику по папкам
            print("\n📊 Статистика по папкам:")
            for folder, folder_chats in chats_by_folder.items():
                print(f"  {folder}: {len(folder_chats)} чатов")
        else:
            print("\n❌ Чаты не найдены")
            print("\n💡 Попробуйте:")
            print("   1. Проверить точные названия папок в Telegram")
            print("   2. Изменить TARGET_FOLDERS в скрипте")
            print("   3. Убедиться, что папки существуют и содержат чаты")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
