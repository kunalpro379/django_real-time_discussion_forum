import json

from channels.db import database_sync_to_async
from shared.models import ChatUser, ChatRoom, UserAndRoom
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatRoomConsumer(AsyncWebsocketConsumer):
    #handingling the websocket connection s

    async def connect(self): 
        self.user = self.scope['user'] #get the current user from websocket scope
        self.room_name=self.scope['url_route']['kwargs']['room_name']
        #extract the room name from the url
        self.room_group_name='chat_%s' % self.room_name
        #construct channelgroup name based on room name
        self.chat_user=await self.get_chat_user()
        self.chat_room=await self.get_chat_room()

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )#adding current schannel websocket connection to the channel group
        # send the message to the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            {
                'type': 'connect_message',
                'message': f'{self.user.username} has joined the chat...'
            }
        )
        await self.accept()
    #accepts the websocket connections

    @database_sync_to_async   #decorator
    def get_chat_user(self):
        return ChatUser.objects.get(chat_user=self.scope['user'])

    async def disconnect(self, close_code):
        print("recieved exit from user" , self.user.username)
        await self.remove_chat_user()
        print("removed user from chat room")
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'disconnect_message',
                'message': f'{self.user.username} has left the chat...'
            }
        )
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    @database_sync_to_async
    def get_chat_room(self):
        return ChatRoom.objects.get(room_name=self.room_name)        
    @database_sync_to_async
    def remove_chat_user(self):
        self.chat_user.chat_rooms.remove(self.chat_room)    
        self.chat_user.save()

    async def receive(self, text_data):
        text_data_json=json.loads(text_data)
        if text_data_json['type']=='chat':
            text=text_data_json['message']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chatroom_message',
                    'message': text,
                    'username': self.user.username
                }
            )
            
        elif text_data_json['type']=='canvas':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'canvas_information',
                    'data': text_data_json['data'],
                    'username': self.user.username,
                }
            )
        elif text_data_json['type']=='output':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'code_output',
                    'data': text_data_json['data'],
                    'username': self.user.username,
                }
            )
        else: 
            text=text_data_json['text']
            sync =True if 'sync' in text_data_json else False
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'text_change',
                    'message': text,
                    'username': self.user.username,
                    'sync': sync
                }
            )
    async def chatroom_message(self, event):
        text=event['text']
        username=event['username']
        sync =event['sync']
        print("got some text\n", text)
        if sync:
            print("it is a sync request")
        await self.send(text_data=json.dumps({
            'type': 'editor',
            'text': text,
            'username': username,
            'sync': sync
        }))
    async def canvas_information(self, event):
        data=event['data']
        username=event['username']
        await self.send(text_data=json.dumps({
            'type': 'canvas',
            'data': data,
            'username': username
        }))

    async def code_output(self, event):
        data=event['data']
        username=event['username']
        await self.send(text_data=json.dumps({
            'type': 'output',
            'data': data,
            'username': username
        }))

    async def text_change(self, event):
        text=event['text']
        username=event['username']
        sync=event['sync']
        print("got some text\n", text)
        if sync:
            print("it is a sync request")
        await self.send(text_data=json.dumps({
            'type': 'editor',
            'text': text,
            'username': username,
            'sync': sync
        })) 

    async def disconnect_message(self, event):
        message=event['message']
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message
        }))

    async def connect_message(self, event): 
        message=event['message']
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message
        }))

    pass
