import os
import codecs
import json
import random
import time
import hashlib

class GenPasta(object):
	def __init__(self, settingsfile=None, debug=False):
		file = 'Services\Scripts\paste\lib\pastaList.json'
		if (debug):
			file = 'pastaList.json'
		with codecs.open(file, encoding="utf-8", mode="r") as f:
				data = json.load(f, 'utf-8')
				self.Command = "!pasta"
				self.data = data['list']
				self.Cooldown = 1
				self.Response = 'template'
				self.Permission = "everyone"
				self.Info = ""

	def Reload(self, jsondata):
		random.seed(a=time.time())
		self.__dict__ = json.loads(jsondata, encoding="utf-8")
		return

	def Save(self, settingsfile):
		random.seed(a=time.time())
		try:
			with codecs.open(settingsfile, encoding="utf-8-sig", mode="w+") as f:
				json.dump(self.__dict__, f, encoding="utf-8")
			with codecs.open(settingsfile.replace("json", "js"), encoding="utf-8-sig", mode="w+") as f:
				f.write("var settings = {0};".format(json.dumps(self.__dict__, encoding='utf-8')))
		except:
			Parent.Log(ScriptName, "Failed to save settings to file.")
		return
	
	def generate(self):
		maxI = len(self.data)
		from random import SystemRandom
		r = SystemRandom()
		return unicode(self.data[r.randrange(maxI)])
