'''
Created on Aug 13, 2012

@author: cheesinglee
'''

from chromakin.game import ChromakinGame
from copy import deepcopy

class PlayerBase(object):
    """ Base Polychrome Player class

    Subclasses should re-implement the get_action(), decision_take(), and
    decision_draw() methods

    """

    cards = {}
    game_state = {'cards':[],'scoring':[],'piles_taken':[],
                  'piles':[],'two_player':[]}
    out = False
    name = ''
    def __init__(self,name):
        self.name=name
        self.out = False
        self.cards = dict()

    def take_cards(self,card_list):
        for c in card_list:
            self.cards[c] += 1
            
    def update(self,game_state):
        self.game_state = game_state 
        self.on_update()
        
    def on_update(self):
        pass

    def get_action(self):
        pass
    
    def end_game(self):
        pass

    def select_pile(self,new_card=-1):
        if new_card == -1:
            # select a pile to take
            return self.decision_take()
            pass
        else:
            # select a pile to put the card on
            return self.decision_draw(new_card)
            pass

    def decision_take(self):
        return 0

    def decision_draw(self,card):
        return 0

    def get_cards(self):
        return self.cards

    def is_out(self):
        return self.is_out()
    
    def can_draw(self):
        [_,idx_draw] = self.get_piles_place()
        return (len(idx_draw) > 0)
    
    def can_take(self):
        [_,idx_take] = self.get_piles_take()
        return (len(idx_take) > 0)
    
    def get_piles_take(self):
        """ get the piles which can be taken

        Returns a tuple (P,I), where P is a list of the available piles, and
        I is a list of indices corresponding to the full list of piles.

        """
        idx_take = []
        piles_take = []
        i = 0
        for p in self.game_state['piles']:
            if not self.game_state['piles_taken'][i] and len(p) > 0:
                idx_take.append(i)
                piles_take.append(p)
            i += 1
        return (piles_take,idx_take)

    def get_piles_place(self):
        """ get the piles which can accept another card

        Returns a tuple (P,I), where P is a list of the available piles, and
        I is a list of indices corresponding to the full list of piles.

        """
        idx_draw = []
        piles_draw = []
        i = 0
        for p in self.game_state['piles']:
            if not self.game_state['two_player']:
                if not self.game_state['piles_taken'][i] and len(p) < 3:
                    idx_draw.append(i)
                    piles_draw.append(p)
            else:
                if len(p) <= i and not self.game_state['piles_taken'][i]:
                    idx_draw.append(i)
                    piles_draw.append(p)
            i += 1
        return (piles_draw,idx_draw)
        
    def find_optimal_pile_take(self):
        # score each available pile and pick up the one that is worth the most
        idx = -1
        max_score = -1000
        counter = -1
        [piles_take,idx_take] = self.get_piles_take()
        for p in piles_take:
            counter += 1
            pile_score = self.evaluate_pile(p)
            if pile_score > max_score:
                max_score = pile_score
                idx = idx_take[counter]
        return idx

    def find_optimal_pile_place(self,new_card):
        # loop through each pile, and score each one with the addition of
        # the new card. place the new card where the score would be the
        # highest
        idx = -1
        max_score = -1000
        counter = -1
        [piles_draw,idx_draw] = self.get_piles_place()
        for p in piles_draw:
            counter += 1
            pile_score = self.evaluate_pile(p+[new_card])
            if pile_score > max_score:
                max_score = pile_score
                idx = idx_draw[counter]
        return idx

    def evaluate_pile(self,pile):
        """
        compute the difference in score if the player were to pick up a
        particular pile.
        """
        cards_new = deepcopy(self.cards)
        for color in pile:
            cards_new[color] += 1
        return (ChromakinGame.score(cards_new, self.game_state['scoring']) 
                - ChromakinGame.score(self.cards, self.game_state['scoring']))
        
    def __unicode__(self):
        return self.__name__
        