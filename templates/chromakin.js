{% load chromakin_extras %}

var id_interval
var do_poll = false
var color_values = new Array()
color_values["pink"] = "#ff00ff"
color_values["blue"] = "#0000ff"
color_values["orange"] = "#ff6600"
color_values["brown"] = "#663300"
color_values["yellow"] = "#ffff00"
color_values["gray"] = "#cccccc"
color_values["green"] = "#006600"
color_values["bonus"] = "#00ffff"

var player_names

function autoSize() {
    // Copy textarea contents; browser will calculate correct height of copy,
    // which will make overall container taller, which will make textarea taller.
 var text = $("#textArea").val().replace(/\n/g, '<br/>');
    $("#textCopy").html(text);
}

function pollGame(){
    if (do_poll){
        $.ajax({
            url:"{% url chromakin.views.update_game %}",
            success:renderGameState
        })
    }
}
function setCardColor(card,color){
    if(color=='wild'){
       id = card.find('.wild_gradient').attr('id')
       card.find('.gradient').attr('xlink:href','#'+id)
       card.find('#bonus_text').hide()
    }
    else if(color=='+2'){
       id = card.find('.single_gradient').attr('id')
       card.find('.gradient').attr('xlink:href','#'+id)
       card.find('.single_gradient stop').css('stopColor',color_values['bonus'])
       card.find('#bonus_text').show()
    }
    else{
       id = card.find('.single_gradient').attr('id')
       card.find('.gradient').attr('xlink:href','#'+id)
       card.find('.single_gradient stop').css('stopColor',color_values[color])
       card.find('#bonus_text').hide()
    }
}

function enablePlayerInput(state){
    // TODO: It seems that after several player actions in a round,
    // the click events will start to fire multiple times.
    last_action = state.last_action
    
    if (last_action[1] != 'draw'){
        $('.deck').click(function(event){
            console.log('clicked on deck')
            $.ajax({
                url:"{% url chromakin.views.get_player_input %}",
                data:{action:"draw",idx:"-1"},
                success:renderGameState   
            })
            event.stopPropagation()
        })
    }
    else{
        $('.deck').unbind('click')
    }
    // if the last action was to draw, clicking a pile indicates
    // where to place the drawn card. Otherwise, it indicates which
    // pile the player wants to pick up
    if (last_action[1] == 'draw')
        action_string = "place"
    else
        action_string = "take"
        
    for (i = 0 ; i < state.piles.length ; i++){
        $('.pile').eq(i).bind('click',{idx:i},function(event){
            console.log('clicked on pile '+event.data.idx)
            $.ajax({
                url:"{%url chromakin.views.get_player_input%}",
                data:{"action":action_string,"idx":event.data.idx},
                success:renderGameState
                })
            event.stopPropagation()
        })
    }
    console.log('Player input enabled; pile onclick is: '+action_string)
}

function disablePlayerInput(){
    console.log('disabling input')
    $('.deckcontainer').unbind('click')
    $('.pile').unbind('click')
}

function animateAction(action,piles){
    action_type = action[1]
    if (action_type == 'take'){
        pile_idx = action[2]
        pile_obj = $('#pilecontainer div').eq(pile_idx)
        console.log('taking pile '+pile_idx)
        pile_obj.find('.first_card, .second_card, .third_card')
            .hide()
        $('#textArea').append('\n'+player_names[action[0]]+' takes pile '+action[2])
        $('#textArea').scrollTop(9999)
    }
    else if (action_type == 'draw'){
        color = action[2]
        setCardColor($(".drawn"),color)
        $(".drawn").show()
        $('#textArea').append('\n'+player_names[action[0]]+' draws a '+action[2])
        $('#textArea').scrollTop(9999)
    }
    else if (action_type == 'place'){        
        // compose the selector for the new card
        pile_idx = action[2]
        card_idx = piles[pile_idx].length
        selector_template = "#pilecontainer div:eq(X) object:eq(Y)"
        selector = selector_template.replace('X',String(pile_idx)) ;
        selector = selector.replace('Y',card_idx)
        pile = $('#pilecontainer .pile').eq(pile_idx)
        if (card_idx == 1){
            card = pile.find('.first_card')
        }
        else if(card_idx == 2){
            card = pile.find('.second_card')
        }
        else if(card_idx == 3){
            card = pile.find('.third_card')
        }
        
        // change the card color
        color = piles[pile_idx][card_idx-1]
        console.log('placing '+color+' on pile '+pile_idx+' position '+card_idx)
        setCardColor(card,color)
        card.show()
        $('#textArea').append('\n'+player_names[action[0]]+' places on pile '+action[2])
        $('#textArea').scrollTop(9999)
    }
}

