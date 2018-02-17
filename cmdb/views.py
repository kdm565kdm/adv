import json
from django.shortcuts import render
from django.shortcuts import HttpResponse
import os
# Create your views here.
currentpath = os.getcwd()
path = currentpath+"/text.json"
fp = open(path,'r')
json_data = fp.read()
content = json.loads(json_data)
#arr=content["text"]
def adv(request):
    if request.method == "POST":
        page = request.POST.get("page", None)
        text = content[page]
        #interact = content["interact"][int(page)]
        return_json = {'gal_txt':text}
        return HttpResponse(json.dumps(return_json),content_type='application/json')
    return render(request,"adv.html",)

