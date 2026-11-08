from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Issue, IssueSupport, Comment, AdminAction, Profile, Notification, IssueImage, notify
from .serializers import IssueSerializer, CommentSerializer, ProfileSerializer, NotificationSerializer
from .utils import find_duplicate_issue, get_geohash, get_image_hash
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from rest_framework.pagination import PageNumberPagination
from .permissions import IsCitizen

class BigPage(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 500


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all().order_by('-created_at')
    serializer_class = IssueSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'geohash']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'support_count']

    pagination_class = BigPage

    def get_permissions(self):
        a = self.action
        if a in ('list', 'retrieve', 'nearby'):
            return [permissions.AllowAny()]
        if a == 'comments':
            return [permissions.AllowAny()] if self.request.method == 'GET' else [IsCitizen()]
        if a in ('create', 'support', 'my_reports', 'update', 'partial_update'):
            return [IsCitizen()]
        if a == 'destroy':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]  # analytics, resolve

    def perform_update(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        if serializer.instance.user != self.request.user:
            raise PermissionDenied('You can only edit your own reports.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                "You can only delete your own issues."
            )

        instance.delete()

    def perform_create(self, serializer):
        lat = serializer.validated_data.get('latitude')
        lon = serializer.validated_data.get('longitude')
        files = self.request.FILES.getlist('photos')
        extra = {'photo': files[0]} if files else {}
        issue = serializer.save(user=self.request.user, geohash=get_geohash(lat, lon) if lat and lon else "", **extra)
        for f in files[1:]:
            IssueImage.objects.create(issue=issue, image=f)
        
        if issue.photo:
            try:
                issue.image_hash = get_image_hash(issue.photo.path)
            except:
                pass
        
        dup = find_duplicate_issue(issue)
        if dup:
            issue.status = 'duplicate'
            issue.duplicate_of = dup 
            dup.support_count += 1
            dup.save()
        issue.save()

    @action(detail=True, methods=['post'])
    def support(self, request, pk=None):
        issue = self.get_object()
        obj, created = IssueSupport.objects.get_or_create(issue=issue, user=request.user)
        if not created:
            return Response({"msg": "Already supported"}, status=400)
        issue.support_count = IssueSupport.objects.filter(issue=issue).count()
        issue.save()
        if issue.user != request.user:
            notify(issue.user, 'support', f'New support on your report "{issue.title}".', f'{issue.support_count} people have supported this issue.')
        return Response({"support_count": issue.support_count})

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        issue = self.get_object()
        if request.method == 'GET':
            return Response(CommentSerializer(issue.comments.all(), many=True).data)
        Comment.objects.create(issue=issue, user=request.user, text=request.data['text'])
        if issue.user != request.user:
            notify(issue.user, 'comment', f'{request.user.first_name or request.user.username} commented on your report.', request.data['text'][:120])
        return Response({"msg": "Comment added"})

    @action(detail=False, methods=['get'])
    def my_reports(self, request):
        return Response(IssueSerializer(Issue.objects.filter(user=request.user), many=True).data)

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        try:
            lat = float(request.query_params.get('lat'))
            lon = float(request.query_params.get('lon'))
            radius_km = float(request.query_params.get('radius', 0.5)) # default 500m
            
            # Geohash precision: 7 = ~150m, 6 = ~1km
            # Same area geohash match + manual distance filter
            from .utils import get_geohash
            import math

            def haversine(lat1, lon1, lat2, lon2):
                R = 6371 # Earth radius km
                dlat = math.radians(lat2-lat1)
                dlon = math.radians(lon2-lon1)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2
                return R * 2 * math.asin(math.sqrt(a))

            # First filter by geohash prefix (fast)
            base_geohash = get_geohash(lat, lon)[:5] # 5 char = ~5km box
            candidates = Issue.objects.filter(geohash__startswith=base_geohash)
            
            nearby_issues = []
            for issue in candidates:
                if issue.latitude and issue.longitude:
                    dist = haversine(lat, lon, float(issue.latitude), float(issue.longitude))
                    if dist <= radius_km:
                        nearby_issues.append(issue)
            
            return Response(IssueSerializer(nearby_issues, many=True).data)
        except Exception as e:
            return Response({"error": str(e), "msg": "Use ?lat=11.66&lon=78.14&radius=0.5"}, status=400)    

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        return Response({
            'total': Issue.objects.count(),
            'by_category': list(Issue.objects.values('category').annotate(count=Count('id'))),
            'by_status': list(Issue.objects.values('status').annotate(count=Count('id'))),
            'heatmap_data': list(Issue.objects.values('latitude', 'longitude', 'category'))
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        issue = self.get_object()
        old_status = issue.status
        new_status = request.data.get('status', 'resolved')
        issue.status = new_status
        issue.save()
        
        # Auto Timeline Comment
        Comment.objects.create(
            issue=issue, 
            user=request.user, 
            text=f"🚀 Status changed: {old_status} → {new_status}. Remarks: {request.data.get('remarks', 'No remarks')}"
        )
        
        notify(issue.user, 'status', f'Your report "{issue.title}" is now {issue.status.replace("_", " ").title()}.', request.data.get('remarks', ''))
        AdminAction.objects.create(issue=issue, admin=request.user, action=f"Status->{issue.status}", remarks=request.data.get('remarks', ''))
        return Response({"msg": f"Marked {issue.status}", "timeline_added": True})


from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.utils import timezone

class NotificationsView(APIView):
    permission_classes = [IsCitizen]

    def get(self, request):
        qs = Notification.objects.filter(user=request.user).order_by('-created_at')[:50]
        return Response(NotificationSerializer(qs, many=True).data)
    def post(self, request):
        Notification.objects.filter(user=request.user).update(is_read=True)
        return Response({'msg': 'ok'})

class ProfileView(APIView):
    permission_classes = [IsCitizen]

    def _out(self, request, p):
        d = dict(ProfileSerializer(p, context={'request': request}).data)
        u = request.user
        d.update(name=u.first_name or u.username, email=u.email, joined=u.date_joined)
        return d

    def get(self, request):
        p, _ = Profile.objects.get_or_create(user=request.user)
        return Response(self._out(request, p))

    def put(self, request):
        p, _ = Profile.objects.get_or_create(user=request.user)
        s = ProfileSerializer(p, data=request.data, partial=True, context={'request': request})
        s.is_valid(raise_exception=True); s.save()
        u = request.user
        if 'name' in request.data: u.first_name = request.data['name']
        if 'email' in request.data: u.email = request.data['email']
        u.save()
        return Response(self._out(request, p))

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        now = timezone.now(); months = []
        for k in range(5, -1, -1):
            y, m = now.year, now.month - k
            while m < 1: m += 12; y -= 1
            qs = Issue.objects.filter(created_at__year=y, created_at__month=m)
            months.append({'label': f'{y}-{m:02d}', 'total': qs.count(), 'resolved': qs.filter(status='resolved').count()})
        return Response({
            'users': User.objects.count(), 'total': Issue.objects.count(),
            'resolved': Issue.objects.filter(status='resolved').count(),
            'pending': Issue.objects.exclude(status__in=['resolved', 'rejected']).count(),
            'by_category': list(Issue.objects.values('category').annotate(count=Count('id'))),
            'months': months,
        })


class AdminUsersView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        rows = []
        for u in User.objects.filter(is_staff=False).order_by('-date_joined'):
            rows.append({'id': u.id, 'name': u.first_name or u.username, 'email': u.email, 'joined': u.date_joined,
                         'is_active': u.is_active, 'reports': Issue.objects.filter(user=u).count()})
        return Response(rows)

    def patch(self, request, pk):
        u = User.objects.filter(pk=pk, is_staff=False).first()
        if not u:
            return Response({'detail': 'User not found.'}, status=404)
        u.is_active = bool(request.data.get('is_active'))
        u.save()
        return Response({'id': u.id, 'is_active': u.is_active})
