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
4. In the same file, look for the `DATABASES` variable, and edit the `engine` field
to be: 'django.db.backends.sqlite3'
5. If you don't have a cache set up for your django project, 
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

6. In your django project's `urls.py` add the following entry to `urlpatterns`:
    url(r'^chromakin/', include('chromakin.urls'))
        
## Running

1. In your django project directory, run `./manage.py syncdb` to populate
the database with the Chromakin data models
2. Next start the development server with `./manage.py runserver`.
3. In a web browser, navigate to [http://localhost:8000/chromakin](http://localhost:8000/chromakin) 
