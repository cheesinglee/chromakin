''' chromakin.players.simple

This module contains some very simple AI implementations for Chromakin. 

Created on Aug 15, 2012

@author: cheesinglee
'''

from random import random,sample
from chromakin.players.base import PlayerBase

class RandomBot(PlayerBase):
    """ Chromakin AI player which makes all decisions randomly """
    def __init__(self,name):
        PlayerBase.__init__(self,name)
    def get_action(self):
        if random() > 0.5:
            return 'draw'
        else:
            return 'take'

    def decision_take(self):
        """ Randomly decide to take one of the available piles """
        [_,idx_take] = self.get_piles_take()
        return sample(idx_take,1)[0]

    def decision_draw(self,new_card):
        """ Randomly decide on which pile to place the drawn card """
        [_,idx_draw] = self.get_piles_draw()
        return sample(idx_draw,1)[0]

class GreedyBot(PlayerBase):
    """ A Greedy Chromakin AI

    GreedyBot always takes a pile if it will result in a score increase. It
    only draws when none of the piles are worth positive points.

    """
    def __init__(self,name):
        PlayerBase.__init__(self,name)
    def get_action(self):
        [piles_take,_] = self.get_piles_take()
        for p in piles_take:
            if self.evaluate_pile(p) > 0:
                return 'take'
        return 'draw'

    def decision_take(self):
        return self.find_optimal_pile_take()

    def decision_draw(self,new_card):
        return self.find_optimal_pile_draw(new_card)

class BuilderBot(PlayerBase):
    """
    BuilderBot will always draw if possible. It places the drawn card in the
    pile which will give the maximum score increase
    """
    def __init__(self,name):
        PlayerBase.__init__(self,name)
        
    def get_action(self):
        [_,idx_draw] = self.get_piles_draw()
        if len(idx_draw) > 0:
            return 'draw'
        else:
            return 'take'

    def decision_take(self):
        return self.find_optimal_pile_take()

    def decision_draw(self,new_card):
        return self.find_optimal_pile_draw(new_card)
