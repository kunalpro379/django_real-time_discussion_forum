from django import forms
from .models import ChatRoom

class CreateRoomForm(forms.ModelForm):
    class Meta:
        model = ChatRoom
        fields = ['room_name', 'room_password']

    def __init__(self, *args, **kwargs):
        super(CreateRoomForm, self).__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
