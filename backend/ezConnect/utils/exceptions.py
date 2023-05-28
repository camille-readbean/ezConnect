class InvalidDomainError(Exception):
    pass
    
class InvalidCredentialsError(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__("Invalid username or password")
