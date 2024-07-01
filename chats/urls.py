from django.urls import path

from shared import views as shared_views

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('auth/', views.room_auth, name='room_auth'),
    path('chat/<str:room_name>/', views.room, name='room'),
]