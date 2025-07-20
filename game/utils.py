import requests
import logging

logger = logging.getLogger(__name__)

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
