import json
from channels.generic.websocket import AsyncWebsocketConsumer
import google.generativeai as genai
import os

class ChatbotConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # In a real app, verify user from self.scope['user']
        await self.accept()
        await self.send(text_data=json.dumps({
            'message': 'Connected to Career Copilot. How can I help you today?'
        }))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')

        # Send a typing indicator
        await self.send(text_data=json.dumps({
            'type': 'status',
            'message': 'Thinking...'
        }))

        try:
            genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "mock_key"))
            
            system_instruction = "If the user asks for a visualization or chart, you MUST return a special tag <UI_WIDGET type=\"radar\" /> in your response."
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=system_instruction
            )
            
            # Using streaming response to send words piece-by-piece
            response = model.generate_content(message, stream=True)
            
            for chunk in response:
                await self.send(text_data=json.dumps({
                    'type': 'stream',
                    'message': chunk.text
                }))
                
            await self.send(text_data=json.dumps({
                'type': 'end_stream'
            }))
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))
