from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

class ChatRoom(models.Model):
    room_name = models.CharField(max_length=20, unique=True)
    chat_users = models.ManyToManyField('ChatUser', through='UserAndRoom')
    room_password = models.CharField(max_length=128)  # increased length for hashed passwords
    is_occupied = models.BooleanField(default=False)
    admin_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='admin_rooms')

    def __str__(self):
        return self.room_name

class ChatUser(models.Model):
    chat_user = models.OneToOneField(User, on_delete=models.CASCADE)
    chat_rooms = models.ManyToManyField('ChatRoom', through='UserAndRoom')

    def __str__(self):
        return self.chat_user.username

class UserAndRoom(models.Model):
    chat_user = models.ForeignKey(ChatUser, on_delete=models.CASCADE)
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return f'u({str(self.chat_user)})-r({str(self.chat_room)})'
