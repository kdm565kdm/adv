$(document).ready(function(){
    //脚本的页数，记得完成后改为0
    var page=14;
    //对话框
    var p=$('#charts_text');
    //adv脚本推进按钮
    var btn=$('#ball_btn');
    var content=$('#content');
    var bottom=$('#bottom');
    bottom.addClass('floor');
    var switch_game_btn="<img src='/static/images/check.png' class='img-responsive' id='game_btn'>";
    btn.bind('click',adv_text_run);
    //adv脚本推进
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
    //载入战斗界面
    function load_battle(select_pm){
        var pm_obj=select_pm;
        var pokemon_u;
        var skills;
        var skills_box;

        content.html('');
        pokemon_u=new pokemon_user(pm_obj['name'],parseInt(pm_obj['hp']),parseInt(pm_obj['atk']),parseInt(pm_obj['def']),parseInt(pm_obj['sp']),pm_obj['attr']);
        learn_skills_script(pokemon_u);
        skills=pokemon_u.skills;
        bottom.removeClass('floor');
        bottom.addClass("bg_b");
        bottom.html('');
        skills_box=create_skills_box();
        bottom.append(skills_box);
        p.text('');
        add_attr_to_skills_ui(skills,pokemon_u);
    }


    //技能框生成函数
    function create_skills_box(){
        var skills_box_div;
 
        skills_box_div='<div class="col-xs-12 col-sm-12 col-md-12" id="skills_box">\
                            <div  class="col-xs-6 col-sm-6 col-md-6">\
                                <div class="col-xs-12 col-sm-12 col-md-12 skill" id="skill1" name="" attr="" harm=0></div>\
                                <div class="col-xs-12 col-sm-12 col-md-12 skill" id="skill2" name="" attr="" harm=0></div>\
                                <div class="col-xs-12 col-sm-12 col-md-12 skill" id="skill3" name="" attr="" harm=0></div>\
                                <div class="col-xs-12 col-sm-12 col-md-12 skill" id="skill4" name="" attr="" harm=0></div>\
                            </div>\
                            <div class="col-xs-6 col-sm-6 col-md-6"><p id="skill_message"><br><br>&nbsp;&nbsp;&nbsp;技能详情面板</p></div>\
                        </div>';

        return skills_box_div;
    }

    //为每一个技能框添加‘技能名’，‘属性’，‘伤害’的html属性，并绑定到用户用的精灵对象上
    function add_attr_to_skills_ui(skills, pm_obj){
        var pm_obj=pm_obj;
        console.log(pm_obj);
        var skills=skills;
        var skills_div=$('.skill');
        (function(){
            for(var i=0, len=skills_div.length; i<len; i++){
                var tem=skills_div.eq(i);
                var attr=skills[i]['attr'];
                tem.attr('name',skills[i]['name']);
                tem.attr('attr',attr);
                tem.attr('harm',skills[i]['harm']);
                tem.html('<p>'+skills[i]['name']+'</p>');
                if(attr==='火'){
                    tem.addClass('fire');
                }else if(attr==='水'){
                    tem.addClass('water');
                }else if(attr==='草'){
                    tem.addClass('plant');
                }
                tem.bind('click',function(){
                    var attr=this.getAttribute('attr');
                    var harm=this.getAttribute('harm');

                    $('#skill_message').html('<br>&nbsp;&nbsp;&nbsp;属性：'+attr+'<br><br>'+'&nbsp;&nbsp;&nbsp;伤害：'+harm)
                })

            }
        })();
    }




    //以下为精灵对象代码
    //精灵对象
    function pokemon(name,hp,atk,def,speed,attr){
        this.name=name;
        this.hp=hp;
        this.atk=atk;
        this.def=def;
        this.sp=speed;
        this.attr=attr;
        this.skills=[];
        this.live=true;
    }
    pokemon.prototype={
        constructor:pokemon,
        attack:function(enemy,skill){
            if(this.live===true){
                var ene=enemy;
                var damage=this.atk;
                var skill_harm=skill.harm;
                var res_harm;
                var boom;
                var ene_rest;
                console.log(this.name+"使用"+skill.name+"攻击了"+ene.name);

                skill_harm=attr_weakness_calculate(skill,ene,skill_harm);
                damage=attr_weakness_calculate(this,ene,damage);
                res_harm=skill_harm+damage-ene.def;
                if(res_harm<=0){
                    res_harm=10;
                }
                boom=res_harm/ene.hp*10;
                if(boom>=5){
                    console.log("效果拔群！");
                }else if(boom<=3){
                    console.log("效果不是很好");
                }
                console.log(ene.name+"受到了"+res_harm+"点伤害");
                ene_rest=ene.be_attacked(res_harm);
                if(ene_rest===0){
                    console.log(this.name+"获得了胜利！！！");
                }
                
            }
        },
        be_attacked:function(damage){
            console.log(this.name+"的原本hp是"+this.hp);
            var harm=damage-this.def;
            if(harm<=0){
                harm=10;
            }
            this.hp=this.hp-harm;
            if (this.hp<0) {
                this.hp=0;
            };
            console.log(this.name+"的剩余hp是"+this.hp+"\n\n");
            this.is_active();
            return this.hp;
        },
        is_active:function(){
            if(this.hp===0){
                this.live=false;
                console.log(this.name+"倒下了");
            }
        },
        learn_skill:function(ability){
            this.skills.push(ability);
        }
    };


    //ai精灵对象（继承自精灵对象）
    function pokemon_ai(name,hp,atk,def,speed,attr){
        pokemon.call(this,name,hp,atk,def,speed,attr);
    }
    pokemon_ai.prototype=new pokemon();
    pokemon_ai.prototype.constructor=pokemon_ai;
    pokemon_ai.prototype.max_harm_skill=function(skills,enemy){
        var skills=skills;
        var ene=enemy;
        var best_skill=best_skill_ai(skills,ene);
        return skills[best_skill];
    };
    pokemon_ai.prototype.attack=function(enemy){
        if(this.live===true){
            var ene=enemy;
            var damage=this.atk;
            var selected_skill=this.max_harm_skill(this.skills,ene);
            var skill_harm=selected_skill.harm;
            var res_harm;
            var boom;
            var ene_rest;
            console.log(this.name+"使用"+selected_skill.name+"攻击了"+ene.name);

            skill_harm=attr_weakness_calculate(selected_skill,ene,skill_harm);
            damage=attr_weakness_calculate(this,ene,damage);
            res_harm=skill_harm+damage-ene.def;
            if(res_harm<=0){
                res_harm=10;
            }
            boom=res_harm/ene.hp*10;
            if(boom>=5){
                console.log("效果拔群！");
            }else if(boom<=3){
                console.log("效果不是很好");
            }
            console.log(ene.name+"受到了"+res_harm+"点伤害");
            ene_rest=ene.be_attacked(res_harm);
            if(ene_rest===0){
                console.log(this.name+"获得了胜利！！！");
            }
            
        }   
    };

    //玩家用精灵对象（继承自精灵对象）
    function pokemon_user(name,hp,atk,def,speed,attr){
        pokemon.call(this,name,hp,atk,def,speed,attr);
    }
    pokemon_user.prototype=new pokemon();
    pokemon_user.prototype.constructor=pokemon_user;
    pokemon_user.prototype.attack=function(enemy,skill){
            if(this.live===true){
                var ene=enemy;
                var damage=this.atk;
                var skill_harm=skill.harm;
                var res_harm;
                var boom;
                var ene_rest;
                console.log(this.name+"使用"+skill.name+"攻击了"+ene.name);

                skill_harm=attr_weakness_calculate(skill,ene,skill_harm);
                damage=attr_weakness_calculate(this,ene,damage);
                res_harm=skill_harm+damage-ene.def;
                if(res_harm<=0){
                    res_harm=10;
                }
                boom=res_harm/ene.hp*10;
                if(boom>=5){
                    console.log("效果拔群！");
                }else if(boom<=3){
                    console.log("效果不是很好");
                }
                console.log(ene.name+"受到了"+res_harm+"点伤害");
                ene_rest=ene.be_attacked(res_harm);
                if(ene_rest===0){
                    console.log(this.name+"获得了胜利！！！");
                }
                
            }
    };



    //属性相克函数
    function attr_weakness_calculate(own,enemy,damage){
        var me_attr=own.attr;
        var ene_attr=enemy.attr;
        var dam=damage;
        if(me_attr===ene_attr){
            return dam;
        }
        else if(me_attr==="火"&&ene_attr==="水"){
            dam=Math.floor(dam/2);
        }else if(me_attr==="水"&&ene_attr==="火"){
            dam=dam*2;
        }else if(me_attr==="火"&&ene_attr==="草"){
            dam=dam*2;
        }else if(me_attr==="草"&&ene_attr==="火"){
            dam=Math.floor(dam/2);
        }else if(me_attr==="水"&&ene_attr==="草"){
            dam=Math.floor(dam/2);
        }else if(me_attr==="草"&&ene_attr==="水"){
            dam=dam*2;
        }

        return dam;
    }

    // function rand(start, end){
    //     return Math.floor(Math.random() * (end - start) + start);
    // }
    //最高伤害的招式
    function best_skill_ai(skills, enemy){
        var best=0;
        var skills=skills;
        var enemy=enemy;
        var harm=attr_weakness_calculate(skills[best],enemy,skills[best].harm);
        (function(){
            for(var i=0, len=skills.length; i<len; i++){
                var tem=attr_weakness_calculate(skills[i],enemy,skills[i].harm);
                if(tem>harm){
                    harm=tem;
                    best=i;
                }
            }
        })();
        return best;
    }

    //技能列表
    var skills={
                //火属性招式
                flameThrower:{name:"喷射火焰",attr:"火",harm:90},
                spark:{name:"火花",attr:"火",harm:40},
                fireFist:{name:"火焰拳",attr:"火",harm:75},
                fireTeeth:{name:"烈焰之牙",attr:"火",harm:65},
                //水属性招式
                waterGun:{name:"水枪",attr:"水",harm:40},
                surf:{name:"冲浪",attr:"水",harm:90},
                bubble:{name:"泡沫光线",attr:"水",harm:65},
                waterCannon:{name:"水之加农炮",attr:"水",harm:110},
                //草属性招式
                vineWhip:{name:"藤鞭",attr:"草",harm:45},
                razorLeaf:{name:"飞叶快刀",attr:"草",harm:55},
                leafBlade:{name:"叶刃",attr:"草",harm:90},
                leafStorm:{name:"飞叶风暴",attr:"草",harm:130},
                };

    function learn_skills_script(obj){
        var pm=obj;
        if(pm['name']==='爆炎兽'){
            pm.learn_skill(skills.flameThrower);
            pm.learn_skill(skills.spark);
            pm.learn_skill(skills.fireFist);
            pm.learn_skill(skills.fireTeeth);
        }else if(pm['name']==='水箭龟'){
            pm.learn_skill(skills.waterGun);
            pm.learn_skill(skills.surf);
            pm.learn_skill(skills.bubble);
            pm.learn_skill(skills.waterCannon);           
        }else if(pm['name']==='蜥蜴王'){
            pm.learn_skill(skills.vineWhip);
            pm.learn_skill(skills.razorLeaf);
            pm.learn_skill(skills.leafBlade);
            pm.learn_skill(skills.leafStorm);            
        }
    }
});