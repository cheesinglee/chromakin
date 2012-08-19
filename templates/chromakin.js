var id_interval

var color_values = new Array()
color_values["pink"] = "#ff00ff"
color_values["blue"] = "#0000ff"
color_values["orange"] = "#ff6600"
color_values["brown"] = "#663300"
color_values["yellow"] = "#ffff00"
color_values["gray"] = "#cccccc"
color_values["green"] = "#006600"
color_values["bonus"] = "#00ffff"

var color_card_url = "{{ STATIC_URL }}img/card_solid.svg"
var wild_card_url = "{{ STATIC_URL }}img/card_wild.svg"
var bonus_card_url = "{{ STATIC_URL }}img/card_bonus.svg"

function autoSize() {
    // Copy textarea contents; browser will calculate correct height of copy,
    // which will make overall container taller, which will make textarea taller.
 var text = $("#textArea").val().replace(/\n/g, '<br/>');
    $("#textCopy").html(text);
}

function pollGame(){
    $.ajax({
        url:"{% url chromakin.views.update_game %}",
        success:renderGameState
    })
}

function animateAction(action,piles){
    action_type = action[1]
    pile_idx = action[2]
    pile_obj = $('#pilecontainer span').eq(pile_idx)
    if (action_type == 'take'){
        console.log('taking pile '+pile_idx)
        pile_obj.find('.first_card, .second_card, .third_card')
            .css('visibility','hidden')
    }
    else if (action_type == 'draw'){        
        // compose the selector for the new card
        card_idx = piles[pile_idx].length
        selector_template = "#pilecontainer span:eq(X) object:eq(Y)"
        selector = selector_template.replace('X',String(pile_idx)) ;
        selector = selector.replace('Y',card_idx)
        
        // change the card color
        color = piles[pile_idx][card_idx-1]
        console.log('placing '+color+' on pile '+pile_idx+' position '+card_idx)
        if(color=='wild'){
            $(selector)[0].getSVGDocument()
                .getElementById('gradient')
                .setAttribute('xlink:href',"#wild_gradient")
            $(selector)[0].getSVGDocument()
                .getElementById('bonus_text')
                .style['visibility'] = 'hidden'
        }
        else if(color=='+2'){
            $(selector)[0].getSVGDocument()
                .getElementById('gradient')
                .setAttribute('xlink:href',"#single_gradient")
            $(selector)[0].getSVGDocument()
                .getElementById('single_gradient')
                .getElementsByTagName("stop")[0]
                .style['stop-color']=color_values['bonus']
            $(selector)[0].getSVGDocument()
                .getElementById('single_gradient')
                .getElementsByTagName("stop")[1]
                .style['stop-color']=color_values['bonus']
            $(selector)[0].getSVGDocument()
                .getElementById('bonus_text')
                .style['visibility'] = 'visible'
        }
        else{
            $(selector)[0].getSVGDocument()
                .getElementById('gradient')
                .setAttribute('xlink:href',"#single_gradient")
            $(selector)[0].getSVGDocument()
                .getElementById('single_gradient')
                .getElementsByTagName("stop")[0]
                .style['stop-color']=color_values[color]
            $(selector)[0].getSVGDocument()
                .getElementById('single_gradient')
                .getElementsByTagName("stop")[1]
                .style['stop-color']=color_values[color]
            $(selector)[0].getSVGDocument()
                .getElementById('bonus_text')
                .style['visibility'] = 'hidden'
        }
        $(selector).css('visibility','visible')
    }
}

function sortCards(cards){
    // the python dictionaries representing players's cards
    // are converted to generic JS Objects when passed from Django
    // this function creates a list of colors ordered from most cards
    // to least
    
    list = []
    for (c in cards){
        if(c != 'wild' & c != '+2')
            list.push(c)
    }
    list.sort(function(a,b){return cards[b]-cards[a]})
    
    return list
}

function renderGameState(state){
    var game_over = state.game_over
    if (!game_over){
        var last_action = state.last_action
        $("#textArea").val(last_action)
        animateAction(last_action,state.piles)
    }
    else{
        $("#textArea").val('game over!')
        self.clearInterval(id_interval)
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
        taken_marker = $(".pile")[i].getSVGDocument()
                .getElementById('taken') 
        if (state.piles_taken[i]){
            taken_marker.style['visibility']='visible'                
        }
        else{
            taken_marker.style['visibility'] = 'hidden'
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
}

$(document).ready(function() {
    // do stuff when DOM is ready
    id_interval = self.setInterval(pollGame,1000) ;
    
    $(function() {
        $(this.textBox)
            .change(autoSize)
            .keydown(autoSize)
            .keyup(autoSize);
     autoSize();
    });
});
