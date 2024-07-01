from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.contrib.auth.hashers import make_password, check_password
from .models import ChatRoom, ChatUser, UserAndRoom
from chats.views import is_room_occupied
import logging

logger = logging.getLogger(__name__)

@login_required
def index(request):
    return render(request, 'index.html', {'user': request.user})

@login_required
def create_room(request):
    if request.method == 'POST':
        room_name = request.POST.get('room_name')
        room_password = request.POST.get('room_password')

        if len(room_password) < 3:
            return render(request, 'create_room.html', {
                'error_message': "Password length must be greater than 3 characters"
            })

        if is_room_occupied(room_name):
            return render(request, 'create_room.html', {
                'error_message': "Room is already occupied!"
            })

        chat_room, created = ChatRoom.objects.get_or_create(room_name=room_name)
        chat_room.room_password = make_password(room_password)  # Hash the password
        chat_room.is_occupied = True
        chat_room.admin_user = request.user
        chat_room.save()

        chat_user, created = ChatUser.objects.get_or_create(chat_user=request.user)
        UserAndRoom.objects.get_or_create(chat_user=chat_user, chat_room=chat_room, defaults={'is_admin': True})

        return HttpResponseRedirect(f'/code/{room_name}/')

    return render(request, 'create_room.html')

@login_required
def join_room(request):
    if request.method == 'POST':
        room_name = request.POST.get('room_name')
        room_password = request.POST.get('room_password')
        
        logger.info(f"Attempting to join room: {room_name} with provided password")

        try:
            chat_room = ChatRoom.objects.get(room_name=room_name)
            logger.info(f"Found room: {room_name}")

            if not check_password(room_password, chat_room.room_password):
                logger.warning("Incorrect password provided")
                return render(request, 'join_room.html', {
                    'error_message': "Incorrect password!"
                })

            chat_user, created = ChatUser.objects.get_or_create(chat_user=request.user)
            UserAndRoom.objects.get_or_create(chat_user=chat_user, chat_room=chat_room)
            logger.info(f"User {request.user} joined room {room_name}")

            return HttpResponseRedirect(f'/code/{room_name}/')
        except ChatRoom.DoesNotExist:
            logger.error(f"Room {room_name} does not exist")
            return render(request, 'join_room.html', {
                'error_message': "Room does not exist!"
            })

    return render(request, 'join_room.html')


@login_required
def room_auth(request, room_name):
    logger.info(f'Room {room_name} was visited')

    chat_user, created = ChatUser.objects.get_or_create(chat_user=request.user)

    if request.method == 'POST':
        room_password = request.POST.get('room_password')
        try:
            chat_room = ChatRoom.objects.get(room_name=room_name)
            if not check_password(room_password, chat_room.room_password):
                return render(request, 'shared/shared.html', {
                    'room_name': room_name,
                    'get_pass': True,
                    'error_message': "Incorrect password!"
                })
            UserAndRoom.objects.get_or_create(chat_user=chat_user, chat_room=chat_room)
            return HttpResponseRedirect(f'/code/{room_name}/')
        except ChatRoom.DoesNotExist:
            return render(request, 'shared/shared.html', {
                'room_name': room_name,
                'get_pass': True,
                'error_message': "Room does not exist!"
            })

    if not is_room_occupied(room_name):
        return render(request, 'shared/shared.html', {
            'room_name': room_name,
            'set_pass': True,
        })
    else:
        chat_rooms = UserAndRoom.objects.filter(chat_user=chat_user)
        for room in chat_rooms:
            if str(room.chat_room) == room_name:
                return render(request, 'shared/shared.html', {
                    'room_name': room_name,
                    'user': request.user,
                })
        return render(request, 'shared/shared.html', {
            'room_name': room_name,
            'get_pass': True,
        })

@login_required
def index(request):
    return render(request, 'index.html', {'user': request.user})
