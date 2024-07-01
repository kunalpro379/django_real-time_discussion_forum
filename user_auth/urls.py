from django.urls import path

from . import views

urlpatterns = [
    #path('room_auth/', views.index, name='index'),
    path('login/', views.login, name='login'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout, name='logout'),
    path('index/', views.index, name='index'), 
    #path('', views.redirect_to_room_options, name='redirect'), 
    #path('room_options/', views.room_options, name='room_options'),  # New path
]
