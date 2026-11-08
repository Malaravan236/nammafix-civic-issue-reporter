from rest_framework import serializers
from .models import Issue, Comment, AdminAction, Profile, Notification

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    def get_user(self, o):
        return o.user.first_name or o.user.username
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['user', 'issue']

class IssueSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    
    def get_user(self, o):
        return o.user.first_name or o.user.username

    def get_images(self, o):
        req = self.context.get('request')
        urls = ([o.photo.url] if o.photo else []) + [x.image.url for x in o.extra_images.all()]
        return [req.build_absolute_uri(u) if req else u for u in urls]

    def get_history(self, o):
        h = [{'label': 'Report Submitted', 'note': f'Report created by {o.user.first_name or o.user.username}', 'at': o.created_at}]
        for a in AdminAction.objects.filter(issue=o).order_by('created_at'):
            h.append({'label': a.action.replace('Status->', '').replace('_', ' ').title(), 'note': a.remarks, 'at': a.created_at})
        return h

    class Meta:
        model = Issue
        fields = '__all__'
        read_only_fields = ['user','geohash','image_hash','support_count','status','duplicate_of'] 
        extra_kwargs = {
            'photo': {'required': False},  
            'latitude': {'required': False},
            'longitude': {'required': False},
        }

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio', 'location', 'phone', 'avatar']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
