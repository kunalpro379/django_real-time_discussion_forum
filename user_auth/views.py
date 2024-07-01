from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from . import forms
from shared.models import ChatUser

def login(req):
    errors = []
    if req.method == 'POST':
        username = req.POST['username']
        password = req.POST['password']
        user = authenticate(request=req, username=username, password=password)
        if user is not None:
            print('User is authenticated')
            django_login(req, user)
            return redirect('index')
        else:
            print('User is not authenticated')
            errors.append('Invalid username or password')
    return render(req, 'login.html', {'errors': errors})

def register(req):
    errors = []
    if req.method == 'POST':
        form = forms.CreateUserForm(req.POST)
        if form.is_valid():
            print('Valid form')
            user = form.save()
            chat_user = ChatUser(chat_user=user)
            chat_user.save()
            return redirect('login')
        else:
            print('Invalid form')
            errors.append(form.errors)
            return render(req, 'register.html', {'form': form, 'errors': errors})
    else:
        form = forms.CreateUserForm()
    return render(req, 'register.html', {'form': form, 'errors': errors})

def logout(req):
    django_logout(req)
    return redirect('index')

# @login_required
# def room_options(request):
#     return render(request, 'room_options.html')

# def redirect_to_room_options(req):
#     if req.user.is_authenticated:
#         return redirect('room_options')
#     else:
#         return redirect('login')

def index(request):
    return render(request, 'index.html', {'user': request.user})


