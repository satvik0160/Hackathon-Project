from django.contrib import admin
from .models import Company, JobListing, JobApplication

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'location')
    search_fields = ('name', 'industry')

@admin.register(JobListing)
class JobListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'job_type', 'is_remote', 'is_active', 'posted_at')
    list_filter = ('job_type', 'is_remote', 'is_active')
    search_fields = ('title', 'company__name', 'location')
    ordering = ('-posted_at',)

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'status', 'applied_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('user__username', 'job__title')
