from flask import Flask, render_template, jsonify, request
from telethon import TelegramClient
from telethon.tl.types import Channel, Chat, User
from telethon.tl.functions.messages import GetDialogFiltersRequest
import asyncio
import os
import json
from datetime import datetime

app = Flask(__name__)

# === ДАННЫЕ ДЛЯ ПОДКЛЮЧЕНИЯ ===
api_id = 21929023
api_hash = '24e43cff538002e4eb15460f2338737f'
session_name = 'my_session'

# Глобальный клиент и event loop
client = None
background_loop = None
loop_thread = None
import threading

# Названия папок для поиска
TARGET_FOLDERS = ['Барахолка 1', 'Барахолка 2', 'барахолка 1', 'барахолка 2']

def get_client():
    """Получает или создает клиент Telegram"""
    global client, background_loop, loop_thread
    
    if client is None:
        # Создаем фоновый event loop в отдельном потоке сначала
        if background_loop is None:
            def run_loop():
                global background_loop
                background_loop = asyncio.new_event_loop()
                asyncio.set_event_loop(background_loop)
                background_loop.run_forever()
            
            loop_thread = threading.Thread(target=run_loop, daemon=True)
            loop_thread.start()
            # Ждем немного, чтобы loop запустился
            import time
            time.sleep(0.2)
            print("Фоновый event loop запущен")
        
        # Используем абсолютный путь к сессии
        session_path = os.path.join(os.path.dirname(__file__), session_name)
        client = TelegramClient(session_path, api_id, api_hash, loop=background_loop)
        print(f"Инициализирован клиент Telegram с сессией: {session_path}")
        
        # Подключаем клиент в фоновом loop
        if background_loop and background_loop.is_running():
            def init_client():
                async def do_init():
                    if not client.is_connected():
                        await client.connect()
                    if not await client.is_user_authorized():
                        await client.start()
                
                asyncio.run_coroutine_threadsafe(do_init(), background_loop).result(timeout=10)
            
            init_thread = threading.Thread(target=init_client)
            init_thread.start()
            init_thread.join(timeout=10)
            print("Клиент подключен в фоновом loop")
    
    return client

