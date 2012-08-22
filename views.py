import logging
import uuid

from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.core.cache import cache
from django.utils import simplejson

from chromakin.game import ChromakinGame
from chromakin.models import Game, Player
from chromakin.players import *
from chromakin import EXCLUDE_AIS

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
    new_types = [ai for ai in ai_types if ai.__name__ not in known_types and
                                        ai.__name__ not in EXCLUDE_AIS]
    for ai in new_types:
        logger.debug('creating Player for '+ai.__name__)
        p = Player(type='AI',module=ai.__module__,
                   name=ai.__name__, description=ai.__doc__,
                   wins=0, games_played=0)
        p.save()
        
def setup_game(request):        
    update_ai_list()
    player_list = Player.objects.filter(type='AI')
    return render_to_response('setup_game.html',
                              {'player_list':player_list},
                              context_instance=RequestContext(request))

def start_game(request):
    import sys
    logger = logging.getLogger('chromakin.custom') 
    # instantiate player objects
    player_list = []
    for i in range(2,6):
        try:
            selected_ai = Player.objects.get(pk=request.POST['player'+str(i)])
        except:
            pass
        else:
            p = sys.modules[selected_ai.module].__dict__[selected_ai.name](selected_ai.name)
            player_list.append(p)
            
    
    human_player = browser.BrowserPlayer('You')
    player_list.insert(0, human_player)
    player_key = str(uuid.uuid4())
    logger.debug('caching player object with key '+player_key)
    cache.set(player_key,human_player,600)
    request.session['player_key'] = player_key
            
    # instantiate game object
    game = ChromakinGame(player_list,[0,1,3,6,10,15,21])
    game.initialize_game()
    
    # generate unique ID
    key = str(uuid.uuid4())
    logger.debug('saving game object with cache key ' + key)
    cache.set(key,game,600)
    request.session['game_key'] = key 
    
    
    if cache.get(key) is None or cache.get(player_key) is None:
        logger.error('failed to verify cache write!')
    game_state = game.get_game_state()
    player_names = [p.name for p in player_list]
    return render_to_response('game.html',{'state':game_state,'player_names':player_names},
                              context_instance=RequestContext(request))

def get_player_input(request):
    data = request.GET
    logger = logging.getLogger('chromakin.custom')
    logger.debug('got player input: '+str(data['action']+' '+str(data['idx'])))
    
    game_key = request.session['game_key']
    game = cache.get(game_key)
    game.update_players()
    if game.players[0].set_action(data['action'],data['idx']):
        game.step()
        game_state = game.get_game_state()
    else:
        logger.error('Invalid action!')
        game_state = game.get_game_state()
        game_state['last_action'] = (0,'INVALID',-1)
    cache.set(game_key,game,600)
    return HttpResponse(simplejson.dumps(game_state),
                        mimetype='application/json')

def update_game(request):
    logger = logging.getLogger('chromakin.custom')
    key = request.session['game_key']
#    logger.debug('Accessing cached game object with key '+key)
    game = cache.get(key)
    if game is None:
        logger.error('cache miss!')
    game.step()
    state = game.get_game_state()
    json_state = simplejson.dumps(state)
    cache.set(key,game,600)
#    logger.debug('returning JSON string: '+json_state)
    return HttpResponse(json_state,mimetype='application/json')    

def game(request):
    pass