function sortCards(cards){
    // the python dictionaries representing players's cards
    // are converted to generic JS Objects when passed from Django
    // this function creates a list of colors ordered from most cards
    // to least
    
    // TODO: order of colors with the same counts is not consistent
    
    list = []
    for (c in cards){
        if(c != 'wild' & c != '+2')
            list.push(c)
    }
    list.sort(function(a,b){
        if (cards[a] !== cards[b]){ 
            return (cards[b] - cards[a])
        }
        else{
            return (a < b) ? 1 : -1
        }})
    
    return list
}

function renderGameState(state){
    if (state.last_action[1] == 'INVALID')
        return
        
    // display round number
    $('#notification_area').html('Round '+state.n_rounds)
    if (state.last_round){
        $('#notification_area').append(' <blink>Last Round!</blink> ')
    }
    
    var game_over = state.game_over
    $('.drawn').hide()
    var last_action = state.last_action
    animateAction(last_action,state.piles)

    if (game_over){
        $("#textArea").append('\nGame Over!')
        self.clearInterval(id_interval)
        idx_winner = 0
        max_score = -99
        winner = ''
        for ( i = 0 ; i < state.n_players ; i++){
            if (state.scores[i] > max_score){
                max_score = state.scores[i]
                winner = player_names[i]
            }
        }
        $('#textArea').append('\n'+winner+' is the winner')
        $('#textArea').scrollTop(9999)
    }
    
    // hack to clear last untaken pile in 2-player game
    if (state.two_player){
        n_taken = 0 ;
        for ( i = 0 ; i < state.piles_taken.length ; i++){
            if(state.piles_taken[i]){
                n_taken += 1
            }
            
        }
        if(n_taken==2){
            animateAction([0,'take',0],state.piles)
            animateAction([0,'take',1],state.piles)
            animateAction([0,'take',2],state.piles)
        }
    }
    
    // mark taken piles
    for (i = 0 ; i < state.piles.length ; i++){
        taken_marker = $(".empty_pile").eq(i).find('#taken')
        if (state.piles_taken[i]){
            taken_marker.show()                
        }
        else{
            taken_marker.hide()
        }
    }
    
    // update player statuses
    // reset decorations
    $('.currentplayer').removeClass('currentplayer')
    $('.outplayer').removeClass('outplayer')
    
    // decorate current player
    $('.playerbox').eq(state.current_player).addClass('currentplayer')
    
    for (i=0 ; i < state.n_players; i++){
        // display score
        $('.playerbox').eq(i)
            .find('#score').html(state.scores[i])
            
        // display cards
        $('.playerbox').eq(i).find('div').remove()
        card_template = "<div class='X'></div>"
        player_cards = state.cards[i]
        sorted_cards = sortCards(player_cards)
        for (j=0 ; j < sorted_cards.length ; j++){
            color = sorted_cards[j]
            n_cards = player_cards[color]
            for (k = 0 ; k < n_cards ; k++){
                $('.playerbox').eq(i)
                    .append(card_template.replace('X',color))
            }
        }  
        $('.playerbox').eq(i)
            .find('.wilds').html(player_cards['wild'])
        $('.playerbox').eq(i)
            .find('.bonus').html(player_cards['+2'])   
        
        // decorate out players
        if(state.players_out[i]){
            $('#playercontainer>div').eq(i)
                .addClass('outplayer')
        }
    }
    
    // check if the current player is human, and pause polling
    // if necessary
    
    // TODO: currently we assume the first player is always 
    //       human.
    if (state.current_player == 0){
        enablePlayerInput(state)
        do_poll = false
    }
    else if(!do_poll && state.current_player != 0){
        disablePlayerInput()
        do_poll = true
    }
}

$(document).ready(function() {
    state = {{state|jsonify|safe}}
    player_names = {{player_names|jsonify|safe}}
    renderGameState(state)
    // do stuff when DOM is ready
    if ({{state.current_player}} != 0){
        do_poll = true
    }
    else{
        do_poll = false
    }
    
    id_interval = self.setInterval(pollGame,1000) ;
    
    $(function() {
        $(this.textBox)
            .change(autoSize)
            .keydown(autoSize)
            .keyup(autoSize);
     autoSize();
    });
    
    
});
