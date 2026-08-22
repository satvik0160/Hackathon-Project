from django.db import models
from django.conf import settings
from django.utils import timezone


class TimeStampedModel(models.Model):
    """Abstract model providing created_at and updated_at fields."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


class SoftDeleteManager(models.Manager):
    """Manager that filters out soft-deleted objects."""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class SoftDeleteModel(TimeStampedModel):
    """Abstract model providing soft delete functionality."""
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def soft_delete(self):
        """Soft delete the object."""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """Restore a soft-deleted object."""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class AuditLog(models.Model):
    """Model to track system activity and changes."""
    class ActionChoices(models.TextChoices):
        CREATE = 'CREATE', 'Create'
        UPDATE = 'UPDATE', 'Update'
        DELETE = 'DELETE', 'Delete'
        LOGIN = 'LOGIN', 'Login'
        LOGOUT = 'LOGOUT', 'Logout'
        ROLE_CHANGE = 'ROLE_CHANGE', 'Role Change'
        SKILL_VERIFY = 'SKILL_VERIFY', 'Skill Verify'
        ASSESSMENT_SUBMIT = 'ASSESSMENT_SUBMIT', 'Assessment Submit'
        APPLICATION = 'APPLICATION', 'Application'
        ADMIN_ACTION = 'ADMIN_ACTION', 'Admin Action'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50, choices=ActionChoices.choices)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=255)
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'action']),
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"{self.action} on {self.model_name} ({self.object_id}) at {self.timestamp}"


class Notification(models.Model):
    """Model for user notifications."""
    class NotificationTypeChoices(models.TextChoices):
        DAILY_TARGET = 'DAILY_TARGET', 'Daily Target'
        STREAK = 'STREAK', 'Streak'
        TEST_UNLOCK = 'TEST_UNLOCK', 'Test Unlock'
        JOB = 'JOB', 'Job'
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        INTERVIEW = 'INTERVIEW', 'Interview'
        ROADMAP = 'ROADMAP', 'Roadmap'
        ACHIEVEMENT = 'ACHIEVEMENT', 'Achievement'
        SYSTEM = 'SYSTEM', 'System'
        REMINDER = 'REMINDER', 'Reminder'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NotificationTypeChoices.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'notification_type']),
        ]

    def __str__(self):
        return f"[{self.notification_type}] {self.title} - {self.user}"


class NotificationPreference(models.Model):
    """Model for user notification preferences."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_preferences')
    notification_type = models.CharField(max_length=30, choices=Notification.NotificationTypeChoices.choices)
    is_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=False)
    push_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ['user', 'notification_type']

    def __str__(self):
        return f"{self.user} - {self.notification_type} Preferences"
