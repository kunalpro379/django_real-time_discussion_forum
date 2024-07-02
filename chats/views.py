import json
import logging

from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password, make_password
from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from shared.models import ChatRoom, ChatUser, UserAndRoom

logger = logging.getLogger(__name__)

def index(request):
    print("Index page accessed")
    return render(request, 'shared/options.html', {'user': request.user})

def is_room_occupied(room_name):
    print(f"Checking if room {room_name} is occupied")
    room = ChatRoom.objects.filter(room_name=room_name)
    assert len(room) <= 1  # unique constraint
    return bool(len(room) == 0 or len(UserAndRoom.objects.filter(chat_room=room[0])) == 0)

@login_required
def create_room(request):
    if request.method == 'POST':
        room_name = request.POST.get('room_name')
        room_password = request.POST.get('room_password')

        print(f"Creating room: {room_name} with password: {room_password}")

        if len(room_password) < 3:
            print("Password too short")
            return render(request, 'shared/create_room.html', {'error_message': "Password length must be greater than 3 characters"})

        if is_room_occupied(room_name):
            print("Room already occupied")
            return render(request, 'shared/create_room.html', {'error_message': "Room is already occupied!"})

        chat_room, created = ChatRoom.objects.get_or_create(room_name=room_name)
        chat_room.room_password = make_password(room_password)  # Hash the password
        chat_room.is_occupied = True
        chat_room.admin_user = request.user
        chat_room.save()

        chat_user, created = ChatUser.objects.get_or_create(chat_user=request.user)
        UserAndRoom.objects.get_or_create(chat_user=chat_user, chat_room=chat_room, defaults={'is_admin': True})

        return HttpResponseRedirect(f'/code/{room_name}/')

    return render(request, 'shared/create_room.html')

@login_required
def join_room(request):
    if request.method == 'POST':
        room_name = request.POST.get('room_name')
        room_password = request.POST.get('room_password')
        
        print(f"Attempting to join room: {room_name} with provided password")

        try:
            chat_room = ChatRoom.objects.get(room_name=room_name)
            print(f"Found room: {room_name}")

            if not check_password(room_password, chat_room.room_password):
                print("Incorrect password provided")
                return render(request, 'shared/join_room.html', {'error_message': "Incorrect password!"})

            chat_user, created = ChatUser.objects.get_or_create(chat_user=request.user)
            UserAndRoom.objects.get_or_create(chat_user=chat_user, chat_room=chat_room)
            print(f"User {request.user} joined room {room_name}")

            return HttpResponseRedirect(f'/code/{room_name}/')
        except ChatRoom.DoesNotExist:
            print(f"Room {room_name} does not exist")
            return render(request, 'shared/join_room.html', {'error_message': "Room does not exist!"})

    return render(request, 'shared/join_room.html')

@login_required
def room_auth(request, room_name):
    print(f'Room {room_name} was visited')

    chat_user, created = ChatUser.objects.get_or_create(chat_user=request.user)

    if request.method == 'POST':
        room_password = request.POST.get('room_password')
        try:
            chat_room = ChatRoom.objects.get(room_name=room_name)
            if not check_password(room_password, chat_room.room_password):
                print("Incorrect password provided for room auth")
                return render(request, 'shared/shared.html', {
                    'room_name': room_name,
                    'get_pass': True,
                    'error_message': "Incorrect password!"
                })
            UserAndRoom.objects.get_or_create(chat_user=chat_user, chat_room=chat_room)
            return HttpResponseRedirect(f'/code/{room_name}/')
        except ChatRoom.DoesNotExist:
            print(f"Room {room_name} does not exist for room auth")
            return render(request, 'shared/shared.html', {
                'room_name': room_name,
                'get_pass': True,
                'error_message': "Room does not exist!"
            })

    if not is_room_occupied(room_name):
        print(f"Setting password for new room: {room_name}")
        return render(request, 'shared/shared.html', {
            'room_name': room_name,
            'set_pass': True,
        })
    else:
        chat_rooms = UserAndRoom.objects.filter(chat_user=chat_user)
        for room in chat_rooms:
            if str(room.chat_room) == room_name:
                print(f"User already authenticated for room: {room_name}")
                return render(request, 'shared/shared.html', {
                    'room_name': room_name,
                    'user': request.user,
                })
        print(f"User needs to provide password for room: {room_name}")
        return render(request, 'shared/shared.html', {
            'room_name': room_name,
            'get_pass': True,
        })
