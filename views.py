from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.views.generic import ListView
import logging
from chromakin.game import ChromakinGame
from chromakin.models import Game, Player
from chromakin.players import *

# Create your views here.

#def get_player_types():
#    return [s.__name__ for s in base.PlayerBase.__subclasses__()]
#
#def setup_game(request):
#    player_list = get_player_types()
#    return render_to_response('setup_game.html',{'player_list':player_list})

def update_ai_list():
    # find all subclasses of PlayerBase
    ai_types = base.PlayerBase.__subclasses__()
    
    # ai types already present in database
    known_types = [ai.name for ai in Player.objects.filter(type='AI')]
    
    # create database entries for new players
    logger = logging.getLogger('chromakin.custom')
    new_types = [ai for ai in ai_types if ai.__name__ not in known_types]
    for ai in new_types:
        logger.debug('creating Player for '+ai.__name__)
        p = Player(type='AI',module=ai.__module__,
                   name=ai.__name__, description=ai.__doc__,
                   wins=0, games_played=0)
        p.save()
        
def setup_game(request):        
    update_ai_list()
    player_list = Player.objects.filter(type='AI')
    return render_to_response('setup_game.html',{'player_list':player_list},context_instance=RequestContext(request))

def start_game(request):
    import sys
    player_list = []
    for i in range(1,6):
        try:
            selected_ai = Player.objects.get(pk=request.POST['player'+str(i)])
        except:
            pass
        else:
            p = sys.modules[selected_ai.module].__dict__[selected_ai.name](selected_ai.name)
            player_list.append(p)
    game = ChromakinGame(player_list,[0,1,3,6,10,15,21])
    game.play()
    log = game.flush_log()
    return render_to_response('game.html',{'log':log})

def game(request):
    pass