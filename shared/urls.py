from django.urls import path
from . import views

app_name = 'shared'

urlpatterns = [
    path('', views.index, name='index'),
    path('create/', views.create_room, name='create_room'),
    path('join/', views.join_room, name='join_room'),
    path('<str:room_name>/', views.room_auth, name='room_auth'),
]
