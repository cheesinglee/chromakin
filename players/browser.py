'''
Created on Aug 20, 2012

@author: cheesinglee
'''

from chromakin.players.base import PlayerBase

class BrowserPlayer(PlayerBase):
    '''
    Web browser interface for human player
    '''
    
    action = []
    idx = -1
    
    def set_action(self,action_input,idx_input):
        self.action = action_input
        self.idx = int(idx_input)

        is_valid = False
        if self.action == 'take':
            [_,idx_take] = self.get_piles_take()
            is_valid = self.idx in idx_take
        elif self.action == 'place':
            [_,idx_place] = self.get_piles_place()
            is_valid = self.idx in idx_place
        elif self.action == 'draw':
            is_valid = (self.game_state['cards_remaining'] > 0
                and self.game_state['last_action'][1] != 'draw')
        
        return is_valid
    
    def on_update(self):
        PlayerBase.on_update(self)
        
    def get_action(self):
        return self.action
        
    def decision_draw(self, card):
        return self.idx
    
    def decision_take(self):
        return self.idx
    
    