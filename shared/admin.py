from django.contrib import admin
from django import forms
from .models import ChatRoom, ChatUser, UserAndRoom

class ChatRoomAdminForm(forms.ModelForm):
    room_password = forms.CharField(widget=forms.PasswordInput, required=False)

    class Meta:
        model = ChatRoom
        fields = '__all__'

class UserAndRoomInline(admin.TabularInline):
    model = UserAndRoom
    extra = 1

class ChatRoomAdmin(admin.ModelAdmin):
    form = ChatRoomAdminForm
    list_display = ('room_name', 'is_occupied')
    fields = ('room_name', 'room_password', 'is_occupied')
    inlines = [UserAndRoomInline]

admin.site.register(ChatRoom, ChatRoomAdmin)
admin.site.register(ChatUser)
admin.site.register(UserAndRoom)
