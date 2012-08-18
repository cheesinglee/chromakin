var id_interval

var color_values = new Array()
color_values["pink"] = "#ff00ff"
color_values["blue"] = "#0000ff"
color_values["orange"] = "#ff6600"
color_values["brown"] = "#663300"
color_values["yellow"] = "#ffff00"
color_values["gray"] = "#cccccc"
color_values["green"] = "#006600"

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

function drawPile(pile,pile_idx){
    selector_template = "#pilecontainer span:eq(X)"
    pileselector = selector_template.replace("X",String(pile_idx)) ;
    
    if (pile.length == 0){
        selector = pileselector + " .first_card, .second_card, .third_card"
        $(selector).css('visibility','hidden')
    }
    else{   
        for ( i = 0 ; i < pile.length ; i++){
            var card
            if(i==0){
                selector = pileselector + ' .first_card'
                //card = $(selector).find('.first_card') 
            }
            else if(i==1){
                selector = pileselector + ' .second_card'
                //card = $selector.find('.second_card')
            }
            else if(i==2){
                selector = pileselector + ' .third_card'
                //card = $(selector).find('.third_card')
            }
            console.log(selector)
                
            if ($(selector).css('visibility') == 'hidden'){
                if (pile[i] == "wild"){
                    $(selector).attr('data',"{{ STATIC_URL }}img/card_wild.svg")
                }
                else if (pile[i] == "+2"){
                    $(selector).attr('data',"{{ STATIC_URL }}img/card_bonus.svg")
                }
                else{
                    $(selector).attr('data',color_card_url)
                    color = color_values[pile[i]]
                    $(selector)[0].getSVGDocument()
                        .getElementById('color_area')
                        .style['fill'] = color
                }
                $(selector).css('visibility','visible')
            }
        }
    }
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
            if($(selector).attr('data') != wild_card_url){
                $(selector).attr('data',wild_card_url)
            }
        }
        else if(color=='+2'){
            if($(selector).attr('data') !=bonus_card_url){
                $(selector).attr('data',bonus_card_url)
            }
        }
        else{
            if($(selector).attr('data') != color_card_url){
                $(selector).attr('data',color_card_url)
            }
            $(selector)[0].getSVGDocument().getElementById('color_area').style['fill'] = color_values[color]
        }
        $(selector).css('visibility','visible')
    }
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
}

$(document).ready(function() {
    // do stuff when DOM is ready
    id_interval = self.setInterval(pollGame,2000) ;
    
    $(function() {
        $(this.textBox)
            .change(autoSize)
            .keydown(autoSize)
            .keyup(autoSize);
     autoSize();
    });
});
