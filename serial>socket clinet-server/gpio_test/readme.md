# prototype setup [first build]
![alt tag](https://raw.githubusercontent.com/dattasaurabh82/camera_img_save_to_server/master/serial%3Esocket%20clinet-server/gpio_test/pictures/IMG_20170413_232524.jpg
)

# This is running in pi as a https websocket server

## Before running:`node server.js`

### 1. Install node in pi zero:
```
wget https://nodejs.org/dist/v4.4.5/node-v4.4.5-linux-armv6l.tar.gz
tar -xvf node-v4.4.5-linux-armv6l.tar.gz
cd node-v4.4.5-linux-armv6l
sudo cp -R * /usr/local/
sudo reboot
```
clone this repo(preferably in `/home/pi` {if you haven't chnaged the username}. BTW this is your default location when you ssh into pi) and then <br>
`cd /home/pi/gpio_test`

### 2. Install node packages:
```
npm install
```
 
### 3. Create self signed ssl certificates:
```
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 100 -nodes
```
[.. fill in prompts]
```
mkdir sslcert
cp key.pem sslcert/
cp cert.pem sslcert/
rm key.pem && rm cert.pem
```

### 4. Test: <br>
`node server.js`

### 5. authenticate:
::In pi::
Go to a browser(not mozilla) and type:  https://localhost:/8081 (if you haven't changed the port number)
Accept the **Risk**

::If you are in an ssh session, on the same network as pi, remotely logged in::
go to chrome and type: https://< pi's ip >:8081 (if you haven't changed the port number)
Accept the **Risk**



Then you can do 
`node server.js `
to run the secure websocket server in Pi zero. 


## Now How to make this server bootable:
### 1. Install forever.js: <br>
`sudo npm install forever -g`
### 2. My NODE path is: <br>
`/usr/local/bin/node` <br>
### and node modules path is <br>
`/usr/local/lib/node_modules` <br> 
***[notes]: you can chcek where is your node by `which node`***
### 3. In pi, My server is in folder(that is this folder) is in path: <br>
`/home/pi/gpio_test/server.js`
### 4. Create a service: <br> 
`cd /etc/init.d`
### 5. Fill it in: <br>
`sudo nano myService` <br>
Then type in ( accordingly chnage your paths if you ahve chnaged ) <br>
```
#!/bin/sh
#/etc/init.d/myService
export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules
case "$1" in
start)
exec forever --sourceDir=/home/pi/gpio_test -p /home/pi/gpio_test server.js  #scriptarguments
;;
stop)
exec forever stop --sourceDir=/home/pi/gpio_test server.js
;;
*)
echo "Usage: /etc/init.d/myService {start|stop}"
exit 1
;;
esac
exit 0
```
And make it executable: <br>
`chmod 755 /etc/init.d/myService ` <br>
### 6. Check: <br>
`sh /etc/init.d/myService start/stop` <br>
### 7. Make it bootable: <br>
`update-rc.d myService defaults`
### 8. To remove form Boot: <br>
`update-rc.d -f myService remove`

### 9. Check: <br>
`sudo reboot`


# MAKING THE GUI ON BOOTABLE WSS Pi zero SERVER WHICH SHOWS THE SERVER INNFO we can use in our web app to connect this physical controller: <br>
It is using TKinter for python 2.7 which comes bydefault in raspberry Pi zero <br>
### create a profile to appaer after boot and separate lxterminal session using absolute paths everywhere
```
sudo nano /etc/profile
sudo python /home/pi/<path to script><filename>.py
```
In our case
`sudo python /home/pi/gpio_testinfo.py`
CTRLX, Y, ENTER
```
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
@/usr/bin/python /home/pi/gpio_test/info.py
```
