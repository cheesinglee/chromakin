from django.db import models
from django import forms

# Create your models here.

class Player(models.Model):
    PLAYER_TYPES = (('HU','Human'),('AI','Computer'))
    
    name = models.CharField(max_length=200) 
    games_played = models.IntegerField()
    wins = models.IntegerField()
    type = models.CharField(max_length=2, choices=PLAYER_TYPES)
    module = models.CharField('Fully-qualified module for AI implementation',
                                 max_length=200)
    description = models.CharField(max_length=800)
    
    def __unicode__(self):
        return self.name

class Game (models.Model):
    start_date = models.DateTimeField('Game Started')
    end_date = models.DateTimeField('Game Ended')
    players = models.ManyToManyField(Player)
    starting_deck = models.TextField()
    action_history = models.TextField()
    
    def __unicode__(self):
        return self.start_date