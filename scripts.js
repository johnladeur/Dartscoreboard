$(document).ready(function() {
   
    $("#add-player").click(function(){
        $("#players-group").find('input').first().clone().appendTo("#players-group");
    });
 
});