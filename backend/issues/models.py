from django.db import models

from django.contrib.auth.models import User

class Issue(models.Model):
    CATEGORY=[('pothole','Pothole'),('garbage','Garbage'),('streetlight','Streetlight'),('water','Water Leak'),('parks','Parks & Environment'),('safety','Safety'),('transport','Public Transport'),('other','Other')]
    STATUS=[('open','Open'),('in_progress','In Progress'),('resolved','Resolved'),('duplicate','Duplicate'),('rejected','Rejected')]

    user=models.ForeignKey(User,on_delete=models.CASCADE)
    title=models.CharField(max_length=200)
    description=models.TextField()
    category=models.CharField(max_length=20, choices=CATEGORY)
    status=models.CharField(max_length=20, choices=STATUS, default='open')

    latitude=models.FloatField()
    longitude=models.FloatField()
    geohash=models.CharField(max_length=12, blank=True)
    address=models.CharField(max_length=300, blank=True)

    photo=models.ImageField(upload_to='issues/', blank=True, null=True)
    image_hash=models.CharField(max_length=64, blank=True)

    duplicate_of=models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    support_count=models.IntegerField(default=1)

    created_at=models.DateTimeField(auto_now_add=True)

class IssueSupport(models.Model):
    issue=models.ForeignKey(Issue, on_delete=models.CASCADE)
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    class Meta:
        unique_together=('issue','user')

class Comment(models.Model):
    issue=models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    text=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)

class AdminAction(models.Model):
    issue=models.ForeignKey(Issue, on_delete=models.CASCADE)
    admin=models.ForeignKey(User, on_delete=models.CASCADE)
    action=models.CharField(max_length=100)
    remarks=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)    




class Profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE,related_name='profile')
    bio=models.CharField(max_length=200,blank=True)
    location=models.CharField(max_length=100,blank=True)
    phone=models.CharField(max_length=20,blank=True)
    avatar=models.ImageField(upload_to='avatars/',blank=True,null=True)

class Notification(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='notifications')
    kind=models.CharField(max_length=20)
    title=models.CharField(max_length=200)
    message=models.CharField(max_length=300,blank=True)
    is_read=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

def notify(user, kind, title, message=''):
    Notification.objects.create(user=user, kind=kind, title=title, message=message)


class IssueImage(models.Model):
    issue=models.ForeignKey(Issue,on_delete=models.CASCADE,related_name='extra_images')
    image=models.ImageField(upload_to='issues/')
