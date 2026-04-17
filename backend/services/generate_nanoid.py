def generate_nanoid(size: int = 10) -> str:
    """Generate a URL-safe nanoid-like string.

    Uses lowercase letters, uppercase letters, underscores, and hyphens.
    """
    import random

    alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-"
    return "".join(random.choice(alphabet) for _ in range(size))
