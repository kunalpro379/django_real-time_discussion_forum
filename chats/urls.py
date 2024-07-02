from django.urls import path

from shared import views as shared_views
from shared.views import create_room, join_room

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('create/', create_room, name='create_room'),
    path('join/', join_room, name='join_room'),
    path('chat/<str:room_name>/', views.room_auth, name='room_auth'),
]
