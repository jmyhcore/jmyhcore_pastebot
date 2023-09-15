import os
import codecs
import json
import random
import time

class Archive(object):
	def __init__(self, settingsfile=None, debug=False):
		self.Command = "!archive"
		self.Cooldown = 1
		self.Response = 'template'
		self.Permission = "moderator,subscriber"
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
	
	def archivate(self, message):
		#paste = message[9:]
		if len(message) < 10:
			return u'\u0430\u0020\u043F\u0430\u0441\u0442\u0430\u002D\u0442\u043E\u0020\u043F\u0443\u0441\u0442\u0430\u044F'
		else:
			with open('Services\Scripts\paste\lib\pastaList.json', 'rb+') as f:
				f.seek(-2, os.SEEK_END)
				f.truncate()
				message = message.replace('"', "'")
				f.write(',"' + (message[9:]).encode('utf-8') +'"]}')
				f.close()
			return 'done'