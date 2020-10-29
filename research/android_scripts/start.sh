#!/bin/bash

adb connect 192.168.0.34:5555 # Connect to my phone 
./unlock_phone.sh
adb shell am start -n com.scopely.startrek/com.digprm.prime.NativeAndroidActivity

sleep 15s

echo "Closing popup"

adb shell input tap 1440 275 # Close ad thats currently on. 

echo "Doing refinary"

./refinary.sh