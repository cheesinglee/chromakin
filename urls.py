from django.conf.urls import patterns, include, url
from django.views.generic import DetailView, ListView
from chromakin.models import Player

urlpatterns = patterns('',
    url(r'^$','chromakin.views.setup_game'),
    url(r'^startgame/$','chromakin.views.start_game')
)