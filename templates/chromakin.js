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

function renderGameState(state){
    var last_action = state.last_action
    $("#textArea").val(last_action)
}

$(document).ready(function() {
    // do stuff when DOM is ready
    var id_interval = self.setInterval(pollGame,1500) ;
    
    $(function() {
        $(this.textBox)
            .change(autoSize)
            .keydown(autoSize)
            .keyup(autoSize);
     autoSize();
    });
});
