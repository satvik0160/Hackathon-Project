from django.core.exceptions import ValidationError
import mimetypes

def validate_secure_file(value):
    """
    Validates file sizes and MIME types securely.
    """
    # Size limit: 5MB
    filesize = value.size
    if filesize > 5242880:
        raise ValidationError("The maximum file size that can be uploaded is 5MB")
    
    # MIME validation
    allowed_mimes = ['application/pdf', 'image/jpeg', 'image/png']
    mime_type, _ = mimetypes.guess_type(value.name)
    if mime_type not in allowed_mimes:
        raise ValidationError(f"Unsupported file type: {mime_type}. Please upload PDF, JPEG, or PNG.")
