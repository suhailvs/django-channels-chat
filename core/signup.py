from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.views.generic import CreateView
from django.urls import reverse

class SignUpForm(UserCreationForm):
    email = forms.EmailField(required=True)

    def uniqueemailvalidator(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise ValidationError('User with this Email already exists.')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].validators.append(self.uniqueemailvalidator)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ['username', 'email', 'password1','password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user

class SignUpView(CreateView):
    model = User
    form_class = SignUpForm
    template_name = 'registration/signup.html'

    def get_success_url(self):
        return reverse('home')