#!/usr/bin/env python3
"""Тестовый скрипт для проверки подключения к Telegram"""

from telethon import TelegramClient
import asyncio
import os

api_id = 21929023
api_hash = '24e43cff538002e4eb15460f2338737f'
session_name = 'my_session'

async def test_connection():
    session_path = os.path.join(os.path.dirname(__file__), session_name)
    client = TelegramClient(session_path, api_id, api_hash)
    
    try:
        print(f"Подключение с сессией: {session_path}")
        await client.start()
        
        if not await client.is_user_authorized():
            print("❌ Пользователь не авторизован!")
            return False
        
        print("✅ Пользователь авторизован")
        
        # Получаем информацию о себе
        me = await client.get_me()
        print(f"✅ Подключен как: {me.first_name} {me.last_name or ''} (@{me.username or 'без username'})")
        
        # Получаем диалоги
        dialogs = await client.get_dialogs(limit=5)
        print(f"✅ Получено диалогов (первые 5): {len(dialogs)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        await client.disconnect()

if __name__ == '__main__':
    result = asyncio.run(test_connection())
    if result:
        print("\n✅ Подключение работает!")
    else:
        print("\n❌ Проблемы с подключением!")





