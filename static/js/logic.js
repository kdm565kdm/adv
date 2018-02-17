$(document).ready(function(){
    var page=12;
    var p=$('#charts_text');
    var btn=$('#ball_btn');
    var content=$('#content');
    var bottom=$('#bottom');
    var switch_game_btn="<img src='/static/images/check.png' class='img-responsive' id='game_btn'>";
    btn.bind('click',adv_text_run);

    function adv_text_run(){
        $.ajax({
                url:'/adv/',
                type:'POST',
                data:{"page":page},
                async:true,
                dataType:'json',
                success:function(data){
                    var gal_txt=data['gal_txt'];
                    p.fadeOut("fast",function(){
                        p.text(gal_txt["text"]);
                        p.fadeIn("fast");
                    });
                    if(gal_txt.hasOwnProperty('eval')){
                        eval(gal_txt["eval"]);
                    }
                    page++;
                },
                error:function(){
                    content.html('');
                    p.fadeOut("fast",function(){
                        p.text("已经到达最后一页");
                        p.fadeIn("fast");
                    });
                    page=0;
                }
            }
        );
    }

    function load_battle(select_pm){
        var pm_obj=select_pm;
        content.html('');
        for(var index in pm_obj){
            console.log(pm_obj[index]);
        }
    }
});