import requests
import logging
import random

logger = logging.getLogger(__name__)

def generate_game_token():
    """Generate a unique game token in the format animal+number"""
    from .models import Game
    
    animals = [
        "lion", "tiger", "bear", "fox", "wolf", "panda", "koala", "zebra", "giraffe", "monkey",
        "cat", "dog", "mouse", "eagle", "owl", "shark", "whale", "dolphin", "rabbit", "frog",
        "horse", "sheep", "goat", "pig", "deer", "bat", "duck", "swan", "crab", "crow",
        "bee", "ant", "moose", "lynx", "otter", "camel", "yak", "mole", "yak", "elk"
    ]
    tries = 0
    while True:
        animal = random.choice(animals)
        number = random.randint(0, 99)
        token = f"{animal}{number:02d}"
        if not Game.objects.filter(token=token).exists():
            return token
        tries += 1
        if tries > 1000:
            raise Exception("Cannot generate unique token")

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_country_from_ip(ip_address):
    """Get country information from IP address using free API"""
    if not ip_address or ip_address in ['127.0.0.1', '::1', 'localhost']:
        return {'country_code': 'LOCAL', 'country_name': 'Local', 'flag': '🏠'}
    
    try:
        # Using free ipapi.co service
        response = requests.get(f'https://ipapi.co/{ip_address}/json/', timeout=5)
        if response.status_code == 200:
            data = response.json()
            country_code = data.get('country_code', 'UNKNOWN')
            country_name = data.get('country_name', 'Unknown')
            
            # Map country codes to flags
            flag_map = {
                'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
                'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭',
                'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮',
                'PL': '🇵🇱', 'CZ': '🇨🇿', 'SK': '🇸🇰', 'HU': '🇭🇺', 'RO': '🇷🇴',
                'BG': '🇧🇬', 'HR': '🇭🇷', 'SI': '🇸🇮', 'EE': '🇪🇪', 'LV': '🇱🇻',
                'LT': '🇱🇹', 'IE': '🇮🇪', 'PT': '🇵🇹', 'GR': '🇬🇷', 'CY': '🇨🇾',
                'MT': '🇲🇹', 'LU': '🇱🇺', 'IS': '🇮🇸', 'UA': '🇺🇦', 'BY': '🇧🇾',
                'MD': '🇲🇩', 'RU': '🌍', 'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳',
                'IN': '🇮🇳', 'AU': '🇦🇺', 'NZ': '🇳🇿', 'BR': '🇧🇷', 'AR': '🇦🇷',
                'MX': '🇲🇽', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪',
                'LOCAL': '🏠'
            }
            
            flag = flag_map.get(country_code, '🌍')
            
            return {
                'country_code': country_code,
                'country_name': country_name,
                'flag': flag
            }
    except Exception as e:
        logger.error(f"Error getting country for IP {ip_address}: {e}")
    
    return {'country_code': 'UNKNOWN', 'country_name': 'Unknown', 'flag': '🌍'}
