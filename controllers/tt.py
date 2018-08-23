import datetime
base = datetime.datetime.today()
date_list = [base + datetime.timedelta(days=x) for x in range(0, 60)]

for i in date_list:
	print("\"" + str(i.strftime("%d-%m-%y")) + "\" : [ ],")