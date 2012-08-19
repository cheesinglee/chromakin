chromakin
===============

Coloretto simulator in Django

## Dependencies

* django - for django
* django-extensions - for JSONField  

## Install

1. If you don't have a django project already, start one with
`django-admin.py startproject mysite`
2. `cd` into your project directory and clone the repository
3. In your `settings.py` for your django project, add `'chromakin'`
to the `INSTALLED_APPS` list
4. If you don't have a cache set up for your django project, 
append this to the end:


    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'chromakin-cache',
            'TIMEOUT' : 3600,
            'OPTIONS': {
                'MAX_ENTRIES': 1000
            }
        }
    }
