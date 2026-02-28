from telethon import TelegramClient, events
from telethon.errors import FloodWaitError
import asyncio
import re

# === ТВОИ ДАННЫЕ ===
api_id = 21929023
api_hash = '24e43cff538002e4eb15460f2338737f'
session_name = 'my_session'

client = TelegramClient(session_name, api_id, api_hash)

