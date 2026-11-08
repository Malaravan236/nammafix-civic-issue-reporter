from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'password']

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, data):
        return User.objects.create_user(**data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'is_staff', 'date_joined']


class TokenSerializer(TokenObtainPairSerializer):
    staff_only = False

    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.is_staff != self.staff_only:
            raise serializers.ValidationError({'detail': 'This is an admin account. Please use the admin login page.' if self.user.is_staff else 'This account does not have admin access.'})
        data['user'] = UserSerializer(self.user).data
        return data

class AdminTokenSerializer(TokenSerializer):
    staff_only = True
