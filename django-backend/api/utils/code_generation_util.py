import secrets
import string

ALPHANUM = string.ascii_uppercase + string.digits

def generate_institution_code(length: int = 6) -> str:
    return ''.join(secrets.choice(ALPHANUM) for _ in range(length))

def generate_organization_code(length: int = 6) -> str:
    return ''.join(secrets.choice(ALPHANUM) for _ in range(length))
