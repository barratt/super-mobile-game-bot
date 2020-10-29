#!/bin/bash

#DEVICE=PIXEL2XL
#SCREEN_HEIGHT=1440
#SCREEN_WIDTH=2880


adb shell input tap 2750 500
sleep 2s
adb shell input tap # Claim 10 minutes
# adb shell input tap 1500 1300 #done
# adb shell input tap 100 75 #back

# TODO: make a system that can take in an image, find it in the screenshot and then based off that image click an XY 

TapOnImage(1010, 1001, image)