def load_chats_from_file(filename='fleamarkets_list.txt'):
    """Загружает список чатов из файла для рассылки"""
    chats = []
    try:
        filepath = os.path.join(os.path.dirname(__file__), filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
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
        return []
    except Exception as e:
        print(f"Ошибка при чтении файла: {e}")
        return []

def save_chats_to_file(chats, filename='fleamarkets_list.txt'):
    """Сохраняет список чатов в файл"""
    try:
        filepath = os.path.join(os.path.dirname(__file__), filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            for chat in chats:
                f.write(f"{chat['title']}: {chat['chat_id']}\n")
        return True
    except Exception as e:
        print(f"Ошибка при записи файла: {e}")
        return False

async def get_all_chats_from_folders():
    """Получает все чаты из указанных папок"""
    client = get_client()
    
    try:
        # Проверяем, подключен ли клиент
        if not client.is_connected():
            print("Клиент не подключен, подключаюсь...")
            await client.connect()
        
        # Проверяем авторизацию, если не авторизован - запускаем start()
        if not await client.is_user_authorized():
            print("Пользователь не авторизован, запускаю авторизацию...")
            await client.start()
        
        if not await client.is_user_authorized():
            print("Пользователь не авторизован в Telegram")
            return []
        
        all_dialogs = await client.get_dialogs()
        print(f"Всего диалогов: {len(all_dialogs)}")
        
        try:
            result = await client(GetDialogFiltersRequest())
            
            filters = []
            if hasattr(result, 'filters'):
                filters = result.filters or []
            elif isinstance(result, list):
                filters = result
            
            folder_map = {}
            for folder in filters:
                folder_id = None
                folder_title = None
                
                if hasattr(folder, 'id'):
                    folder_id = folder.id
                
                if hasattr(folder, 'title') and folder.title:
                    # Извлекаем текст из TextWithEntities если нужно
                    if hasattr(folder.title, 'text'):
                        folder_title = folder.title.text
                    elif hasattr(folder.title, '__str__'):
                        folder_title = str(folder.title)
                    else:
                        folder_title = folder.title
                elif hasattr(folder, 'filter') and hasattr(folder.filter, 'title'):
                    title_obj = folder.filter.title
                    if hasattr(title_obj, 'text'):
                        folder_title = title_obj.text
                    elif hasattr(title_obj, '__str__'):
                        folder_title = str(title_obj)
                    else:
                        folder_title = title_obj
                
                if not folder_title:
                    folder_title = f'Папка {folder_id}' if folder_id else 'Без названия'
                
                # Убеждаемся, что folder_title - строка
                if not isinstance(folder_title, str):
                    folder_title = str(folder_title)
                
                if folder_id and folder_title:
                    folder_map[folder_id] = folder_title
            
            print(f"Найдено папок: {len(folder_map)}")
            
            target_folder_ids = []
            for folder_id, folder_title in folder_map.items():
                folder_title_lower = folder_title.lower()
                for target in TARGET_FOLDERS:
                    if target.lower() in folder_title_lower or folder_title_lower in target.lower():
                        target_folder_ids.append(folder_id)
                        print(f"Найдена целевая папка: {folder_title} (ID: {folder_id})")
                        break
            
            all_chats = []
            folders_worked = False
            
            # Если нашли целевые папки, пробуем получить чаты из них
            if target_folder_ids:
                for folder_id in target_folder_ids:
                    folder_title = folder_map[folder_id]
                    try:
                        folder_dialogs = await client.get_dialogs(folder=folder_id)
                        print(f"Найдено диалогов в папке '{folder_title}': {len(folder_dialogs)}")
                        folders_worked = True
                        
                        for dialog in folder_dialogs:
                            entity = dialog.entity
                            
                            if isinstance(entity, User):
                                continue
                            
                            title = getattr(entity, 'title', None) or 'Без названия'
                            chat_id = entity.id
                            chat_type = 'channel' if isinstance(entity, Channel) else 'group'
                            username = getattr(entity, 'username', None)
                            
                            if not any(ch['chat_id'] == chat_id for ch in all_chats):
                                all_chats.append({
                                    'title': title,
                                    'chat_id': chat_id,
                                    'type': chat_type,
                                    'username': username,
                                    'folder': folder_title
                                })
                    except Exception as e:
                        error_name = type(e).__name__
                        print(f"Ошибка при получении диалогов из папки {folder_id} ({folder_title}): {error_name}")
                        # Продолжаем, не прерываем выполнение
                        continue
            
            # ВСЕГДА получаем все чаты, если папки не сработали или чатов мало
            if not folders_worked or len(all_chats) == 0:
                if target_folder_ids and folders_worked:
                    print(f"Папки сработали, но чатов мало ({len(all_chats)}), получаю все чаты...")
                elif target_folder_ids:
                    print("Папки не сработали, получаю все чаты из всех диалогов...")
                else:
                    print("Целевые папки не найдены, получаю все чаты из всех диалогов...")
                
                # Очищаем список, чтобы не было дубликатов
                all_chats = []
                
                for dialog in all_dialogs:
                    entity = dialog.entity
                    if isinstance(entity, User):
                        continue
                    
                    title = getattr(entity, 'title', None) or 'Без названия'
                    chat_id = entity.id
                    chat_type = 'channel' if isinstance(entity, Channel) else 'group'
                    username = getattr(entity, 'username', None)
                    
                    all_chats.append({
                        'title': title,
                        'chat_id': chat_id,
                        'type': chat_type,
                        'username': username,
                        'folder': 'Все чаты'
                    })
            
            print(f"Итого найдено чатов: {len(all_chats)}")
            return all_chats
            
        except Exception as e:
            print(f"Ошибка при получении папок: {e}")
            # Пробуем получить все чаты из всех диалогов
            print("Пробую получить все чаты из всех диалогов...")
            all_chats = []
            for dialog in all_dialogs:
                entity = dialog.entity
                if isinstance(entity, User):
                    continue
                
                title = getattr(entity, 'title', None) or 'Без названия'
                chat_id = entity.id
                chat_type = 'channel' if isinstance(entity, Channel) else 'group'
                username = getattr(entity, 'username', None)
                
                all_chats.append({
                    'title': title,
                    'chat_id': chat_id,
                    'type': chat_type,
                    'username': username,
                    'folder': 'Все чаты'
                })
            
            print(f"Итого найдено чатов из всех диалогов: {len(all_chats)}")
            return all_chats
            
    except Exception as e:
        print(f"Критическая ошибка: {e}")
        import traceback
        traceback.print_exc()
        # Пробуем переподключиться при следующем запросе
        try:
            if client.is_connected():
                # Не отключаемся полностью, просто помечаем что была ошибка
                pass
        except:
            pass
        return []
    finally:
        # Не отключаемся, чтобы не терять соединение между запросами
        # Но проверяем, что соединение активно
        try:
            if client.is_connected():
                pass  # Соединение активно, оставляем его
            else:
                print("Соединение потеряно, будет переподключение при следующем запросе")
        except:
            pass

def run_async(coro):
    """Запускает асинхронную функцию в фоновом event loop"""
    global background_loop
    
    # Убеждаемся, что фоновый loop создан
    if background_loop is None:
        get_client()
        # Ждем немного, чтобы loop запустился
        import time
        time.sleep(0.1)
    
    # Используем фоновый loop для выполнения корутины
    import concurrent.futures
    
    future = concurrent.futures.Future()
    
    def schedule_coro():
        try:
            task = asyncio.run_coroutine_threadsafe(coro, background_loop)
            result = task.result(timeout=90)
            future.set_result(result)
        except Exception as e:
            future.set_exception(e)
    
    # Запускаем корутину в фоновом loop
    if background_loop and background_loop.is_running():
        task = asyncio.run_coroutine_threadsafe(coro, background_loop)
        try:
            return task.result(timeout=90)
        except concurrent.futures.TimeoutError:
            print("Таймаут при выполнении запроса")
            raise
        except Exception as e:
            print(f"Ошибка при выполнении корутины: {e}")
            raise
    else:
        # Fallback: создаем новый loop если фоновый не работает
        return asyncio.run(coro)

@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html')

@app.route('/api/chats')
def get_chats():
    """API для получения всех чатов"""
    try:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Запрос на получение чатов...")
        all_chats = run_async(get_all_chats_from_folders())
        print(f"Получено чатов: {len(all_chats)}")
        
        spam_list = load_chats_from_file()
        print(f"Чатов в списке рассылки: {len(spam_list)}")
        
        # Создаем set из chat_id для быстрой проверки
        spam_chat_ids = {chat['chat_id'] for chat in spam_list}
        
        # Помечаем чаты, которые в списке рассылки
        for chat in all_chats:
            chat['in_spam_list'] = chat['chat_id'] in spam_chat_ids
        
        return jsonify({
            'success': True,
            'chats': all_chats,
            'spam_list_count': len(spam_list)
        })
    except Exception as e:
        print(f"Ошибка в API /api/chats: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/spam-list')
def get_spam_list():
    """API для получения списка рассылки"""
    try:
        spam_list = load_chats_from_file()
        return jsonify({
            'success': True,
            'chats': spam_list
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/spam-list/add', methods=['POST'])
def add_to_spam_list():
    """API для добавления чата в список рассылки"""
    try:
        data = request.json
        chat_id = data.get('chat_id')
        title = data.get('title')
        
        if not chat_id or not title:
            return jsonify({
                'success': False,
                'error': 'Не указаны chat_id или title'
            }), 400
        
        spam_list = load_chats_from_file()
        
        # Проверяем, нет ли уже такого чата
        if any(chat['chat_id'] == chat_id for chat in spam_list):
            return jsonify({
                'success': False,
                'error': 'Чат уже в списке'
            }), 400
        
        spam_list.append({'title': title, 'chat_id': chat_id})
        
        if save_chats_to_file(spam_list):
            return jsonify({
                'success': True,
                'message': 'Чат добавлен в список рассылки'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Ошибка при сохранении файла'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/spam-list/remove', methods=['POST'])
def remove_from_spam_list():
    """API для удаления чата из списка рассылки"""
    try:
        data = request.json
        chat_id = data.get('chat_id')
        
        if not chat_id:
            return jsonify({
                'success': False,
                'error': 'Не указан chat_id'
            }), 400
        
        spam_list = load_chats_from_file()
        
        # Удаляем чат из списка
        spam_list = [chat for chat in spam_list if chat['chat_id'] != chat_id]
        
        if save_chats_to_file(spam_list):
            return jsonify({
                'success': True,
                'message': 'Чат удален из списка рассылки'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Ошибка при сохранении файла'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

