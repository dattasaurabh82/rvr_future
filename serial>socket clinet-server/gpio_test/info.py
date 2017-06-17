
#------ Un-comment this block if you have a small 1.5" RCA display attached to pizero
#------ and want to display info on it at full scale
#####################################################################################
# import Tkinter
# from Tkinter import *
# import socket

# root = Tk()

# s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# s.connect(("8.8.8.8", 80))
# myIP = s.getsockname()[0]
# print (myIP)     
# root.geometry("800x600")
# root.attributes('-fullscreen', True)
# root.configure(background='black', cursor='none')

# header = Label(root, text='USE THESE IN WEB APP', bg='black', fg='white', font=('Courier', 38))
# header.place(x=20, y=20)

# ip_lbl = Label(root, text="IP: " + str(myIP), bg='black', fg='white', font=('Courier', 40))
# ip_lbl.place(x=20, y=140)

# port_lbl = Label(root, text='PORT: 8081', bg='black', fg='white', font=('Courier', 40))
# port_lbl.place(x=20, y=210)

# s.close()
# root.mainloop()


#------ Un-comment this block if you have a small 128x32 i2c OLED attached
#------ to pizero and want to display info on it at full scale rather than RCA display
#####################################################################################

import time

import Adafruit_GPIO.SPI as SPI
import Adafruit_SSD1306

from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont

import socket

RST = 24
disp = Adafruit_SSD1306.SSD1306_128_32(rst=RST)

disp.begin()

# Clear display.
disp.clear()
disp.display()

width = disp.width
height = disp.height
image = Image.new('1', (width, height))

draw = ImageDraw.Draw(image)

# font = ImageFont.truetype('Minecraftia.ttf', 8)
fontOne = ImageFont.truetype('712_serif.ttf', 16)
fontTwo = ImageFont.truetype('712_serif.ttf', 18)


s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))
myIP = s.getsockname()[0]
print (myIP)
myIP = str(myIP)

draw.text((1, 1),    'CONTROLLER IP:',  font=fontOne, fill=255)
draw.text((1, 17), myIP, font=fontTwo, fill=255)

# Display image.
disp.image(image)
disp.display()
